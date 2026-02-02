from django.contrib import admin

from .models import Dataset, EquipmentRecord, Report


class EquipmentRecordInline(admin.TabularInline):
	model = EquipmentRecord
	extra = 0
	fields = ('equipment_name', 'type', 'flowrate', 'pressure', 'temperature')
	readonly_fields = fields
	can_delete = False


class ReportInline(admin.TabularInline):
	model = Report
	extra = 0
	fields = ('report_number', 'created_at', 'pdf_file')
	readonly_fields = ('report_number', 'created_at', 'pdf_file')
	can_delete = False


@admin.register(Dataset)
class DatasetAdmin(admin.ModelAdmin):
	list_display = ('id', 'user', 'file_name', 'uploaded_at')
	list_filter = ('uploaded_at',)
	search_fields = ('file_name', 'user__username', 'user__email')
	readonly_fields = ('uploaded_at',)
	inlines = [ReportInline, EquipmentRecordInline]


@admin.register(EquipmentRecord)
class EquipmentRecordAdmin(admin.ModelAdmin):
	list_display = ('id', 'dataset', 'equipment_name', 'type', 'flowrate', 'pressure', 'temperature')
	list_filter = ('type',)
	search_fields = ('equipment_name', 'type')


@admin.register(Report)
class ReportAdmin(admin.ModelAdmin):
	list_display = ('id', 'user', 'dataset', 'report_number', 'created_at')
	list_filter = ('created_at',)
	search_fields = ('user__username', 'user__email', 'dataset__file_name')
