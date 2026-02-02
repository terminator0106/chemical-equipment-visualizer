import os
from uuid import uuid4

from django.conf import settings
from django.db import models


def _dataset_csv_upload_to(instance: 'Dataset', filename: str) -> str:
	safe_name = os.path.basename(filename or 'dataset.csv')
	return f"uploads/user_{instance.user_id}/{uuid4().hex}_{safe_name}"


def _report_pdf_upload_to(instance: 'Report', filename: str) -> str:
	# Force a consistent naming scheme regardless of uploaded filename.
	return f"reports/user_{instance.user_id}/Report_{instance.report_number}.pdf"


class Dataset(models.Model):
	user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='datasets')
	# Keep the original filename for UI display.
	file_name = models.CharField(max_length=255)
	uploaded_at = models.DateTimeField(auto_now_add=True)
	summary = models.JSONField(default=dict, blank=True)
	# Store the actual uploaded CSV in MEDIA_ROOT so it can be retrieved later.
	csv_file = models.FileField(upload_to=_dataset_csv_upload_to, null=True, blank=True)

	class Meta:
		ordering = ['-uploaded_at', '-id']

	def __str__(self) -> str:
		return f"Dataset({self.id}) {self.file_name}"

	def save(self, *args, **kwargs):
		super().save(*args, **kwargs)
		# Keep only the newest 5 datasets per user.
		excess_qs = (
			Dataset.objects.filter(user=self.user)
			.order_by('-uploaded_at', '-id')
			.values_list('id', flat=True)[5:]
		)
		if excess_qs:
			Dataset.objects.filter(id__in=list(excess_qs)).delete()


class EquipmentRecord(models.Model):
	dataset = models.ForeignKey(Dataset, on_delete=models.CASCADE, related_name='records')
	equipment_name = models.CharField(max_length=255)
	type = models.CharField(max_length=120)
	flowrate = models.FloatField()
	pressure = models.FloatField()
	temperature = models.FloatField()

	class Meta:
		ordering = ['id']
		indexes = [
			models.Index(fields=['dataset']),
			models.Index(fields=['type']),
		]

	def __str__(self) -> str:
		return f"EquipmentRecord({self.id}) {self.equipment_name}"


class Report(models.Model):
	user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='reports')
	dataset = models.ForeignKey(Dataset, on_delete=models.CASCADE, related_name='reports')
	report_number = models.PositiveIntegerField()
	created_at = models.DateTimeField(auto_now_add=True)
	# Persist the PDF so the backend can serve it later without regenerating.
	pdf_file = models.FileField(upload_to=_report_pdf_upload_to)

	class Meta:
		ordering = ['-created_at', '-id']
		constraints = [
			models.UniqueConstraint(fields=['user', 'report_number'], name='unique_report_number_per_user'),
			models.UniqueConstraint(fields=['dataset'], name='unique_report_per_dataset'),
		]

	def __str__(self) -> str:
		return f"Report({self.id}) user={self.user_id} #{self.report_number}"
