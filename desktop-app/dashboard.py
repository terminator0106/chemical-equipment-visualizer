from __future__ import annotations

import os
from typing import Any, Dict, List, Optional

from PyQt5 import QtCore, QtGui, QtWidgets

from matplotlib.backends.backend_qt5agg import FigureCanvasQTAgg as FigureCanvas

from api_client import ApiClient
from auth import ApiWorker
from charts import DARK, Theme, figure_avg_metrics_per_type, figure_bar_type_distribution, figure_donut_share, figure_optional_radar
from ui_components import (
    CardFrame,
    KPICardWidget,
    MutedLabel,
    PageTitle,
    PrimaryButton,
    SectionTitle,
    SPACING,
)


def _fmt_float(v: Any, digits: int = 2) -> str:
    try:
        return f"{float(v):.{digits}f}"
    except Exception:
        return "0.00"


class ChartCard(CardFrame):
    def __init__(self, title: str, parent=None):
        super().__init__(parent, padding=28, hover=False)  # More padding
        
        self.title_label = SectionTitle(title)
        self.title_label.setStyleSheet("font-size: 20px; font-weight: 700; color: #E2E8F0;")  # Bigger title
        
        self.placeholder = MutedLabel("No data available")
        self.placeholder.setAlignment(QtCore.Qt.AlignCenter)
        self.placeholder.setStyleSheet("padding: 80px; font-size: 16px; color: #64748B;")  # Larger placeholder
        
        self._canvas = None
        
        layout = self.layout()
        layout.addWidget(self.title_label)
        layout.addWidget(self.placeholder, 1)
    
    def set_figure(self, fig):
        if self._canvas is not None:
            self.layout().removeWidget(self._canvas)
            self._canvas.setParent(None)
            self._canvas.deleteLater()
            self._canvas = None
        
        if fig is None:
            self.placeholder.show()
            return
        
        self.placeholder.hide()
        canvas = FigureCanvas(fig)
        canvas.setMinimumHeight(380)  # Taller charts
        self.layout().addWidget(canvas, 1)
        self._canvas = canvas


class DashboardWidget(QtWidgets.QWidget):
    request_open_pdf = QtCore.pyqtSignal(bytes, str)

    def __init__(self, api: ApiClient, parent=None):
        super().__init__(parent)
        self.api = api
        self.current_dataset_id: Optional[int] = None
        self._worker: Optional[ApiWorker] = None
        self.theme: Theme = DARK
        self.csv_data: List[Dict[str, Any]] = []
        self.total_rows: int = 0
        self.current_limit: Optional[int] = None

        # Create scroll area for entire dashboard
        scroll = QtWidgets.QScrollArea()
        scroll.setWidgetResizable(True)
        scroll.setFrameShape(QtWidgets.QFrame.NoFrame)
        scroll.setHorizontalScrollBarPolicy(QtCore.Qt.ScrollBarAlwaysOff)
        
        scroll_content = QtWidgets.QWidget()
        root = QtWidgets.QVBoxLayout(scroll_content)
        root.setContentsMargins(SPACING.page_padding, SPACING.page_padding, SPACING.page_padding, SPACING.page_padding)
        root.setSpacing(SPACING.gap_lg)

        # Header - Improved spacing and styling
        header = QtWidgets.QVBoxLayout()
        header.setSpacing(12)
        
        title_row = QtWidgets.QHBoxLayout()
        title = PageTitle("Analytics Dashboard")
        title.setStyleSheet("font-size: 48px; font-weight: 900;")  # Larger, bolder
        
        emoji = QtWidgets.QLabel("📊")
        emoji.setStyleSheet("font-size: 64px;")
        
        title_row.addWidget(title)
        title_row.addStretch()
        title_row.addWidget(emoji)
        
        subtitle = MutedLabel("Real-time insights from your chemical equipment data")
        subtitle.setStyleSheet("font-size: 16px; color: #9CA3AF;")  # Bigger subtitle
        
        # Gradient line
        gradient_line = QtWidgets.QFrame()
        gradient_line.setFixedHeight(3)
        gradient_line.setStyleSheet("""
            background: qlineargradient(x1:0, y1:0, x2:1, y2:0,
                stop:0 #06b6d4, stop:0.5 #3b82f6, stop:1 #8b5cf6);
            border-radius: 2px;
        """)
        
        header.addLayout(title_row)
        header.addWidget(subtitle)
        header.addWidget(gradient_line)

        # KPI Cards Grid - Improved sizing
        kpi_grid = QtWidgets.QGridLayout()
        kpi_grid.setSpacing(SPACING.gap_md)
        
        self.kpi_total = KPICardWidget("Total Equipment", "🏭", "cyan")
        self.kpi_flow = KPICardWidget("Avg Flowrate", "💧", "teal")
        self.kpi_press = KPICardWidget("Avg Pressure", "⚙️", "blue")
        self.kpi_temp = KPICardWidget("Avg Temperature", "🌡️", "emerald")
        
        # Make KPI cards larger
        for kpi in [self.kpi_total, self.kpi_flow, self.kpi_press, self.kpi_temp]:
            kpi.setMinimumHeight(200)
        
        kpi_grid.addWidget(self.kpi_total, 0, 0)
        kpi_grid.addWidget(self.kpi_flow, 0, 1)
        kpi_grid.addWidget(self.kpi_press, 0, 2)
        kpi_grid.addWidget(self.kpi_temp, 0, 3)

        # Visualizations Section with improved header
        viz_header = QtWidgets.QHBoxLayout()
        viz_header.setSpacing(SPACING.gap_md)
        
        viz_title = SectionTitle("Visualizations")
        viz_title.setStyleSheet("font-size: 28px; font-weight: 800;")  # Bigger section title
        
        viz_subtitle = MutedLabel("Interactive data exploration")
        viz_subtitle.setStyleSheet("font-size: 14px; color: #9CA3AF;")
        
        viz_title_container = QtWidgets.QVBoxLayout()
        viz_title_container.setSpacing(4)
        viz_title_container.addWidget(viz_title)
        viz_title_container.addWidget(viz_subtitle)
        
        # Visualization type selector buttons - improved design
        selector_container = QtWidgets.QHBoxLayout()
        selector_container.setSpacing(12)
        
        self.viz_buttons = []
        viz_types = [
            ("📊 Distribution", 0),
            ("🥧 Type", 1),
            ("📈 Average", 2),
            ("📉 Metrics", 3),
            ("🎯 Performance", 4)
        ]
        
        for label, idx in viz_types:
            btn = QtWidgets.QPushButton(label)
            btn.setObjectName("SecondaryButton")
            btn.setMinimumHeight(48)  # Taller buttons
            btn.setStyleSheet("font-size: 15px; font-weight: 600;")  # Bigger font
            btn.clicked.connect(lambda checked, i=idx: self._switch_visualization(i))
            self.viz_buttons.append(btn)
            selector_container.addWidget(btn)
        
        self.pdf_btn = PrimaryButton("📥 Download Report")
        self.pdf_btn.setDisabled(True)
        self.pdf_btn.setMinimumHeight(48)
        self.pdf_btn.setStyleSheet("font-size: 15px; font-weight: 600;")
        self.pdf_btn.clicked.connect(self._download_pdf)
        
        viz_header.addLayout(viz_title_container)
        viz_header.addStretch()
        viz_header.addLayout(selector_container)
        viz_header.addWidget(self.pdf_btn)

        # Single chart container (stacked widget for different visualizations)
        self.chart_stack = QtWidgets.QStackedWidget()
        
        self.chart1 = ChartCard("Distribution (Type)")
        self.chart2 = ChartCard("Type (Share by Type)")
        self.chart3 = ChartCard("Average Metrics per Type")
        self.chart4 = ChartCard("Metrics Trend")
        self.chart5 = ChartCard("Performance Profile")
        
        self.chart_stack.addWidget(self.chart1)
        self.chart_stack.addWidget(self.chart2)
        self.chart_stack.addWidget(self.chart3)
        self.chart_stack.addWidget(self.chart4)
        self.chart_stack.addWidget(self.chart5)
        
        self.current_viz = 0
        self._update_viz_buttons()

        # CSV Data Table Section
        table_header = QtWidgets.QHBoxLayout()
        table_header.setSpacing(SPACING.gap_md)
        
        table_title = SectionTitle("Dataset Preview")
        table_title.setStyleSheet("font-size: 28px; font-weight: 800;")
        
        # Row limit selector
        limit_container = QtWidgets.QHBoxLayout()
        limit_container.setSpacing(12)
        
        limit_label = MutedLabel("Show rows:")
        limit_label.setStyleSheet("font-size: 14px; font-weight: 600;")
        
        self.limit_combo = QtWidgets.QComboBox()
        self.limit_combo.setMinimumHeight(40)
        self.limit_combo.setStyleSheet("""
            QComboBox {
                font-size: 14px;
                font-weight: 600;
                padding: 8px 12px;
                background: rgba(30, 41, 59, 0.5);
                border: 1px solid #475569;
                border-radius: 8px;
                color: #E2E8F0;
            }
            QComboBox::drop-down {
                border: none;
                padding-right: 8px;
            }
            QComboBox:hover {
                background: rgba(30, 41, 59, 0.8);
                border-color: #06b6d4;
            }
        """)
        self.limit_combo.addItem("All", None)
        for val in [10, 25, 50, 100]:
            self.limit_combo.addItem(str(val), val)
        self.limit_combo.currentIndexChanged.connect(self._on_limit_changed)
        
        limit_container.addWidget(limit_label)
        limit_container.addWidget(self.limit_combo)
        
        table_header.addWidget(table_title)
        table_header.addStretch()
        table_header.addLayout(limit_container)
        
        # CSV Data Table
        self.csv_table = QtWidgets.QTableWidget()
        self.csv_table.setColumnCount(5)
        self.csv_table.setHorizontalHeaderLabels([
            "Equipment Name", "Type", "Flowrate", "Pressure (PSI)", "Temperature (°F)"
        ])
        self.csv_table.horizontalHeader().setStretchLastSection(True)
        self.csv_table.horizontalHeader().setSectionResizeMode(QtWidgets.QHeaderView.Stretch)
        self.csv_table.verticalHeader().setVisible(False)
        self.csv_table.setAlternatingRowColors(True)
        self.csv_table.setSelectionBehavior(QtWidgets.QAbstractItemView.SelectRows)
        self.csv_table.setEditTriggers(QtWidgets.QAbstractItemView.NoEditTriggers)
        self.csv_table.setMinimumHeight(400)
        self.csv_table.setStyleSheet("""
            QTableWidget {
                background-color: #1E293B;
                border: 2px solid #475569;
                border-radius: 12px;
                font-size: 14px;
                color: #E2E8F0;
                gridline-color: #334155;
            }
            QTableWidget::item {
                padding: 14px;
                color: #E2E8F0;
                background-color: transparent;
            }
            QTableWidget::item:alternate {
                background-color: rgba(51, 65, 85, 0.3);
            }
            QTableWidget::item:selected {
                background-color: rgba(6, 182, 212, 0.3);
                color: #F0FDFA;
            }
            QTableWidget::item:hover {
                background-color: rgba(71, 85, 105, 0.4);
            }
            QHeaderView::section {
                background-color: #0F172A;
                color: #22D3EE;
                padding: 14px;
                border: none;
                border-bottom: 3px solid #06b6d4;
                border-right: 1px solid #334155;
                font-size: 14px;
                font-weight: 700;
                text-align: left;
            }
            QHeaderView::section:last {
                border-right: none;
            }
        """)
        
        # Table info label
        self.table_info_label = MutedLabel("")
        self.table_info_label.setAlignment(QtCore.Qt.AlignCenter)
        self.table_info_label.setStyleSheet("font-size: 13px; padding: 12px;")

        # Assembly
        root.addLayout(header)
        root.addLayout(kpi_grid)
        root.addLayout(viz_header)
        root.addWidget(self.chart_stack, 1)
        root.addSpacing(SPACING.gap_lg)
        root.addLayout(table_header)
        root.addWidget(self.csv_table)
        root.addWidget(self.table_info_label)
        root.addStretch()

        scroll.setWidget(scroll_content)
        
        main_layout = QtWidgets.QVBoxLayout(self)
        main_layout.setContentsMargins(0, 0, 0, 0)
        main_layout.addWidget(scroll)

        self._set_empty()

    def _switch_visualization(self, index: int) -> None:
        self.current_viz = index
        self.chart_stack.setCurrentIndex(index)
        self._update_viz_buttons()
    
    def _update_viz_buttons(self) -> None:
        for i, btn in enumerate(self.viz_buttons):
            if i == self.current_viz:
                btn.setObjectName("PrimaryButton")
                btn.setStyleSheet("font-size: 15px; font-weight: 600; min-height: 48px;")
            else:
                btn.setObjectName("SecondaryButton")
                btn.setStyleSheet("font-size: 15px; font-weight: 600; min-height: 48px;")
    
    def _on_limit_changed(self, index: int) -> None:
        """Handle row limit change"""
        limit = self.limit_combo.itemData(index)
        if limit != self.current_limit and self.current_dataset_id:
            self.current_limit = limit
            self._load_data_with_limit()
    
    def _load_data_with_limit(self) -> None:
        """Load summary and CSV data with current limit"""
        if not self.current_dataset_id:
            return
        
        def work():
            summary = self.api.get_summary(self.current_dataset_id, self.current_limit)
            csv_data, total_count = self.api.get_csv_data(self.current_dataset_id, self.current_limit)
            return summary, csv_data, total_count
        
        self._worker = ApiWorker(work, self)
        self._worker.succeeded.connect(self._data_loaded)
        self._worker.failed.connect(lambda msg: print(f"Failed to load data: {msg}"))
        self._worker.start()
    
    def _data_loaded(self, result) -> None:
        """Handle loaded data from worker"""
        summary, csv_data, total_count = result
        self.csv_data = csv_data
        self.total_rows = total_count
        self._update_ui_with_summary(summary)
        self._update_csv_table()
    
    def _set_empty(self) -> None:
        self.kpi_total.set_value(0, "")
        self.kpi_flow.set_value(0, "units")
        self.kpi_press.set_value(0, "psi")
        self.kpi_temp.set_value(0, "°F")
        
        self.chart1.set_figure(None)
        self.chart2.set_figure(None)
        self.chart3.set_figure(None)
        self.chart4.set_figure(None)
        self.chart5.set_figure(None)
        
        self.csv_table.setRowCount(0)
        self.table_info_label.setText("")
        self.csv_data = []
        self.total_rows = 0

    def set_summary(self, summary: Dict[str, Any], dataset_id: Optional[int]) -> None:
        self.current_dataset_id = dataset_id
        self.pdf_btn.setDisabled(dataset_id is None)
        
        # Update combo box to show total
        if dataset_id:
            total = summary.get("total_equipment", 0)
            self.limit_combo.setItemText(0, f"All ({total})")
            # Load CSV data
            self._load_data_with_limit()
        
        self._update_ui_with_summary(summary)
    
    def _update_ui_with_summary(self, summary: Dict[str, Any]) -> None:
        """Update UI components with summary data"""
        # Update KPIs with larger text
        self.kpi_total.set_value(float(summary.get("total_equipment") or 0), "")
        self.kpi_flow.set_value(float(summary.get("average_flowrate") or 0), "units")
        self.kpi_press.set_value(float(summary.get("average_pressure") or 0), "psi")
        self.kpi_temp.set_value(float(summary.get("average_temperature") or 0), "°F")

        # Update charts
        self.chart1.set_figure(figure_bar_type_distribution(summary, self.theme))
        self.chart2.set_figure(figure_donut_share(summary, self.theme))
        self.chart3.set_figure(figure_avg_metrics_per_type(summary, self.theme))
        
        # Generate additional visualizations
        self.chart4.set_figure(self._create_line_chart(summary))
        radar_fig = figure_optional_radar(summary, self.theme)
        self.chart5.set_figure(radar_fig if radar_fig else None)
    
    def _update_csv_table(self) -> None:
        """Update the CSV data table"""
        self.csv_table.setRowCount(len(self.csv_data))
        
        for row_idx, row_data in enumerate(self.csv_data):
            # Equipment Name
            name_item = QtWidgets.QTableWidgetItem(str(row_data.get('equipment_name', '')))
            name_item.setForeground(QtGui.QColor(226, 232, 240))  # Light gray text
            self.csv_table.setItem(row_idx, 0, name_item)
            
            # Type - with colored badge style
            type_item = QtWidgets.QTableWidgetItem(str(row_data.get('type', '')))
            type_item.setBackground(QtGui.QColor(6, 182, 212, 50))  # Cyan background
            type_item.setForeground(QtGui.QColor(103, 232, 249))  # Bright cyan text
            type_item.setTextAlignment(QtCore.Qt.AlignCenter)
            self.csv_table.setItem(row_idx, 1, type_item)
            
            # Flowrate
            flowrate = float(row_data.get('flowrate', 0))
            flowrate_item = QtWidgets.QTableWidgetItem(f"{flowrate:.2f}")
            flowrate_item.setForeground(QtGui.QColor(226, 232, 240))
            self.csv_table.setItem(row_idx, 2, flowrate_item)
            
            # Pressure
            pressure = float(row_data.get('pressure', 0))
            pressure_item = QtWidgets.QTableWidgetItem(f"{pressure:.2f}")
            pressure_item.setForeground(QtGui.QColor(226, 232, 240))
            self.csv_table.setItem(row_idx, 3, pressure_item)
            
            # Temperature
            temperature = float(row_data.get('temperature', 0))
            temp_item = QtWidgets.QTableWidgetItem(f"{temperature:.2f}")
            temp_item.setForeground(QtGui.QColor(226, 232, 240))
            self.csv_table.setItem(row_idx, 4, temp_item)
        
        # Update info label
        if self.csv_data:
            self.table_info_label.setText(f"Showing {len(self.csv_data)} of {self.total_rows} rows")
        else:
            self.table_info_label.setText("No data available")

    def _download_pdf(self) -> None:
        if self.current_dataset_id is None:
            return

        self.pdf_btn.setDisabled(True)
        dataset_id = int(self.current_dataset_id)

        def work():
            return self.api.download_report(dataset_id)

        self._worker = ApiWorker(work, self)
        self._worker.succeeded.connect(self._pdf_ok)
        self._worker.failed.connect(self._pdf_failed)
        self._worker.start()

    
    def _create_line_chart(self, summary: Dict[str, Any]):
        """Create a line chart showing average metrics across equipment types"""
        from matplotlib.figure import Figure
        
        avg_metrics = summary.get('avg_metrics_per_type') or {}
        if not avg_metrics:
            return None
        
        equipment_types = list(avg_metrics.keys())
        flowrates = [avg_metrics[t]['avg_flowrate'] for t in equipment_types]
        pressures = [avg_metrics[t]['avg_pressure'] for t in equipment_types]
        temperatures = [avg_metrics[t]['avg_temperature'] for t in equipment_types]
        
        fig = Figure(figsize=(12.4, 4.2), dpi=100)
        fig.patch.set_facecolor(self.theme.bg)
        ax = fig.add_subplot(111)
        ax.set_facecolor(self.theme.panel)
        
        x_points = list(range(len(equipment_types)))
        
        # Plot lines with markers
        ax.plot(x_points, flowrates, marker='o', linewidth=3, 
                color='#06b6d4', label='Avg Flowrate', markersize=8, 
                markerfacecolor='#06b6d4', markeredgecolor='white', markeredgewidth=2)
        ax.plot(x_points, pressures, marker='o', linewidth=3, 
                color='#14b8a6', label='Avg Pressure', markersize=8,
                markerfacecolor='#14b8a6', markeredgecolor='white', markeredgewidth=2)
        ax.plot(x_points, temperatures, marker='o', linewidth=3, 
                color='#3b82f6', label='Avg Temperature', markersize=8,
                markerfacecolor='#3b82f6', markeredgecolor='white', markeredgewidth=2)
        
        # Styling
        ax.set_xlabel('Equipment Type', fontsize=12, color=self.theme.text, fontweight='bold')
        ax.set_ylabel('Average Value', fontsize=12, color=self.theme.text, fontweight='bold')
        ax.set_title('Equipment Metrics Trend', fontsize=14, color=self.theme.text, 
                    fontweight='bold', pad=15)
        
        ax.set_xticks(x_points)
        ax.set_xticklabels(equipment_types, rotation=45, ha='right', fontsize=10)
        ax.tick_params(colors=self.theme.text, labelsize=10)
        
        # Grid
        ax.grid(True, alpha=0.3, color=self.theme.grid, linestyle='--', linewidth=0.8)
        ax.spines['top'].set_visible(False)
        ax.spines['right'].set_visible(False)
        ax.spines['left'].set_color(self.theme.grid)
        ax.spines['bottom'].set_color(self.theme.grid)
        
        # Legend
        legend = ax.legend(loc='upper left', frameon=True, fancybox=True, 
                          fontsize=11, framealpha=0.9)
        legend.get_frame().set_facecolor(self.theme.panel)
        legend.get_frame().set_edgecolor(self.theme.grid)
        for text in legend.get_texts():
            text.set_color(self.theme.text)
        
        fig.tight_layout()
        return fig
    def _pdf_ok(self, result):
        self.pdf_btn.setDisabled(False)
        pdf_bytes, filename = result
        self.request_open_pdf.emit(pdf_bytes, filename)

    def _pdf_failed(self, message: str):
        self.pdf_btn.setDisabled(False)
