from __future__ import annotations

import os
from typing import Any, Dict, List, Optional

from PyQt5 import QtCore, QtWidgets

from api_client import ApiClient
from auth import ApiWorker
from ui_components import (
    CardFrame,
    MetricBadge,
    MutedLabel,
    OutlineButton,
    PageTitle,
    PrimaryButton,
    SectionTitle,
    SPACING,
)


class HistoryDatasetCard(CardFrame):
    view_requested = QtCore.pyqtSignal(int)
    pdf_requested = QtCore.pyqtSignal(int)

    def __init__(self, dataset: Dict[str, Any], parent=None):
        super().__init__(parent, padding=20, hover=True)
        self.dataset = dataset
        dataset_id = int(dataset.get("id"))
        summary = dataset.get("summary") or {}

        # Replace the default VBoxLayout with HBoxLayout
        QtWidgets.QWidget().setLayout(self.layout())  # Clear existing layout
        main_layout = QtWidgets.QHBoxLayout(self)
        main_layout.setContentsMargins(20, 20, 20, 20)
        main_layout.setSpacing(SPACING.gap_lg)
        
        # Left side: file info and metrics
        left_col = QtWidgets.QVBoxLayout()
        left_col.setSpacing(12)
        
        # Header row: icon + filename + status
        header_row = QtWidgets.QHBoxLayout()
        header_row.setSpacing(10)
        
        icon_label = QtWidgets.QLabel("📊")
        icon_label.setStyleSheet("font-size: 48px; background: transparent;")
        
        filename = (dataset.get("file_name") or "dataset").split("/")[-1]
        name_label = SectionTitle(filename)
        name_label.setStyleSheet("font-size: 20px; font-weight: 800; background: transparent; color: #E5E7EB;")
        
        status_badge = QtWidgets.QLabel("ACTIVE")
        status_badge.setObjectName("StatusActive")
        
        header_row.addWidget(icon_label)
        header_row.addWidget(name_label)
        header_row.addWidget(status_badge)
        header_row.addStretch()
        
        # Date
        uploaded = dataset.get("uploaded_at") or ""
        date_label = MutedLabel(f"📅 {uploaded}")
        date_label.setStyleSheet("font-size: 15px; color: #9CA3AF; background: transparent;")
        
        # Metrics badges row
        metrics_row = QtWidgets.QHBoxLayout()
        metrics_row.setSpacing(10)
        
        total = str(int(summary.get("total_equipment") or 0))
        flow = _fmt_float(summary.get("average_flowrate"), 1)
        press = _fmt_float(summary.get("average_pressure"), 1)
        temp = _fmt_float(summary.get("average_temperature"), 1)
        
        metrics_row.addWidget(MetricBadge(total, "Equipment", "blue"))
        metrics_row.addWidget(MetricBadge(flow, "Avg Flow", "teal"))
        metrics_row.addWidget(MetricBadge(press, "Avg Pressure", "indigo"))
        metrics_row.addWidget(MetricBadge(temp + "°F", "Avg Temp", "emerald"))
        metrics_row.addStretch()
        
        left_col.addLayout(header_row)
        left_col.addWidget(date_label)
        left_col.addLayout(metrics_row)
        
        # Right side: action buttons
        right_col = QtWidgets.QVBoxLayout()
        right_col.setSpacing(12)
        
        view_btn = PrimaryButton("View Analytics")
        view_btn.setStyleSheet("min-width: 220px; font-size: 17px; min-height: 56px;")
        view_btn.clicked.connect(lambda: self.view_requested.emit(dataset_id))
        
        pdf_btn = OutlineButton("📄 Download PDF")
        pdf_btn.setStyleSheet("min-width: 220px; font-size: 17px; min-height: 56px;")
        pdf_btn.clicked.connect(lambda: self.pdf_requested.emit(dataset_id))
        
        right_col.addWidget(view_btn)
        right_col.addWidget(pdf_btn)
        right_col.addStretch()
        
        main_layout.addLayout(left_col, 1)
        main_layout.addLayout(right_col)


def _fmt_float(v: Any, digits: int = 2) -> str:
    try:
        return f"{float(v):.{digits}f}"
    except Exception:
        return "0.0"


class HistoryWidget(QtWidgets.QWidget):
    dataset_selected = QtCore.pyqtSignal(int, dict)
    request_open_pdf = QtCore.pyqtSignal(bytes, str)

    def __init__(self, api: ApiClient, parent=None):
        super().__init__(parent)
        self.api = api
        self._worker: Optional[ApiWorker] = None

        root = QtWidgets.QVBoxLayout(self)
        root.setContentsMargins(50, 40, 50, 40)
        root.setSpacing(SPACING.gap_lg)

        # Header
        header = QtWidgets.QVBoxLayout()
        header.setSpacing(8)
        
        title = PageTitle("Upload History")
        title.setStyleSheet("font-size: 38px; font-weight: 900; background: transparent; color: #E5E7EB;")
        
        subtitle = MutedLabel("View and manage your last 5 uploaded datasets")
        subtitle.setStyleSheet("font-size: 18px; color: #9CA3AF; background: transparent;")
        
        header.addWidget(title)
        header.addWidget(subtitle)

        # List container
        self.list_container = QtWidgets.QWidget()
        self.list_layout = QtWidgets.QVBoxLayout(self.list_container)
        self.list_layout.setContentsMargins(0, 0, 0, 0)
        self.list_layout.setSpacing(SPACING.gap_md)
        self.list_layout.addStretch(1)

        scroll = QtWidgets.QScrollArea()
        scroll.setWidgetResizable(True)
        scroll.setFrameShape(QtWidgets.QFrame.NoFrame)
        scroll.setWidget(self.list_container)

        root.addLayout(header)
        root.addWidget(scroll, 1)

        self._set_empty()

    def _set_empty(self) -> None:
        while self.list_layout.count() > 1:
            item = self.list_layout.takeAt(0)
            w = item.widget()
            if w is not None:
                w.deleteLater()

        empty_card = CardFrame(padding=60, hover=False)
        empty_card.layout().setAlignment(QtCore.Qt.AlignCenter)
        
        empty_icon = QtWidgets.QLabel("📂")
        empty_icon.setAlignment(QtCore.Qt.AlignCenter)
        empty_icon.setStyleSheet("font-size: 120px; background: transparent;")
        
        empty_title = SectionTitle("No Upload History")
        empty_title.setAlignment(QtCore.Qt.AlignCenter)
        empty_title.setStyleSheet("font-size: 28px; font-weight: 900; background: transparent; color: #E5E7EB;")
        
        empty_body = MutedLabel("You haven't uploaded any datasets yet")
        empty_body.setAlignment(QtCore.Qt.AlignCenter)
        empty_body.setStyleSheet("font-size: 17px; color: #9CA3AF; background: transparent;")
        empty_card.layout().addWidget(empty_icon)
        empty_card.layout().addWidget(empty_title)
        empty_card.layout().addWidget(empty_body)
        
        self.list_layout.insertWidget(0, empty_card)

    def refresh(self) -> None:
        def work():
            return self.api.get_history()

        self._worker = ApiWorker(work, self)
        self._worker.succeeded.connect(self._ok)
        self._worker.failed.connect(self._failed)
        self._worker.start()

    def _ok(self, datasets: List[Dict[str, Any]]):
        self._render(datasets)

    def _failed(self, message: str):
        self._set_empty()

    def _render(self, datasets: List[Dict[str, Any]]):
        while self.list_layout.count() > 1:
            item = self.list_layout.takeAt(0)
            w = item.widget()
            if w is not None:
                w.deleteLater()

        if not datasets:
            self._set_empty()
            return

        for d in datasets:
            card = HistoryDatasetCard(d)
            card.view_requested.connect(lambda dataset_id, d=d: self.dataset_selected.emit(dataset_id, d.get("summary") or {}))
            card.pdf_requested.connect(self._download_pdf)
            self.list_layout.insertWidget(self.list_layout.count() - 1, card)

    def _download_pdf(self, dataset_id: int) -> None:
        def work():
            return self.api.download_report(dataset_id)

        self._worker = ApiWorker(work, self)
        self._worker.succeeded.connect(lambda r: self.request_open_pdf.emit(r[0], r[1]))
        self._worker.failed.connect(lambda _msg: None)
        self._worker.start()
