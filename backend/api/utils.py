from __future__ import annotations

import os
import tempfile
from io import BytesIO
from typing import Any, Dict

import pandas as pd
import matplotlib
matplotlib.use('Agg')  # Non-GUI backend for server-side rendering
import matplotlib.pyplot as plt
import numpy as np
from reportlab.lib.pagesizes import letter, A4
from reportlab.pdfgen import canvas
from reportlab.lib.utils import ImageReader
from reportlab.lib import colors
from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph, Spacer, Image, PageBreak
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch
from reportlab.lib.enums import TA_CENTER, TA_LEFT


REQUIRED_COLUMNS = [
    'Equipment Name',
    'Type',
    'Flowrate',
    'Pressure',
    'Temperature',
]


class CSVValidationError(ValueError):
    pass


def parse_and_analyze_csv(uploaded_file, *, return_df: bool = False):
    """Parse uploaded CSV and compute required analytics.

    Returns:
        If return_df is False: summary dict
        If return_df is True: (summary dict, pandas.DataFrame)

    Raises CSVValidationError with human-readable messages.
    """

    if uploaded_file is None:
        raise CSVValidationError('No file provided.')

    try:
        uploaded_file.seek(0)
    except Exception:
        pass

    try:
        df = pd.read_csv(uploaded_file)
    except Exception as exc:
        raise CSVValidationError(f'Invalid CSV file: {exc}') from exc

    missing = [c for c in REQUIRED_COLUMNS if c not in df.columns]
    if missing:
        raise CSVValidationError(
            f"CSV is missing required columns: {', '.join(missing)}. "
            f"Required columns are: {', '.join(REQUIRED_COLUMNS)}."
        )

    # Numeric validation/coercion
    for col in ['Flowrate', 'Pressure', 'Temperature']:
        try:
            df[col] = pd.to_numeric(df[col], errors='raise')
        except Exception as exc:
            raise CSVValidationError(f"Column '{col}' must contain numeric values.") from exc

    total_equipment = int(len(df))
    avg_flowrate = float(df['Flowrate'].mean()) if total_equipment else 0.0
    avg_pressure = float(df['Pressure'].mean()) if total_equipment else 0.0
    avg_temperature = float(df['Temperature'].mean()) if total_equipment else 0.0

    type_distribution_series = df['Type'].astype(str).value_counts(dropna=False)
    equipment_type_distribution = {str(k): int(v) for k, v in type_distribution_series.to_dict().items()}

    # Compute average metrics per equipment type
    avg_metrics_per_type = {}
    for equip_type in df['Type'].unique():
        type_df = df[df['Type'] == equip_type]
        avg_metrics_per_type[str(equip_type)] = {
            'avg_flowrate': float(type_df['Flowrate'].mean()),
            'avg_pressure': float(type_df['Pressure'].mean()),
            'avg_temperature': float(type_df['Temperature'].mean()),
        }

    summary = {
        'total_equipment': total_equipment,
        'average_flowrate': avg_flowrate,
        'average_pressure': avg_pressure,
        'average_temperature': avg_temperature,
        'equipment_type_distribution': equipment_type_distribution,
        'avg_metrics_per_type': avg_metrics_per_type,
    }

    if return_df:
        return summary, df

    return summary


# ==================== CHART GENERATION FUNCTIONS ====================

def generate_type_distribution_bar_chart(summary: Dict[str, Any]) -> str:
    """Generate Equipment Type Distribution bar chart and return temp file path."""
    distribution = summary.get('equipment_type_distribution', {})
    
    if not distribution:
        return None
    
    fig, ax = plt.subplots(figsize=(10, 6))
    types = list(distribution.keys())
    counts = list(distribution.values())
    
    colors_gradient = plt.cm.viridis(np.linspace(0.3, 0.9, len(types)))
    bars = ax.bar(types, counts, color=colors_gradient, edgecolor='black', linewidth=1.2)
    
    ax.set_xlabel('Equipment Type', fontsize=12, fontweight='bold')
    ax.set_ylabel('Count', fontsize=12, fontweight='bold')
    ax.set_title('Equipment Type Distribution', fontsize=14, fontweight='bold', pad=20)
    ax.grid(axis='y', alpha=0.3, linestyle='--')
    
    # Add value labels on bars
    for bar in bars:
        height = bar.get_height()
        ax.text(bar.get_x() + bar.get_width()/2., height,
                f'{int(height)}',
                ha='center', va='bottom', fontsize=10, fontweight='bold')
    
    plt.xticks(rotation=45, ha='right')
    plt.tight_layout()
    
    temp_file = tempfile.NamedTemporaryFile(delete=False, suffix='.png')
    plt.savefig(temp_file.name, dpi=300, bbox_inches='tight')
    plt.close()
    
    return temp_file.name


def generate_equipment_share_donut_chart(summary: Dict[str, Any]) -> str:
    """Generate Equipment Share donut chart and return temp file path."""
    distribution = summary.get('equipment_type_distribution', {})
    
    if not distribution:
        return None
    
    fig, ax = plt.subplots(figsize=(10, 8))
    types = list(distribution.keys())
    counts = list(distribution.values())
    
    colors_palette = plt.cm.Set3(np.linspace(0, 1, len(types)))
    
    wedges, texts, autotexts = ax.pie(
        counts, 
        labels=types, 
        autopct='%1.1f%%',
        startangle=90,
        colors=colors_palette,
        wedgeprops=dict(width=0.4, edgecolor='white', linewidth=2)
    )
    
    # Style the percentage text
    for autotext in autotexts:
        autotext.set_color('black')
        autotext.set_fontsize(11)
        autotext.set_fontweight('bold')
    
    for text in texts:
        text.set_fontsize(11)
        text.set_fontweight('bold')
    
    ax.set_title('Equipment Share by Type', fontsize=14, fontweight='bold', pad=20)
    plt.tight_layout()
    
    temp_file = tempfile.NamedTemporaryFile(delete=False, suffix='.png')
    plt.savefig(temp_file.name, dpi=300, bbox_inches='tight')
    plt.close()
    
    return temp_file.name


def generate_avg_metrics_per_type_chart(summary: Dict[str, Any]) -> str:
    """Generate Average Metrics per Equipment Type multi-bar chart."""
    avg_metrics = summary.get('avg_metrics_per_type', {})
    
    if not avg_metrics:
        return None
    
    types = list(avg_metrics.keys())
    flowrates = [avg_metrics[t]['avg_flowrate'] for t in types]
    pressures = [avg_metrics[t]['avg_pressure'] for t in types]
    temperatures = [avg_metrics[t]['avg_temperature'] for t in types]
    
    x = np.arange(len(types))
    width = 0.25
    
    fig, ax = plt.subplots(figsize=(12, 7))
    
    bar1 = ax.bar(x - width, flowrates, width, label='Avg Flowrate', color='#06b6d4', edgecolor='black', linewidth=1)
    bar2 = ax.bar(x, pressures, width, label='Avg Pressure', color='#14b8a6', edgecolor='black', linewidth=1)
    bar3 = ax.bar(x + width, temperatures, width, label='Avg Temperature', color='#3b82f6', edgecolor='black', linewidth=1)
    
    ax.set_xlabel('Equipment Type', fontsize=12, fontweight='bold')
    ax.set_ylabel('Average Value', fontsize=12, fontweight='bold')
    ax.set_title('Average Metrics per Equipment Type', fontsize=14, fontweight='bold', pad=20)
    ax.set_xticks(x)
    ax.set_xticklabels(types, rotation=45, ha='right')
    ax.legend(loc='upper left', fontsize=10)
    ax.grid(axis='y', alpha=0.3, linestyle='--')
    
    plt.tight_layout()
    
    temp_file = tempfile.NamedTemporaryFile(delete=False, suffix='.png')
    plt.savefig(temp_file.name, dpi=300, bbox_inches='tight')
    plt.close()
    
    return temp_file.name


def generate_overall_avg_metrics_chart(summary: Dict[str, Any]) -> str:
    """Generate Overall Average Metrics comparison bar chart."""
    metrics = ['Flowrate', 'Pressure', 'Temperature']
    values = [
        summary.get('average_flowrate', 0),
        summary.get('average_pressure', 0),
        summary.get('average_temperature', 0)
    ]
    
    fig, ax = plt.subplots(figsize=(10, 6))
    colors_list = ['#06b6d4', '#14b8a6', '#3b82f6']
    bars = ax.bar(metrics, values, color=colors_list, edgecolor='black', linewidth=1.2)
    
    ax.set_xlabel('Metrics', fontsize=12, fontweight='bold')
    ax.set_ylabel('Average Value', fontsize=12, fontweight='bold')
    ax.set_title('Overall Average Metrics Comparison', fontsize=14, fontweight='bold', pad=20)
    ax.grid(axis='y', alpha=0.3, linestyle='--')
    
    # Add value labels
    for bar in bars:
        height = bar.get_height()
        ax.text(bar.get_x() + bar.get_width()/2., height,
                f'{height:.2f}',
                ha='center', va='bottom', fontsize=11, fontweight='bold')
    
    plt.tight_layout()
    
    temp_file = tempfile.NamedTemporaryFile(delete=False, suffix='.png')
    plt.savefig(temp_file.name, dpi=300, bbox_inches='tight')
    plt.close()
    
    return temp_file.name


def generate_radar_chart(summary: Dict[str, Any]) -> str:
    """Generate Equipment Performance Profile radar chart."""
    categories = ['Flowrate', 'Pressure', 'Temperature']
    values = [
        summary.get('average_flowrate', 0),
        summary.get('average_pressure', 0),
        summary.get('average_temperature', 0)
    ]
    
    # Normalize values for radar chart (0-100 scale)
    max_val = max(values) if max(values) > 0 else 1
    normalized_values = [(v / max_val) * 100 for v in values]
    
    # Number of variables
    N = len(categories)
    angles = [n / float(N) * 2 * np.pi for n in range(N)]
    normalized_values += normalized_values[:1]  # Close the plot
    angles += angles[:1]
    
    fig, ax = plt.subplots(figsize=(8, 8), subplot_kw=dict(projection='polar'))
    
    ax.plot(angles, normalized_values, 'o-', linewidth=2, color='#06b6d4', label='Average Metrics')
    ax.fill(angles, normalized_values, alpha=0.25, color='#06b6d4')
    ax.set_xticks(angles[:-1])
    ax.set_xticklabels(categories, fontsize=11, fontweight='bold')
    ax.set_ylim(0, 100)
    ax.set_title('Equipment Performance Profile\n(Normalized Metrics)', 
                 fontsize=14, fontweight='bold', pad=20)
    ax.grid(True, linestyle='--', alpha=0.5)
    
    # Add actual values as labels
    for angle, value, actual in zip(angles[:-1], normalized_values[:-1], values):
        ax.text(angle, value + 10, f'{actual:.1f}', 
                ha='center', va='center', fontsize=9, fontweight='bold')
    
    plt.tight_layout()
    
    temp_file = tempfile.NamedTemporaryFile(delete=False, suffix='.png')
    plt.savefig(temp_file.name, dpi=300, bbox_inches='tight')
    plt.close()
    
    return temp_file.name


# ==================== PDF GENERATION WITH CHARTS ====================

def generate_pdf_report_bytes(*, dataset_name: str, uploaded_at, summary: Dict[str, Any]) -> bytes:
    """Generate professional PDF report with embedded Matplotlib charts."""
    
    buffer = BytesIO()
    doc = SimpleDocTemplate(buffer, pagesize=letter, 
                           rightMargin=50, leftMargin=50,
                           topMargin=50, bottomMargin=50)
    
    story = []
    styles = getSampleStyleSheet()
    
    # Custom styles
    title_style = ParagraphStyle(
        'CustomTitle',
        parent=styles['Heading1'],
        fontSize=24,
        textColor=colors.HexColor('#0e1117'),
        spaceAfter=30,
        alignment=TA_CENTER,
        fontName='Helvetica-Bold'
    )
    
    heading_style = ParagraphStyle(
        'CustomHeading',
        parent=styles['Heading2'],
        fontSize=16,
        textColor=colors.HexColor('#06b6d4'),
        spaceAfter=12,
        spaceBefore=20,
        fontName='Helvetica-Bold'
    )
    
    caption_style = ParagraphStyle(
        'Caption',
        parent=styles['Normal'],
        fontSize=9,
        textColor=colors.gray,
        alignment=TA_CENTER,
        spaceAfter=20
    )
    
    # Title
    story.append(Paragraph('Chemical Equipment Analytics Report', title_style))
    story.append(Spacer(1, 0.2*inch))
    
    # Dataset Info
    info_data = [
        ['Dataset:', dataset_name],
        ['Generated:', str(uploaded_at)],
        ['Total Equipment:', str(summary.get('total_equipment', 0))]
    ]
    
    info_table = Table(info_data, colWidths=[2*inch, 4*inch])
    info_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (0, -1), colors.HexColor('#f0f0f0')),
        ('TEXTCOLOR', (0, 0), (-1, -1), colors.black),
        ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
        ('FONTNAME', (0, 0), (0, -1), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, -1), 11),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 12),
        ('TOPPADDING', (0, 0), (-1, -1), 12),
        ('GRID', (0, 0), (-1, -1), 1, colors.HexColor('#cccccc'))
    ]))
    
    story.append(info_table)
    story.append(Spacer(1, 0.3*inch))
    
    # KPI Summary Table
    story.append(Paragraph('Key Performance Indicators', heading_style))
    
    kpi_data = [
        ['Metric', 'Value'],
        ['Total Equipment', str(summary.get('total_equipment', 0))],
        ['Average Flowrate', f"{summary.get('average_flowrate', 0):.2f} units"],
        ['Average Pressure', f"{summary.get('average_pressure', 0):.2f} PSI"],
        ['Average Temperature', f"{summary.get('average_temperature', 0):.2f} °F"]
    ]
    
    kpi_table = Table(kpi_data, colWidths=[3*inch, 3*inch])
    kpi_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#06b6d4')),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
        ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, 0), 12),
        ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
        ('TOPPADDING', (0, 0), (-1, 0), 12),
        ('BACKGROUND', (0, 1), (-1, -1), colors.beige),
        ('GRID', (0, 0), (-1, -1), 1, colors.black),
        ('FONTSIZE', (0, 1), (-1, -1), 11),
        ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, colors.HexColor('#f9f9f9')])
    ]))
    
    story.append(kpi_table)
    story.append(PageBreak())
    
    # Generate and embed charts
    temp_files = []
    
    try:
        # Chart 1: Equipment Type Distribution
        story.append(Paragraph('Equipment Type Distribution', heading_style))
        chart1_path = generate_type_distribution_bar_chart(summary)
        if chart1_path:
            temp_files.append(chart1_path)
            img1 = Image(chart1_path, width=6*inch, height=3*inch)
            story.append(img1)
            story.append(Paragraph('Figure 1: Count of equipment by type', caption_style))
        
        story.append(Spacer(1, 0.2*inch))
        
        # Chart 2: Equipment Share (on same page as Chart 1)
        story.append(Paragraph('Equipment Share by Type', heading_style))
        chart2_path = generate_equipment_share_donut_chart(summary)
        if chart2_path:
            temp_files.append(chart2_path)
            img2 = Image(chart2_path, width=4.5*inch, height=3.5*inch)
            story.append(img2)
            story.append(Paragraph('Figure 2: Percentage distribution of equipment types', caption_style))
        
        story.append(PageBreak())
        
        # Chart 3: Avg Metrics per Type
        story.append(Paragraph('Average Metrics per Equipment Type', heading_style))
        chart3_path = generate_avg_metrics_per_type_chart(summary)
        if chart3_path:
            temp_files.append(chart3_path)
            img3 = Image(chart3_path, width=6.5*inch, height=3.8*inch)
            story.append(img3)
            story.append(Paragraph('Figure 3: Comparison of average flowrate, pressure, and temperature by equipment type', caption_style))
        
        story.append(Spacer(1, 0.3*inch))
        
        # Chart 4: Overall Metrics
        story.append(Paragraph('Overall Average Metrics', heading_style))
        chart4_path = generate_overall_avg_metrics_chart(summary)
        if chart4_path:
            temp_files.append(chart4_path)
            img4 = Image(chart4_path, width=6*inch, height=3.6*inch)
            story.append(img4)
            story.append(Paragraph('Figure 4: Overall system average metrics', caption_style))
        
        story.append(PageBreak())
        
        # Chart 5: Radar Chart
        story.append(Paragraph('Equipment Performance Profile', heading_style))
        chart5_path = generate_radar_chart(summary)
        if chart5_path:
            temp_files.append(chart5_path)
            img5 = Image(chart5_path, width=5*inch, height=5*inch)
            story.append(img5)
            story.append(Paragraph('Figure 5: Multi-metric performance fingerprint (normalized)', caption_style))
        
        # Build PDF
        doc.build(story)
        
    finally:
        # Cleanup temporary chart files
        for temp_file in temp_files:
            try:
                if temp_file and os.path.exists(temp_file):
                    os.unlink(temp_file)
            except Exception:
                pass
    
    buffer.seek(0)
    return buffer.read()

