from __future__ import annotations

from dataclasses import dataclass
from typing import Optional

from PyQt5 import QtCore, QtWidgets


@dataclass(frozen=True)
class Spacing:
    page_padding: int = 32
    card_padding: int = 24
    gap_sm: int = 12
    gap_md: int = 18
    gap_lg: int = 24


SPACING = Spacing()


class CardFrame(QtWidgets.QFrame):
    def __init__(self, parent: Optional[QtWidgets.QWidget] = None, *, padding: Optional[int] = None, hover: bool = True):
        super().__init__(parent)
        self.setObjectName("CardHover" if hover else "Card")
        layout = QtWidgets.QVBoxLayout(self)
        p = SPACING.card_padding if padding is None else int(padding)
        layout.setContentsMargins(p, p, p, p)
        layout.setSpacing(SPACING.gap_md)


class PageTitle(QtWidgets.QLabel):
    def __init__(self, text: str, parent: Optional[QtWidgets.QWidget] = None):
        super().__init__(text, parent)
        self.setObjectName("PageTitle")


class SectionTitle(QtWidgets.QLabel):
    def __init__(self, text: str, parent: Optional[QtWidgets.QWidget] = None):
        super().__init__(text, parent)
        self.setObjectName("SectionTitle")


class MutedLabel(QtWidgets.QLabel):
    def __init__(self, text: str = "", parent: Optional[QtWidgets.QWidget] = None):
        super().__init__(text, parent)
        self.setObjectName("Muted")
        self.setWordWrap(True)


class PrimaryButton(QtWidgets.QPushButton):
    def __init__(self, text: str, parent: Optional[QtWidgets.QWidget] = None):
        super().__init__(text, parent)
        self.setObjectName("PrimaryButton")
        self.setMinimumHeight(50)


class SecondaryButton(QtWidgets.QPushButton):
    def __init__(self, text: str, parent: Optional[QtWidgets.QWidget] = None):
        super().__init__(text, parent)
        self.setObjectName("SecondaryButton")
        self.setMinimumHeight(50)


class OutlineButton(QtWidgets.QPushButton):
    def __init__(self, text: str, parent: Optional[QtWidgets.QWidget] = None):
        super().__init__(text, parent)
        self.setObjectName("OutlineButton")
        self.setMinimumHeight(50)


class DangerButton(QtWidgets.QPushButton):
    def __init__(self, text: str, parent: Optional[QtWidgets.QWidget] = None):
        super().__init__(text, parent)
        self.setObjectName("DangerButton")
        self.setMinimumHeight(50)


class TextInput(QtWidgets.QLineEdit):
    def __init__(self, placeholder: str = "", parent: Optional[QtWidgets.QWidget] = None):
        super().__init__(parent)
        self.setPlaceholderText(placeholder)
        self.setMinimumHeight(50)


class PasswordInput(QtWidgets.QLineEdit):
    def __init__(self, placeholder: str = "", parent: Optional[QtWidgets.QWidget] = None):
        super().__init__(parent)
        self.setPlaceholderText(placeholder)
        self.setEchoMode(QtWidgets.QLineEdit.Password)
        self.setMinimumHeight(50)


class Divider(QtWidgets.QFrame):
    def __init__(self, parent: Optional[QtWidgets.QWidget] = None):
        super().__init__(parent)
        self.setObjectName("Divider")
        self.setFixedHeight(1)


class KPICardWidget(CardFrame):
    def __init__(self, title: str, icon: str = "📊", color: str = "cyan", parent=None):
        super().__init__(parent, padding=28, hover=False)
        self.setObjectName(f"KPICard_{color}")
        self.color = color
        self.setMinimumHeight(200)
        
        icon_label = QtWidgets.QLabel(icon)
        icon_label.setObjectName("KPIIcon")
        icon_label.setStyleSheet("font-size: 48px;")  # Larger icon
        
        title_label = QtWidgets.QLabel(title.upper())
        title_label.setObjectName("KPITitle")
        title_label.setStyleSheet("font-size: 13px; font-weight: 700; letter-spacing: 1px;")  # Better title
        
        self.value_label = QtWidgets.QLabel("—")
        self.value_label.setObjectName("KPIValue")
        self.value_label.setStyleSheet("font-size: 42px; font-weight: 900;")  # Much larger value
        
        layout = self.layout()
        layout.addWidget(icon_label)
        layout.addWidget(title_label)
        layout.addWidget(self.value_label)
        layout.addStretch()
    
    def set_value(self, value: float, unit: str = "") -> None:
        text = f"{value:.2f}"
        if unit:
            text += f"<span style='font-size: 20px; color: #9CA3AF; font-weight: 400; margin-left: 4px;'>{unit}</span>"
        self.value_label.setText(text)


class MetricBadge(QtWidgets.QFrame):
    def __init__(self, value: str, label: str, color: str = "blue", parent=None):
        super().__init__(parent)
        self.setObjectName(f"MetricBadge_{color}")
        
        layout = QtWidgets.QHBoxLayout(self)
        layout.setContentsMargins(14, 10, 14, 10)
        layout.setSpacing(8)
        
        val_label = QtWidgets.QLabel(value)
        val_label.setObjectName("MetricValue")
        
        text_label = QtWidgets.QLabel(label)
        text_label.setObjectName("MetricLabel")
        
        layout.addWidget(val_label)
        layout.addWidget(text_label)


def wrap_in_page(widget: QtWidgets.QWidget) -> QtWidgets.QWidget:
    """Applies consistent page padding and top alignment."""
    container = QtWidgets.QWidget()
    layout = QtWidgets.QVBoxLayout(container)
    layout.setContentsMargins(SPACING.page_padding, SPACING.page_padding, SPACING.page_padding, SPACING.page_padding)
    layout.setSpacing(SPACING.gap_lg)
    layout.addWidget(widget)
    layout.addStretch(1)
    return container
