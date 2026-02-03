import logging
import os

from django.core.files.base import ContentFile
from django.db import transaction
from django.http import HttpResponse
from rest_framework import status
from rest_framework.authentication import TokenAuthentication
from rest_framework.authtoken.models import Token
from rest_framework.parsers import FormParser, MultiPartParser
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import Dataset, EquipmentRecord, Report
from .serializers import DatasetSerializer, SignupSerializer, UploadCSVSerializer
from .utils import CSVValidationError, generate_pdf_report_bytes, parse_and_analyze_csv

logger = logging.getLogger(__name__)


class LoginView(APIView):
	permission_classes = [AllowAny]

	def post(self, request):
		# Backward compatible: accept either username or email.
		username = request.data.get('username')
		email = request.data.get('email')
		password = request.data.get('password')
		if (not username and not email) or not password:
			return Response(
				{'detail': 'email (or username) and password are required.'},
				status=status.HTTP_400_BAD_REQUEST,
			)

		from django.contrib.auth import authenticate
		from django.contrib.auth import get_user_model

		if email and not username:
			User = get_user_model()
			user_obj = User.objects.filter(email__iexact=email.strip()).first()
			username = user_obj.username if user_obj else None

		user = authenticate(request, username=username, password=password)
		if not user:
			return Response({'detail': 'Invalid credentials.'}, status=status.HTTP_401_UNAUTHORIZED)

		token, _ = Token.objects.get_or_create(user=user)
		return Response({'token': token.key})


class SignupView(APIView):
	permission_classes = [AllowAny]

	def post(self, request):
		serializer = SignupSerializer(data=request.data)
		if not serializer.is_valid():
			return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

		user = serializer.save()
		token, _ = Token.objects.get_or_create(user=user)
		return Response(
			{
				'token': token.key,
				'user': {
					'id': user.id,
					'name': f"{user.first_name} {user.last_name}".strip(),
					'email': user.email,
					'username': user.username,
				},
			},
			status=status.HTTP_201_CREATED,
		)


class UploadCSVView(APIView):
	authentication_classes = [TokenAuthentication]
	permission_classes = [IsAuthenticated]
	parser_classes = [MultiPartParser, FormParser]

	def post(self, request):
		serializer = UploadCSVSerializer(data=request.data)
		if not serializer.is_valid():
			return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

		uploaded_file = serializer.validated_data['file']

		safe_original = os.path.basename(uploaded_file.name)
		try:
			try:
				uploaded_file.seek(0)
			except Exception:
				pass
			summary, df = parse_and_analyze_csv(uploaded_file, return_df=True)
		except CSVValidationError as exc:
			return Response({'detail': str(exc)}, status=status.HTTP_400_BAD_REQUEST)
		except Exception as exc:
			logger.exception('Unexpected error during CSV analytics')
			return Response({'detail': f'Failed to process CSV: {exc}'}, status=status.HTTP_400_BAD_REQUEST)

		with transaction.atomic():
			dataset = Dataset.objects.create(user=request.user, file_name=safe_original, summary=summary)

			# Persist the CSV file in MEDIA_ROOT and link it in the DB.
			try:
				try:
					uploaded_file.seek(0)
				except Exception:
					pass
				dataset.csv_file.save(safe_original, uploaded_file, save=True)
			except Exception:
				logger.exception('Failed to store uploaded CSV on Dataset.csv_file; continuing without file persistence.')

			# Persist per-row CSV data in the DB.
			records = []
			for _, row in df.iterrows():
				records.append(
					EquipmentRecord(
						dataset=dataset,
						equipment_name=str(row['Equipment Name']),
						type=str(row['Type']),
						flowrate=float(row['Flowrate']),
						pressure=float(row['Pressure']),
						temperature=float(row['Temperature']),
					)
				)
			EquipmentRecord.objects.bulk_create(records, batch_size=1000)

		return Response({'dataset_id': dataset.id, 'summary': dataset.summary}, status=status.HTTP_201_CREATED)


class DatasetSummaryView(APIView):
	authentication_classes = [TokenAuthentication]
	permission_classes = [IsAuthenticated]

	def get(self, request, dataset_id: int):
		try:
			dataset = Dataset.objects.get(id=dataset_id, user=request.user)
		except Dataset.DoesNotExist:
			return Response({'detail': 'Not found.'}, status=status.HTTP_404_NOT_FOUND)
		# Check if a limit parameter is provided
		limit = request.query_params.get('limit')
		if limit:
			try:
				limit = int(limit)
				# Get limited records and recalculate summary
				records = EquipmentRecord.objects.filter(dataset=dataset).order_by('id')[:limit]
				if records:
					import pandas as pd
					data = [{
						'Equipment Name': r.equipment_name,
						'Type': r.type,
						'Flowrate': r.flowrate,
						'Pressure': r.pressure,
						'Temperature': r.temperature,
					} for r in records]
					df = pd.DataFrame(data)
					
					total_equipment = len(df)
					avg_flowrate = float(df['Flowrate'].mean())
					avg_pressure = float(df['Pressure'].mean())
					avg_temperature = float(df['Temperature'].mean())
					max_temperature = float(df['Temperature'].max())
					
					type_distribution_series = df['Type'].astype(str).value_counts(dropna=False)
					equipment_type_distribution = {str(k): int(v) for k, v in type_distribution_series.to_dict().items()}
					
					avg_metrics_per_type = {}
					for equip_type in df['Type'].unique():
						type_df = df[df['Type'] == equip_type]
						avg_metrics_per_type[str(equip_type)] = {
							'avg_flowrate': float(type_df['Flowrate'].mean()),
							'avg_pressure': float(type_df['Pressure'].mean()),
							'avg_temperature': float(type_df['Temperature'].mean()),
						}
					
					limited_summary = {
						'total_equipment': total_equipment,
						'average_flowrate': avg_flowrate,
						'average_pressure': avg_pressure,
						'average_temperature': avg_temperature,
						'max_temperature': max_temperature,
						'equipment_type_distribution': equipment_type_distribution,
						'avg_metrics_per_type': avg_metrics_per_type,
					}
					return Response({'dataset_id': dataset.id, 'summary': limited_summary})
			except (ValueError, TypeError):
				pass
		return Response({'dataset_id': dataset.id, 'summary': dataset.summary})

class DatasetCSVDataView(APIView):
	authentication_classes = [TokenAuthentication]
	permission_classes = [IsAuthenticated]

	def get(self, request, dataset_id: int):
		try:
			dataset = Dataset.objects.get(id=dataset_id, user=request.user)
		except Dataset.DoesNotExist:
			return Response({'detail': 'Not found.'}, status=status.HTTP_404_NOT_FOUND)

		# Get limit parameter (default to all records)
		limit = request.query_params.get('limit')
		records_query = EquipmentRecord.objects.filter(dataset=dataset).order_by('id')
		total_count = records_query.count()
		
		if limit:
			try:
				limit = int(limit)
				records_query = records_query[:limit]
			except (ValueError, TypeError):
				pass
		
		records = records_query.values('equipment_name', 'type', 'flowrate', 'pressure', 'temperature')
		return Response({
			'dataset_id': dataset.id,
			'total_count': total_count,
			'data': list(records)
		})

class HistoryView(APIView):
	authentication_classes = [TokenAuthentication]
	permission_classes = [IsAuthenticated]

	def get(self, request):
		qs = Dataset.objects.filter(user=request.user).order_by('-uploaded_at', '-id')[:5]
		return Response(DatasetSerializer(qs, many=True).data)


class ReportView(APIView):
	authentication_classes = [TokenAuthentication]
	permission_classes = [IsAuthenticated]

	def get(self, request, dataset_id: int):
		try:
			dataset = Dataset.objects.get(id=dataset_id, user=request.user)
		except Dataset.DoesNotExist:
			return Response({'detail': 'Not found.'}, status=status.HTTP_404_NOT_FOUND)

		# Force regeneration to always get the latest PDF format
		# (Comment out the caching section below if you want to re-enable caching)
		# report = Report.objects.filter(dataset=dataset).first()
		# if report and report.pdf_file:
		# 	pdf_bytes = report.pdf_file.read()
		# 	response = HttpResponse(pdf_bytes, content_type='application/pdf')
		# 	response['Content-Disposition'] = f'attachment; filename="Report {report.report_number}.pdf"'
		# 	return response

		dataset_name = os.path.basename(dataset.file_name)
		pdf_bytes = generate_pdf_report_bytes(
			dataset_name=dataset_name,
			uploaded_at=dataset.uploaded_at.isoformat(),
			summary=dataset.summary,
		)

		with transaction.atomic():
			# Check if report already exists
			report = Report.objects.filter(dataset=dataset).first()
			if report:
				# Update existing report with new PDF
				report.pdf_file.delete(save=False)
				report.pdf_file.save(
					f"Report {report.report_number}.pdf",
					ContentFile(pdf_bytes),
					save=True,
				)
			else:
				# Allocate the next report number for this user.
				last_number = (
					Report.objects.filter(user=request.user)
					.order_by('-report_number')
					.values_list('report_number', flat=True)
					.first()
				)
				next_number = int(last_number or 0) + 1
				report = Report.objects.create(user=request.user, dataset=dataset, report_number=next_number, pdf_file=None)
				report.pdf_file.save(
					f"Report {next_number}.pdf",
					ContentFile(pdf_bytes),
					save=True,
				)

		response = HttpResponse(pdf_bytes, content_type='application/pdf')
		response['Content-Disposition'] = f'attachment; filename="Report {report.report_number}.pdf"'
		return response
