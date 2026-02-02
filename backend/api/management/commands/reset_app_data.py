import shutil

from django.conf import settings
from django.core.management.base import BaseCommand

from api.models import Dataset, EquipmentRecord, Report


class Command(BaseCommand):
	help = "Delete all uploaded datasets/rows/reports and optionally remove uploaded media files."

	def add_arguments(self, parser):
		parser.add_argument(
			"--delete-media",
			action="store_true",
			help="Also delete MEDIA_ROOT/uploads and MEDIA_ROOT/reports folders.",
		)

	def handle(self, *args, **options):
		delete_media = bool(options.get("delete_media"))

		report_count = Report.objects.count()
		record_count = EquipmentRecord.objects.count()
		dataset_count = Dataset.objects.count()

		# Delete DB rows first (cascades will handle related objects too).
		Report.objects.all().delete()
		EquipmentRecord.objects.all().delete()
		Dataset.objects.all().delete()

		self.stdout.write(
			self.style.SUCCESS(
				f"Deleted {dataset_count} datasets, {record_count} equipment records, {report_count} reports."
			)
		)

		if delete_media:
			uploads_dir = settings.MEDIA_ROOT / "uploads"
			reports_dir = settings.MEDIA_ROOT / "reports"

			for path in (uploads_dir, reports_dir):
				try:
					shutil.rmtree(path, ignore_errors=True)
					self.stdout.write(self.style.SUCCESS(f"Deleted media folder: {path}"))
				except Exception as exc:
					self.stdout.write(self.style.WARNING(f"Failed to delete {path}: {exc}"))
