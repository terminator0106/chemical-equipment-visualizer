from __future__ import annotations

from dataclasses import dataclass
from typing import Any, Dict, Optional

import matplotlib

# Use Qt backend for embedding.
matplotlib.use("Qt5Agg")

from matplotlib.figure import Figure
import numpy as np


@dataclass(frozen=True)
class Theme:
    bg: str
    panel: str
    text: str
    muted: str
    grid: str
    cyan: str
    blue: str
    teal: str
    amber: str


DARK = Theme(
    bg="#0B0F19",
    panel="#121826",
    text="#E5E7EB",
    muted="#9CA3AF",
    grid="#1F2937",
    cyan="#22D3EE",
    blue="#3B82F6",
    teal="#22C55E",
    amber="#F59E0B",
)


def _style_axes(ax, theme: Theme, title: str) -> None:
    ax.set_facecolor(theme.panel)
    ax.tick_params(colors=theme.muted, labelsize=11)
    for spine in ax.spines.values():
        spine.set_color(theme.grid)
    ax.title.set_color(theme.text)
    ax.xaxis.label.set_color(theme.muted)
    ax.yaxis.label.set_color(theme.muted)
    ax.set_title(title, fontsize=15, fontweight="bold", pad=14)


def figure_bar_type_distribution(summary: Dict[str, Any], theme: Theme) -> Figure:
    dist = (summary or {}).get("equipment_type_distribution") or {}

    fig = Figure(figsize=(6.2, 3.8), dpi=100)
    fig.patch.set_facecolor(theme.bg)
    ax = fig.add_subplot(111)

    if not dist:
        ax.text(0.5, 0.5, "No data", ha="center", va="center", color=theme.muted)
        ax.set_axis_off()
        return fig

    types = list(dist.keys())
    counts = [dist[t] for t in types]

    colors = [theme.cyan] * len(types)
    bars = ax.bar(types, counts, color=colors, edgecolor=theme.grid, linewidth=1.0)

    _style_axes(ax, theme, "Equipment Type Distribution")
    ax.set_xlabel("Type", fontsize=12)
    ax.set_ylabel("Count", fontsize=12)
    ax.grid(axis="y", color=theme.grid, alpha=0.35, linestyle="--")

    ax.set_xticklabels(types, rotation=20, ha="right")
    for b in bars:
        ax.text(
            b.get_x() + b.get_width() / 2,
            b.get_height() + max(counts) * 0.02,
            f"{int(b.get_height())}",
            ha="center",
            va="bottom",
            color=theme.text,
            fontsize=10,
        )

    fig.tight_layout()
    return fig


def figure_donut_share(summary: Dict[str, Any], theme: Theme) -> Figure:
    dist = (summary or {}).get("equipment_type_distribution") or {}

    fig = Figure(figsize=(6.2, 3.8), dpi=100)
    fig.patch.set_facecolor(theme.bg)
    ax = fig.add_subplot(111)

    if not dist:
        ax.text(0.5, 0.5, "No data", ha="center", va="center", color=theme.muted)
        ax.set_axis_off()
        return fig

    labels = list(dist.keys())
    values = [dist[k] for k in labels]

    palette = [theme.cyan, theme.blue, theme.teal, theme.amber]
    colors = [palette[i % len(palette)] for i in range(len(labels))]

    wedges, _, autotexts = ax.pie(
        values,
        colors=colors,
        startangle=90,
        autopct="%1.1f%%",
        pctdistance=0.78,
        wedgeprops={"width": 0.38, "edgecolor": theme.bg, "linewidth": 1.2},
        textprops={"color": theme.text, "fontsize": 11},
    )

    for t in autotexts:
        t.set_color(theme.text)
        t.set_fontweight("bold")

    _style_axes(ax, theme, "Equipment Share")
    ax.axis("equal")
    ax.legend(
        wedges,
        labels,
        loc="center left",
        bbox_to_anchor=(1.0, 0.5),
        frameon=False,
        labelcolor=theme.muted,
        fontsize=11,
    )

    fig.tight_layout()
    return fig


def figure_avg_metrics_per_type(summary: Dict[str, Any], theme: Theme) -> Figure:
    metrics = (summary or {}).get("avg_metrics_per_type") or {}

    fig = Figure(figsize=(12.4, 4.2), dpi=100)
    fig.patch.set_facecolor(theme.bg)
    ax = fig.add_subplot(111)

    if not metrics:
        ax.text(0.5, 0.5, "No data", ha="center", va="center", color=theme.muted)
        ax.set_axis_off()
        return fig

    types = list(metrics.keys())
    flow = [metrics[t].get("avg_flowrate", 0) for t in types]
    press = [metrics[t].get("avg_pressure", 0) for t in types]
    temp = [metrics[t].get("avg_temperature", 0) for t in types]

    x = np.arange(len(types))
    w = 0.25

    ax.bar(x - w, flow, w, label="Avg Flowrate", color=theme.cyan, edgecolor=theme.grid, linewidth=1.0)
    ax.bar(x, press, w, label="Avg Pressure", color=theme.teal, edgecolor=theme.grid, linewidth=1.0)
    ax.bar(x + w, temp, w, label="Avg Temperature", color=theme.blue, edgecolor=theme.grid, linewidth=1.0)

    _style_axes(ax, theme, "Avg Metrics per Type")
    ax.set_xlabel("Type", fontsize=12)
    ax.set_ylabel("Value", fontsize=12)
    ax.set_xticks(x)
    ax.set_xticklabels(types, rotation=20, ha="right")
    ax.grid(axis="y", color=theme.grid, alpha=0.35, linestyle="--")
    leg = ax.legend(frameon=False, fontsize=11)
    for text in leg.get_texts():
        text.set_color(theme.muted)

    fig.tight_layout()
    return fig


def figure_optional_radar(summary: Dict[str, Any], theme: Theme) -> Optional[Figure]:
    # Optional: normalize overall averages to 0-100 for quick profile.
    avg_flow = float((summary or {}).get("average_flowrate") or 0)
    avg_press = float((summary or {}).get("average_pressure") or 0)
    avg_temp = float((summary or {}).get("average_temperature") or 0)

    values = np.array([avg_flow, avg_press, avg_temp], dtype=float)
    if np.all(values == 0):
        return None

    maxv = float(np.max(values)) or 1.0
    scaled = (values / maxv) * 100.0

    labels = ["Flow", "Pressure", "Temp"]
    angles = np.linspace(0, 2 * np.pi, len(labels), endpoint=False)

    fig = Figure(figsize=(5.8, 3.4), dpi=100)
    fig.patch.set_facecolor(theme.bg)
    ax = fig.add_subplot(111, polar=True)
    ax.set_facecolor(theme.panel)

    angles_closed = np.concatenate([angles, [angles[0]]])
    scaled_closed = np.concatenate([scaled, [scaled[0]]])

    ax.plot(angles_closed, scaled_closed, color=theme.cyan, linewidth=2)
    ax.fill(angles_closed, scaled_closed, color=theme.cyan, alpha=0.25)

    ax.set_xticks(angles)
    ax.set_xticklabels(labels)
    for t in ax.get_xticklabels():
        t.set_color(theme.muted)
        t.set_fontsize(9)

    ax.set_yticklabels([])
    ax.grid(color=theme.grid, alpha=0.35)
    ax.set_title("Performance Profile", color=theme.text, fontsize=13, fontweight="bold", pad=12)

    fig.tight_layout()
    return fig
