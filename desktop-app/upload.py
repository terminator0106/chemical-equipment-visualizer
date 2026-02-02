from __future__ import annotations

import os
from typing import Optional

from PyQt5 import QtCore, QtWidgets

from api_client import ApiClient
from auth import ApiWorker
from ui_components import CardFrame, MutedLabel, OutlineButton, PageTitle, PrimaryButton, SPACING


class UploadWidget(QtWidgets.QWidget):
    uploaded = QtCore.pyqtSignal(int, dict)

    def __init__(self, api: ApiClient, parent=None):
        super().__init__(parent)
        self.api = api
        self._worker: Optional[ApiWorker] = None
        self._file_path: Optional[str] = None

        root = QtWidgets.QVBoxLayout(self)
        root.setContentsMargins(50, 40, 50, 40)
        root.setSpacing(SPACING.gap_lg)

        # Header
        header = QtWidgets.QVBoxLayout()
        header.setSpacing(8)
        
        title = PageTitle("Upload Dataset")
        title.setStyleSheet("font-size: 38px; font-weight: 900; background: transparent; color: #E5E7EB;")
        
        subtitle = MutedLabel("Upload a CSV file for instant analytics and insights")
        subtitle.setStyleSheet("font-size: 18px; color: #9CA3AF; background: transparent;")
        
        header.addWidget(title)
        header.addWidget(subtitle)

        # Upload card
        upload_card = CardFrame(padding=48, hover=False)
        upload_card.setMinimumHeight(400)
        
        card_content = QtWidgets.QVBoxLayout()
        card_content.setAlignment(QtCore.Qt.AlignCenter)
        card_content.setSpacing(24)
        
        upload_icon = QtWidgets.QLabel("📁")
        upload_icon.setObjectName("UploadIcon")
        upload_icon.setAlignment(QtCore.Qt.AlignCenter)
        
        card_title = QtWidgets.QLabel("Choose CSV File")
        card_title.setObjectName("UploadTitle")
        card_title.setAlignment(QtCore.Qt.AlignCenter)
        
        self.file_label = MutedLabel("No file selected")
        self.file_label.setObjectName("UploadText")
        self.file_label.setAlignment(QtCore.Qt.AlignCenter)
        self.file_label.setWordWrap(True)
        
        browse_btn = OutlineButton("Browse Files")
        browse_btn.setStyleSheet("min-width: 240px; font-size: 17px; min-height: 56px;")
        browse_btn.clicked.connect(self._choose_file)
        
        self.upload_btn = PrimaryButton("Upload and Analyze →")
        self.upload_btn.setDisabled(True)
        self.upload_btn.setStyleSheet("min-width: 240px; font-size: 17px; min-height: 56px;")
        self.upload_btn.clicked.connect(self._upload)
        
        self.status_label = MutedLabel("")
        self.status_label.setAlignment(QtCore.Qt.AlignCenter)
        
        card_content.addWidget(upload_icon)
        card_content.addWidget(card_title)
        card_content.addWidget(self.file_label)
        card_content.addWidget(browse_btn)
        card_content.addWidget(self.upload_btn)
        card_content.addWidget(self.status_label)
        
        upload_card.layout().addLayout(card_content)

        root.addLayout(header)
        root.addWidget(upload_card)
        root.addStretch(1)

    def _choose_file(self) -> None:
        path, _ = QtWidgets.QFileDialog.getOpenFileName(self, "Select CSV", "", "CSV Files (*.csv)")
        if not path:
            return
        self._file_path = path
        self.file_label.setText(f"✓ {os.path.basename(path)}")
        self.file_label.setStyleSheet("color: #22D3EE; font-size: 18px; font-weight: 700; background: transparent;")
        self.status_label.setText("")
        self.upload_btn.setDisabled(False)

    def _set_loading(self, loading: bool) -> None:
        self.upload_btn.setDisabled(loading or not self._file_path)
        self.upload_btn.setText("Uploading…" if loading else "Upload and Analyze →")

    def _upload(self) -> None:
        if not self._file_path:
            return
        self.status_label.setText("")
        self._set_loading(True)

        file_path = self._file_path

        def work():
            return self.api.upload_csv(file_path)

        self._worker = ApiWorker(work, self)
        self._worker.succeeded.connect(self._ok)
        self._worker.failed.connect(self._failed)
        self._worker.start()

    def _ok(self, result):
        self._set_loading(False)
        dataset_id, summary = result
        self.status_label.setText("✓ Upload successful!")
        self.status_label.setStyleSheet("color: #22C55E; font-size: 15px;")
        self.uploaded.emit(int(dataset_id), summary)

    def _failed(self, message: str):
        self._set_loading(False)
        self.status_label.setText(f"✗ {message}")
        self.status_label.setStyleSheet("color: #EF4444; font-size: 15px;")
