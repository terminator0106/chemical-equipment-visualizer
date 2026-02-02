from __future__ import annotations

import os
import sys

from PyQt5 import QtCore, QtGui, QtWidgets

from api_client import ApiClient
from auth import AuthWidget
from upload import UploadWidget
from dashboard import DashboardWidget
from history import HistoryWidget


def _read_styles() -> str:
    here = os.path.dirname(os.path.abspath(__file__))
    path = os.path.join(here, "styles.qss")
    with open(path, "r", encoding="utf-8") as f:
        return f.read()


class TopNavBar(QtWidgets.QFrame):
    logout_clicked = QtCore.pyqtSignal()
    tab_clicked = QtCore.pyqtSignal(int)  # 0=Dashboard, 1=Upload, 2=History

    def __init__(self, api: ApiClient, parent=None):
        super().__init__(parent)
        self.api = api
        self.setObjectName("TopBar")
        self.setFixedHeight(64)

        layout = QtWidgets.QHBoxLayout(self)
        layout.setContentsMargins(32, 0, 32, 0)
        layout.setSpacing(28)

        # Left: App title
        title = QtWidgets.QLabel("ChemViz Analytics")
        title.setObjectName("AppTitle")

        # Right: Nav links + Logout
        nav_container = QtWidgets.QHBoxLayout()
        nav_container.setSpacing(28)

        self.dashboard_btn = self._create_nav_button("Dashboard")
        self.upload_btn = self._create_nav_button("Upload")
        self.history_btn = self._create_nav_button("History")

        self.dashboard_btn.clicked.connect(lambda: self.tab_clicked.emit(0))
        self.upload_btn.clicked.connect(lambda: self.tab_clicked.emit(1))
        self.history_btn.clicked.connect(lambda: self.tab_clicked.emit(2))

        logout_btn = QtWidgets.QPushButton("Logout")
        logout_btn.setObjectName("OutlineButton")
        logout_btn.setStyleSheet("font-size: 15px; min-height: 42px; padding: 8px 22px;")
        logout_btn.clicked.connect(self.logout_clicked.emit)

        nav_container.addWidget(self.dashboard_btn)
        nav_container.addWidget(self.upload_btn)
        nav_container.addWidget(self.history_btn)
        nav_container.addWidget(logout_btn)

        layout.addWidget(title)
        layout.addStretch(1)
        layout.addLayout(nav_container)

    def _create_nav_button(self, text: str) -> QtWidgets.QPushButton:
        btn = QtWidgets.QPushButton(text)
        btn.setFlat(True)
        btn.setCursor(QtCore.Qt.PointingHandCursor)
        btn.setStyleSheet("""
            QPushButton {
                background: transparent;
                color: #9CA3AF;
                border: none;
                font-size: 16px;
                font-weight: 600;
                padding: 10px 0px;
            }
            QPushButton:hover {
                color: #22D3EE;
            }
        """)
        return btn

    def set_active_tab(self, index: int):
        for i, btn in enumerate([self.dashboard_btn, self.upload_btn, self.history_btn]):
            if i == index:
                btn.setStyleSheet("""
                    QPushButton {
                        background: transparent;
                        color: #E5E7EB;
                        border: none;
                        font-size: 16px;
                        font-weight: 600;
                        padding: 10px 0px;
                    }
                    QPushButton:hover {
                        color: #22D3EE;
                    }
                """)
            else:
                btn.setStyleSheet("""
                    QPushButton {
                        background: transparent;
                        color: #9CA3AF;
                        border: none;
                        font-size: 16px;
                        font-weight: 600;
                        padding: 10px 0px;
                    }
                    QPushButton:hover {
                        color: #22D3EE;
                    }
                """)


class MainWindow(QtWidgets.QMainWindow):
    def __init__(self):
        super().__init__()
        self.setWindowTitle("ChemViz Analytics")
        self.resize(1280, 800)

        self.api = ApiClient()

        self._stack = QtWidgets.QStackedWidget()
        self.setCentralWidget(self._stack)

        self.login = self._build_login()
        self.app = self._build_app()

        self._stack.addWidget(self.login)
        self._stack.addWidget(self.app)
        self._stack.setCurrentWidget(self.login)

        self.apply_theme()

    def _build_login(self) -> QtWidgets.QWidget:
        container = QtWidgets.QWidget()
        layout = QtWidgets.QVBoxLayout(container)
        layout.setContentsMargins(60, 60, 60, 60)

        spacer_top = QtWidgets.QSpacerItem(1, 1, QtWidgets.QSizePolicy.Minimum, QtWidgets.QSizePolicy.Expanding)
        spacer_bottom = QtWidgets.QSpacerItem(1, 1, QtWidgets.QSizePolicy.Minimum, QtWidgets.QSizePolicy.Expanding)

        card = AuthWidget(self.api)
        card.setMaximumWidth(800)
        card.authenticated.connect(self._on_logged_in)

        row = QtWidgets.QHBoxLayout()
        row.addStretch(1)
        row.addWidget(card)
        row.addStretch(1)

        layout.addItem(spacer_top)
        layout.addLayout(row)
        layout.addItem(spacer_bottom)
        return container

    def _build_app(self) -> QtWidgets.QWidget:
        container = QtWidgets.QWidget()
        root = QtWidgets.QVBoxLayout(container)
        root.setContentsMargins(0, 0, 0, 0)
        root.setSpacing(0)

        # Top navbar
        self.navbar = TopNavBar(self.api)
        self.navbar.logout_clicked.connect(self._logout)
        self.navbar.tab_clicked.connect(self._switch_tab)

        # Content area with padding
        content = QtWidgets.QWidget()
        content_layout = QtWidgets.QVBoxLayout(content)
        content_layout.setContentsMargins(32, 32, 32, 32)

        self.tabs = QtWidgets.QStackedWidget()

        self.dashboard = DashboardWidget(self.api)
        self.dashboard.request_open_pdf.connect(self._handle_pdf)

        self.upload = UploadWidget(self.api)
        self.upload.uploaded.connect(self._after_upload)

        self.history = HistoryWidget(self.api)
        self.history.dataset_selected.connect(self._load_dataset)
        self.history.request_open_pdf.connect(self._handle_pdf)

        self.tabs.addWidget(self.dashboard)
        self.tabs.addWidget(self.upload)
        self.tabs.addWidget(self.history)

        content_layout.addWidget(self.tabs)

        root.addWidget(self.navbar)
        root.addWidget(content, 1)

        return container

    def _switch_tab(self, index: int):
        self.tabs.setCurrentIndex(index)
        self.navbar.set_active_tab(index)
        if index == 2:  # History
            self.history.refresh()

    def _on_logged_in(self) -> None:
        self._stack.setCurrentWidget(self.app)
        self._switch_tab(0)  # Show dashboard
        self.history.refresh()

    def _after_upload(self, dataset_id: int, summary: dict) -> None:
        self.dashboard.set_summary(summary, dataset_id)
        self._switch_tab(0)  # Switch to dashboard
        self.history.refresh()

    def _load_dataset(self, dataset_id: int, summary: dict) -> None:
        self.dashboard.set_summary(summary, dataset_id)
        self._switch_tab(0)

    def _logout(self) -> None:
        self.api.logout()
        self.dashboard._set_empty()
        self._stack.setCurrentWidget(self.login)

    def apply_theme(self) -> None:
        self.setStyleSheet(_read_styles())

    def _handle_pdf(self, pdf_bytes: bytes, suggested_name: str) -> None:
        default = os.path.join(QtCore.QStandardPaths.writableLocation(QtCore.QStandardPaths.DownloadLocation), suggested_name)
        path, _ = QtWidgets.QFileDialog.getSaveFileName(self, "Save PDF", default, "PDF Files (*.pdf)")
        if not path:
            return
        if not path.lower().endswith(".pdf"):
            path += ".pdf"
        with open(path, "wb") as f:
            f.write(pdf_bytes)
        QtGui.QDesktopServices.openUrl(QtCore.QUrl.fromLocalFile(path))


def main() -> int:
    QtWidgets.QApplication.setAttribute(QtCore.Qt.AA_EnableHighDpiScaling, True)
    QtWidgets.QApplication.setAttribute(QtCore.Qt.AA_UseHighDpiPixmaps, True)

    app = QtWidgets.QApplication(sys.argv)

    font = QtGui.QFont("Inter")
    font.setPointSize(11)
    app.setFont(font)

    win = MainWindow()
    win.show()
    return app.exec_()


if __name__ == "__main__":
    raise SystemExit(main())
