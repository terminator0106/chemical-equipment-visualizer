from __future__ import annotations

import os
from datetime import datetime
from typing import Any, Dict, List, Optional

from PyQt5 import QtCore, QtWidgets, QtGui

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
        main_layout.setContentsMargins(24, 24, 24, 24)
        main_layout.setSpacing(SPACING.gap_lg)
        
        # Left side: file info and metrics
        left_col = QtWidgets.QVBoxLayout()
        left_col.setSpacing(16)
        
        # Header row: icon + filename + status
        header_row = QtWidgets.QHBoxLayout()
        header_row.setSpacing(12)
        
        icon_label = QtWidgets.QLabel("📊")
        icon_label.setStyleSheet("font-size: 40px; background: transparent;")
        
        filename = (dataset.get("file_name") or "dataset").split("/")[-1]
        name_label = SectionTitle(filename)
        name_label.setStyleSheet("font-size: 24px; font-weight: 900; background: transparent; color: #E5E7EB;")
        
        header_row.addWidget(icon_label)
        header_row.addWidget(name_label)
        header_row.addStretch()
        
        # Date and status row
        date_status_row = QtWidgets.QHBoxLayout()
        date_status_row.setSpacing(10)
        
        uploaded = dataset.get("uploaded_at") or ""
        formatted_date = self._format_date(uploaded)
        date_label = MutedLabel(f"{formatted_date}")
        date_label.setStyleSheet("font-size: 14px; color: #9CA3AF; background: transparent;")
        
        status_badge = QtWidgets.QLabel("ACTIVE")
        status_badge.setObjectName("StatusActive")
        
        date_status_row.addWidget(date_label)
        date_status_row.addWidget(status_badge)
        date_status_row.addStretch()
        
        # Metrics badges row - More prominent like website
        metrics_row = QtWidgets.QHBoxLayout()
        metrics_row.setSpacing(12)
        
        total = str(int(summary.get("total_equipment") or 0))
        flow = _fmt_float(summary.get("average_flowrate"), 1)
        press = _fmt_float(summary.get("average_pressure"), 1)
        temp = _fmt_float(summary.get("average_temperature"), 1)
        
        # Create enhanced metric badges with bigger values
        metrics_row.addWidget(self._create_metric_badge(total, "EQUIPMENT", "blue"))
        metrics_row.addWidget(self._create_metric_badge(flow, "AVG FLOW", "teal"))
        metrics_row.addWidget(self._create_metric_badge(press, "AVG PSI", "indigo"))
        metrics_row.addWidget(self._create_metric_badge(temp + "°F", "AVG TEMP", "emerald"))
        metrics_row.addStretch()
        
        left_col.addLayout(header_row)
        left_col.addLayout(date_status_row)
        left_col.addSpacing(8)
        left_col.addLayout(metrics_row)
        
        # Right side: action buttons
        right_col = QtWidgets.QVBoxLayout()
        right_col.setSpacing(12)
        
        view_btn = PrimaryButton("View Analytics")
        view_btn.setStyleSheet("""
            min-width: 220px; 
            font-size: 16px; 
            font-weight: 700;
            min-height: 48px;
            padding: 12px 24px;
        """)
        view_btn.clicked.connect(lambda: self.view_requested.emit(dataset_id))
        
        pdf_btn = OutlineButton("📄 Download PDF")
        pdf_btn.setStyleSheet("""
            min-width: 220px; 
            font-size: 14px; 
            font-weight: 600;
            min-height: 48px;
            padding: 12px 24px;
        """)
        pdf_btn.clicked.connect(lambda: self.pdf_requested.emit(dataset_id))
        
        right_col.addWidget(view_btn)
        right_col.addWidget(pdf_btn)
        right_col.addStretch()
        
        main_layout.addLayout(left_col, 1)
        main_layout.addLayout(right_col)

    def _format_date(self, date_string: str) -> str:
        """Format date to match website: 'Feb 3, 2026, 02:10 AM'"""
        try:
            # Parse ISO format datetime
            dt = datetime.fromisoformat(date_string.replace('Z', '+00:00'))
            # Format like website
            return dt.strftime("%b %d, %Y, %I:%M %p")
        except Exception:
            return date_string
    
    def _create_metric_badge(self, value: str, label: str, color: str) -> QtWidgets.QFrame:
        """Create enhanced metric badge matching website style"""
        frame = QtWidgets.QFrame()
        frame.setObjectName(f"MetricBadge_{color}")
        frame.setMinimumWidth(110)
        
        layout = QtWidgets.QVBoxLayout(frame)
        layout.setContentsMargins(16, 12, 16, 12)
        layout.setSpacing(4)
        
        # Value - larger and bolder
        value_label = QtWidgets.QLabel(value)
        value_label.setObjectName("MetricValueLarge")
        value_label.setStyleSheet(f"""
            font-size: 26px;
            font-weight: 900;
            color: {self._get_color_for_badge(color)};
            background: transparent;
        """)
        
        # Label - uppercase and smaller
        label_widget = QtWidgets.QLabel(label)
        label_widget.setObjectName("MetricLabel")
        label_widget.setStyleSheet("""
            font-size: 11px;
            color: #9CA3AF;
            background: transparent;
            font-weight: 700;
            letter-spacing: 0.5px;
        """)
        
        layout.addWidget(value_label)
        layout.addWidget(label_widget)
        
        return frame
    
    def _get_color_for_badge(self, color: str) -> str:
        """Get color value for badge type"""
        colors = {
            "blue": "#60A5FA",
            "teal": "#2DD4BF",
            "indigo": "#818CF8",
            "emerald": "#34D399"
        }
        return colors.get(color, "#60A5FA")


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

        # Header - matching website style
        header = QtWidgets.QVBoxLayout()
        header.setSpacing(12)
        
        # Title container with icon
        title_row = QtWidgets.QHBoxLayout()
        
        # Gradient title (simulated with color since QSS doesn't support gradient text)
        title = PageTitle("Upload History")
        title.setObjectName("HistoryPageTitle")
        title.setStyleSheet("""
            font-size: 56px; 
            font-weight: 900; 
            background: transparent; 
            color: qlineargradient(x1:0, y1:0, x2:1, y2:0,
                stop:0 #22D3EE,
                stop:0.5 #60A5FA,
                stop:1 #A78BFA);
        """)
        
        # Emoji icon
        icon_label = QtWidgets.QLabel("📚")
        icon_label.setStyleSheet("font-size: 70px; background: transparent;")
        
        title_row.addWidget(title)
        title_row.addStretch()
        title_row.addWidget(icon_label)
        
        # Subtitle
        subtitle = MutedLabel("View and manage your uploaded datasets • Last 5 uploads")
        subtitle.setStyleSheet("font-size: 18px; color: #9CA3AF; background: transparent; font-weight: 300;")
        
        # Gradient divider line
        divider_line = QtWidgets.QFrame()
        divider_line.setObjectName("GradientDivider")
        divider_line.setFixedHeight(4)
        divider_line.setStyleSheet("""
            QFrame#GradientDivider {
                background: qlineargradient(x1:0, y1:0, x2:1, y2:0,
                    stop:0 #06B6D4,
                    stop:0.5 #3B82F6,
                    stop:1 #8B5CF6);
                border-radius: 2px;
                border: none;
            }
        """)
        
        header.addLayout(title_row)
        header.addWidget(subtitle)
        header.addWidget(divider_line)

        # List container
        self.list_container = QtWidgets.QWidget()
        self.list_layout = QtWidgets.QVBoxLayout(self.list_container)
        self.list_layout.setContentsMargins(0, 0, 0, 0)
        self.list_layout.setSpacing(20)  # Increased spacing between cards
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

        empty_card = CardFrame(padding=80, hover=False)
        empty_card.layout().setAlignment(QtCore.Qt.AlignCenter)
        
        empty_icon = QtWidgets.QLabel("📂")
        empty_icon.setAlignment(QtCore.Qt.AlignCenter)
        empty_icon.setStyleSheet("font-size: 140px; background: transparent;")
        
        empty_title = SectionTitle("No Upload History")
        empty_title.setAlignment(QtCore.Qt.AlignCenter)
        empty_title.setStyleSheet("font-size: 32px; font-weight: 900; background: transparent; color: #E5E7EB; margin-top: 20px;")
        
        empty_body = MutedLabel("You haven't uploaded any datasets yet")
        empty_body.setAlignment(QtCore.Qt.AlignCenter)
        empty_body.setStyleSheet("font-size: 18px; color: #9CA3AF; background: transparent; font-weight: 300; margin-top: 10px;")
        
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
