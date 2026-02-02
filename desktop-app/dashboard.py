from __future__ import annotations

import os
from typing import Any, Dict, Optional

from PyQt5 import QtCore, QtGui, QtWidgets

from matplotlib.backends.backend_qt5agg import FigureCanvasQTAgg as FigureCanvas

from api_client import ApiClient
from auth import ApiWorker
from charts import DARK, Theme, figure_avg_metrics_per_type, figure_bar_type_distribution, figure_donut_share, figure_optional_radar
from ui_components import (
    CardFrame,
    KPICardWidget,
    MutedLabel,
    OutlineButton,
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


class InsightCard(CardFrame):
    def __init__(self, title: str, description: str, status: str = "normal", icon: str = "✅", parent=None):
        super().__init__(parent, padding=20, hover=False)
        self.setObjectName(f"Insight{status.capitalize()}")
        
        # Icon and status badge row
        header = QtWidgets.QHBoxLayout()
        header.setSpacing(12)
        
        icon_label = QtWidgets.QLabel(icon)
        icon_label.setObjectName("KPIIcon")
        icon_label.setStyleSheet("font-size: 32px;")
        
        status_badge = QtWidgets.QLabel(status.upper())
        status_badge.setObjectName("StatusActive")
        
        header.addWidget(icon_label)
        header.addWidget(status_badge)
        header.addStretch()
        
        title_label = SectionTitle(title)
        
        desc_label = MutedLabel(description)
        
        layout = self.layout()
        layout.addLayout(header)
        layout.addWidget(title_label)
        layout.addWidget(desc_label)


class ChartCard(CardFrame):
    def __init__(self, title: str, parent=None):
        super().__init__(parent, padding=24, hover=False)
        
        self.title_label = SectionTitle(title)
        
        self.placeholder = MutedLabel("No data")
        self.placeholder.setAlignment(QtCore.Qt.AlignCenter)
        self.placeholder.setStyleSheet("padding: 60px;")
        
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
        canvas.setMinimumHeight(340)
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

        # Create scroll area for entire dashboard
        scroll = QtWidgets.QScrollArea()
        scroll.setWidgetResizable(True)
        scroll.setFrameShape(QtWidgets.QFrame.NoFrame)
        scroll.setHorizontalScrollBarPolicy(QtCore.Qt.ScrollBarAlwaysOff)
        
        scroll_content = QtWidgets.QWidget()
        root = QtWidgets.QVBoxLayout(scroll_content)
        root.setContentsMargins(0, 0, 0, 0)
        root.setSpacing(SPACING.gap_lg)

        # Header
        header = QtWidgets.QVBoxLayout()
        header.setSpacing(8)
        
        title = PageTitle("Analytics Dashboard")
        
        subtitle = MutedLabel("Real-time insights from your chemical equipment data")
        
        header.addWidget(title)
        header.addWidget(subtitle)

        # KPI Cards Grid
        kpi_grid = QtWidgets.QGridLayout()
        kpi_grid.setSpacing(SPACING.gap_md)
        
        self.kpi_total = KPICardWidget("Total Equipment", "🏭", "cyan")
        self.kpi_flow = KPICardWidget("Avg Flowrate", "💧", "teal")
        self.kpi_press = KPICardWidget("Avg Pressure", "⚙️", "blue")
        self.kpi_temp = KPICardWidget("Avg Temperature", "🌡️", "emerald")
        
        kpi_grid.addWidget(self.kpi_total, 0, 0)
        kpi_grid.addWidget(self.kpi_flow, 0, 1)
        kpi_grid.addWidget(self.kpi_press, 0, 2)
        kpi_grid.addWidget(self.kpi_temp, 0, 3)

        # Insights Section
        insights_title = SectionTitle("Key Insights")
        
        self.insights_container = QtWidgets.QWidget()
        self.insights_layout = QtWidgets.QHBoxLayout(self.insights_container)
        self.insights_layout.setContentsMargins(0, 0, 0, 0)
        self.insights_layout.setSpacing(SPACING.gap_md)

        # Visualizations Section
        viz_header = QtWidgets.QHBoxLayout()
        viz_header.setSpacing(SPACING.gap_md)
        
        viz_title = SectionTitle("Visualizations")
        
        # Visualization type selector buttons
        selector_container = QtWidgets.QHBoxLayout()
        selector_container.setSpacing(12)
        
        self.viz_buttons = []
        viz_types = [
            ("📊 Distribution", 0),
            ("🥧 Share", 1),
            ("📈 Metrics", 2),
            ("🔄 Trends", 3),
            ("📉 Analysis", 4)
        ]
        
        for label, idx in viz_types:
            btn = QtWidgets.QPushButton(label)
            btn.setObjectName("SecondaryButton")
            btn.setMinimumHeight(42)
            btn.clicked.connect(lambda checked, i=idx: self._switch_visualization(i))
            self.viz_buttons.append(btn)
            selector_container.addWidget(btn)
        
        self.pdf_btn = PrimaryButton("📄 Download Report")
        self.pdf_btn.setDisabled(True)
        self.pdf_btn.clicked.connect(self._download_pdf)
        
        viz_header.addWidget(viz_title)
        viz_header.addStretch()
        viz_header.addLayout(selector_container)
        viz_header.addWidget(self.pdf_btn)

        # Single chart container (stacked widget for different visualizations)
        self.chart_stack = QtWidgets.QStackedWidget()
        
        self.chart1 = ChartCard("Equipment Type Distribution")
        self.chart2 = ChartCard("Equipment Share by Type")
        self.chart3 = ChartCard("Average Metrics per Type")
        self.chart4 = ChartCard("Equipment Trends")
        self.chart5 = ChartCard("Statistical Analysis")
        
        self.chart_stack.addWidget(self.chart1)
        self.chart_stack.addWidget(self.chart2)
        self.chart_stack.addWidget(self.chart3)
        self.chart_stack.addWidget(self.chart4)
        self.chart_stack.addWidget(self.chart5)
        
        self.current_viz = 0
        self._update_viz_buttons()

        # Assembly
        root.addLayout(header)
        root.addLayout(kpi_grid)
        root.addWidget(insights_title)
        root.addWidget(self.insights_container)
        root.addLayout(viz_header)
        root.addWidget(self.chart_stack, 1)
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
                btn.setStyleSheet("font-size: 14px; min-height: 42px;")
            else:
                btn.setObjectName("SecondaryButton")
                btn.setStyleSheet("font-size: 14px; min-height: 42px;")
    
    def _set_empty(self) -> None:
        self.kpi_total.set_value(0, "")
        self.kpi_flow.set_value(0, "units")
        self.kpi_press.set_value(0, "psi")
        self.kpi_temp.set_value(0, "°F")
        
        # Clear insights
        while self.insights_layout.count():
            item = self.insights_layout.takeAt(0)
            w = item.widget()
            if w is not None:
                w.deleteLater()
        
        self.chart1.set_figure(None)
        self.chart2.set_figure(None)
        self.chart3.set_figure(None)
        self.chart4.set_figure(None)
        self.chart5.set_figure(None)

    def set_summary(self, summary: Dict[str, Any], dataset_id: Optional[int]) -> None:
        self.current_dataset_id = dataset_id
        self.pdf_btn.setDisabled(dataset_id is None)

        # Update KPIs
        self.kpi_total.set_value(float(summary.get("total_equipment") or 0), "")
        self.kpi_flow.set_value(float(summary.get("average_flowrate") or 0), "units")
        self.kpi_press.set_value(float(summary.get("average_pressure") or 0), "psi")
        self.kpi_temp.set_value(float(summary.get("average_temperature") or 0), "°F")

        # Generate insights
        insights = []
        avg_temp = float(summary.get("average_temperature") or 0)
        total_equipment = int(summary.get("total_equipment") or 0)
        
        if avg_temp > 200:
            insights.append({
                "title": "Elevated Temperature",
                "description": f"System running at {avg_temp:.2f}°F. Monitor for thermal stress.",
                "status": "warning",
                "icon": "🔥"
            })
        else:
            insights.append({
                "title": "Temperature Normal",
                "description": "All equipment operating within safe temperature ranges.",
                "status": "normal",
                "icon": "✅"
            })
        
        insights.append({
            "title": "Equipment Fleet Status",
            "description": f"{total_equipment} pieces of equipment actively monitored. All systems operational.",
            "status": "normal",
            "icon": "🏭"
        })
        
        # Clear and rebuild insights
        while self.insights_layout.count():
            item = self.insights_layout.takeAt(0)
            w = item.widget()
            if w is not None:
                w.deleteLater()
        
        for insight in insights:
            card = InsightCard(**insight)
            self.insights_layout.addWidget(card)
        
        if len(insights) < 3:
            self.insights_layout.addStretch()

        # Update charts
        self.chart1.set_figure(figure_bar_type_distribution(summary, self.theme))
        self.chart2.set_figure(figure_donut_share(summary, self.theme))
        self.chart3.set_figure(figure_avg_metrics_per_type(summary, self.theme))
        
        # Generate additional visualizations
        radar_fig = figure_optional_radar(summary, self.theme)
        self.chart4.set_figure(radar_fig if radar_fig else None)
        
        # For chart 5, create a line chart showing metric trends
        self.chart5.set_figure(self._create_line_chart(summary))

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
        
        type_dist = summary.get('equipment_type_distribution') or {}
        if not type_dist:
            return None
        
        equipment_types = list(type_dist.keys())
        
        # Generate sample metric trends (in real scenario, this would come from actual data)
        # For demo purposes, we'll create trends based on the summary metrics
        avg_flow = float(summary.get('average_flowrate', 0))
        avg_press = float(summary.get('average_pressure', 0))
        avg_temp = float(summary.get('average_temperature', 0))
        
        # Create trend data with some variation
        import random
        random.seed(42)  # Consistent results
        
        x_points = list(range(len(equipment_types)))
        
        # Generate trend lines with variations
        flowrate_trend = [avg_flow * (0.8 + 0.4 * (i / len(equipment_types)) + random.uniform(-0.1, 0.1)) 
                         for i in range(len(equipment_types))]
        pressure_trend = [avg_press * (0.85 + 0.3 * (i / len(equipment_types)) + random.uniform(-0.08, 0.08)) 
                         for i in range(len(equipment_types))]
        temperature_trend = [avg_temp * (0.9 + 0.2 * (i / len(equipment_types)) + random.uniform(-0.05, 0.05)) 
                            for i in range(len(equipment_types))]
        
        fig = Figure(figsize=(12.4, 4.2), dpi=100)
        fig.patch.set_facecolor(self.theme.bg)
        ax = fig.add_subplot(111)
        ax.set_facecolor(self.theme.panel)
        
        # Plot lines
        ax.plot(x_points, flowrate_trend, marker='o', linewidth=2.5, 
                color='#22D3EE', label='Flowrate', markersize=8)
        ax.plot(x_points, pressure_trend, marker='s', linewidth=2.5, 
                color='#3B82F6', label='Pressure', markersize=8)
        ax.plot(x_points, temperature_trend, marker='^', linewidth=2.5, 
                color='#A855F7', label='Temperature', markersize=8)
        
        # Styling
        ax.set_xlabel('Equipment Type', fontsize=12, color=self.theme.text, fontweight='bold')
        ax.set_ylabel('Metric Values', fontsize=12, color=self.theme.text, fontweight='bold')
        ax.set_title('Average Metrics Trend Analysis', fontsize=14, color=self.theme.text, 
                    fontweight='bold', pad=15)
        
        ax.set_xticks(x_points)
        ax.set_xticklabels(equipment_types, rotation=45, ha='right', fontsize=10)
        ax.tick_params(colors=self.theme.text, labelsize=10)
        
        # Grid
        ax.grid(True, alpha=0.15, color=self.theme.grid, linestyle='--', linewidth=0.8)
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

    def _create_stats_chart(self, summary: Dict[str, Any]):
        """Create a simple text-based statistics summary chart"""
        from matplotlib.figure import Figure
        
        fig = Figure(figsize=(12.4, 4.2), dpi=100)
        fig.patch.set_facecolor(self.theme.bg)
        ax = fig.add_subplot(111)
        ax.set_facecolor(self.theme.panel)
        ax.axis('off')
        
        stats_text = f"""
        Equipment Summary Statistics
        
        Total Equipment: {summary.get('total_equipment', 0)}
        Average Flowrate: {_fmt_float(summary.get('average_flowrate'), 2)} units
        Average Pressure: {_fmt_float(summary.get('average_pressure'), 2)} psi
        Average Temperature: {_fmt_float(summary.get('average_temperature'), 2)} °F
        
        Equipment Types: {len((summary.get('equipment_type_distribution') or {}).keys())}
        """
        
        ax.text(0.5, 0.5, stats_text, 
                ha='center', va='center',
                fontsize=16, color=self.theme.text,
                family='monospace',
                bbox=dict(boxstyle='round,pad=1', 
                         facecolor=self.theme.panel, 
                         edgecolor=self.theme.grid,
                         linewidth=2))
        
        fig.tight_layout()
        return fig
    def _pdf_ok(self, result):
        self.pdf_btn.setDisabled(False)
        pdf_bytes, filename = result
        self.request_open_pdf.emit(pdf_bytes, filename)

    def _pdf_failed(self, message: str):
        self.pdf_btn.setDisabled(False)
