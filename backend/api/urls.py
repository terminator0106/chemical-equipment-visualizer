from django.urls import path

from .views import HistoryView, LoginView, ReportView, DatasetSummaryView, SignupView, UploadCSVView

urlpatterns = [
    path('login/', LoginView.as_view(), name='login'),
    path('signup/', SignupView.as_view(), name='signup'),
    path('upload/', UploadCSVView.as_view(), name='upload'),
    path('summary/<int:dataset_id>/', DatasetSummaryView.as_view(), name='summary'),
    path('history/', HistoryView.as_view(), name='history'),
    path('report/<int:dataset_id>/', ReportView.as_view(), name='report'),
]
