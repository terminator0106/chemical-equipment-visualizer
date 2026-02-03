from __future__ import annotations

from dataclasses import dataclass
from typing import Optional

from PyQt5 import QtCore, QtWidgets

from api_client import ApiClient, ApiError


class ApiWorker(QtCore.QThread):
    succeeded = QtCore.pyqtSignal(object)
    failed = QtCore.pyqtSignal(str)

    def __init__(self, fn, parent=None):
        super().__init__(parent)
        self._fn = fn

    def run(self):
        try:
            result = self._fn()
            self.succeeded.emit(result)
        except ApiError as e:
            self.failed.emit(str(e))
        except Exception as e:
            self.failed.emit(str(e))


class LoginWidget(QtWidgets.QWidget):
    logged_in = QtCore.pyqtSignal()

    def __init__(self, api: ApiClient, parent=None):
        super().__init__(parent)
        self.api = api
        self._worker: Optional[ApiWorker] = None
        self.setStyleSheet("background: transparent;")

        # Header
        title = QtWidgets.QLabel("Welcome back")
        title.setAlignment(QtCore.Qt.AlignLeft)
        title.setStyleSheet("font-size: 42px; font-weight: 900; background: transparent; color: #E5E7EB;")
        
        subtitle = QtWidgets.QLabel("Sign in to access your datasets and reports")
        subtitle.setAlignment(QtCore.Qt.AlignLeft)
        subtitle.setStyleSheet("font-size: 16px; background: transparent; color: #9CA3AF; font-weight: 400;")

        # Email/Username field
        email_label = QtWidgets.QLabel("Email / Username")
        email_label.setStyleSheet("background: transparent; color: #9CA3AF; font-size: 14px; font-weight: 600; margin-bottom: 8px;")
        
        self.user_input = QtWidgets.QLineEdit()
        self.user_input.setObjectName("AuthInput")
        self.user_input.setPlaceholderText("Email or Username")
        self.user_input.setMinimumHeight(40)
        self.user_input.setStyleSheet("""
            QLineEdit#AuthInput {
                font-size: 14px;
                padding: 10px 14px;
                border: 2px solid #1F2937;
                border-radius: 12px;
                background: rgba(17, 24, 39, 0.4);
                color: #E5E7EB;
            }
            QLineEdit#AuthInput:focus {
                border: 2px solid #3B82F6;
                background: rgba(17, 24, 39, 0.6);
            }
        """)

        # Password field
        password_label = QtWidgets.QLabel("Password")
        password_label.setStyleSheet("background: transparent; color: #9CA3AF; font-size: 14px; font-weight: 600; margin-bottom: 8px;")
        
        self.pass_input = QtWidgets.QLineEdit()
        self.pass_input.setObjectName("AuthInput")
        self.pass_input.setEchoMode(QtWidgets.QLineEdit.Password)
        self.pass_input.setPlaceholderText("Password")
        self.pass_input.setMinimumHeight(40)
        self.pass_input.setStyleSheet("""
            QLineEdit#AuthInput {
                font-size: 14px;
                padding: 10px 14px;
                border: 2px solid #1F2937;
                border-radius: 12px;
                background: rgba(17, 24, 39, 0.4);
                color: #E5E7EB;
            }
            QLineEdit#AuthInput:focus {
                border: 2px solid #3B82F6;
                background: rgba(17, 24, 39, 0.6);
            }
        """)

        # Error label
        self.error_label = QtWidgets.QLabel("")
        self.error_label.setWordWrap(True)
        self.error_label.setStyleSheet("font-size: 13px; color: #EF4444; background: transparent;")

        # Login button
        self.login_btn = QtWidgets.QPushButton("Login")
        self.login_btn.setObjectName("PrimaryButton")
        self.login_btn.setMinimumHeight(54)
        self.login_btn.setStyleSheet("""
            QPushButton {
                background: qlineargradient(x1:0, y1:0, x2:1, y2:0,
                    stop:0 #3B82F6,
                    stop:1 #2563EB);
                color: #ffffff;
                border: 2px solid rgba(59, 130, 246, 0.70);
                border-radius: 12px;
                font-size: 16px;
                font-weight: 700;
                padding: 14px;
            }
            QPushButton:hover {
                background: qlineargradient(x1:0, y1:0, x2:1, y2:0,
                    stop:0 #2F6FE0,
                    stop:1 #1D4ED8);
                border: 2px solid rgba(59, 130, 246, 0.85);
            }
            QPushButton:pressed {
                background: #2A63C8;
            }
        """)
        self.login_btn.setCursor(QtCore.Qt.PointingHandCursor)
        self.login_btn.clicked.connect(self._on_login)

        # Vertical layout
        layout = QtWidgets.QVBoxLayout(self)
        layout.setContentsMargins(0, 0, 0, 0)
        layout.setSpacing(0)
        
        layout.addWidget(title)
        layout.addSpacing(6)
        layout.addWidget(subtitle)
        layout.addSpacing(36)
        
        layout.addWidget(email_label)
        layout.addSpacing(8)
        layout.addWidget(self.user_input)
        layout.addSpacing(24)
        
        layout.addWidget(password_label)
        layout.addSpacing(8)
        layout.addWidget(self.pass_input)
        layout.addSpacing(12)
        
        layout.addWidget(self.error_label)
        layout.addSpacing(24)
        layout.addWidget(self.login_btn)
        layout.addSpacing(4)

    def _set_loading(self, loading: bool) -> None:
        self.login_btn.setDisabled(loading)
        self.user_input.setDisabled(loading)
        self.pass_input.setDisabled(loading)
        self.login_btn.setText("Signing in…" if loading else "Login")

    def _on_login(self) -> None:
        self.error_label.setText("")
        username = self.user_input.text().strip()
        password = self.pass_input.text()

        self._set_loading(True)

        def work():
            self.api.login(username, password)
            return True

        self._worker = ApiWorker(work, self)
        self._worker.succeeded.connect(self._login_ok)
        self._worker.failed.connect(self._login_failed)
        self._worker.start()

    def _login_ok(self, _):
        self._set_loading(False)
        self.logged_in.emit()

    def _login_failed(self, message: str):
        self._set_loading(False)
        self.error_label.setText(message)


class SignupWidget(QtWidgets.QWidget):
    signed_up = QtCore.pyqtSignal()

    def __init__(self, api: ApiClient, parent=None):
        super().__init__(parent)
        self.api = api
        self._worker: Optional[ApiWorker] = None
        self.setStyleSheet("background: transparent;")

        # Header
        title = QtWidgets.QLabel("Create your account")
        title.setAlignment(QtCore.Qt.AlignLeft)
        title.setStyleSheet("font-size: 42px; font-weight: 900; background: transparent; color: #E5E7EB;")
        
        subtitle = QtWidgets.QLabel("Sign up and start uploading CSVs")
        subtitle.setAlignment(QtCore.Qt.AlignLeft)
        subtitle.setStyleSheet("font-size: 16px; background: transparent; color: #9CA3AF; font-weight: 400;")

        # Input field styling
        input_style = """
            QLineEdit#AuthInput {
                font-size: 14px;
                padding: 10px 14px;
                border: 2px solid #1F2937;
                border-radius: 12px;
                background: rgba(17, 24, 39, 0.4);
                color: #E5E7EB;
            }
            QLineEdit#AuthInput:focus {
                border: 2px solid #3B82F6;
                background: rgba(17, 24, 39, 0.6);
            }
        """
        label_style = "background: transparent; color: #9CA3AF; font-size: 14px; font-weight: 600; margin-bottom: 8px;"

        # Name field
        name_label = QtWidgets.QLabel("Name")
        name_label.setStyleSheet(label_style)
        self.name_input = QtWidgets.QLineEdit()
        self.name_input.setObjectName("AuthInput")
        self.name_input.setPlaceholderText("Full name")
        self.name_input.setMinimumHeight(40)
        self.name_input.setStyleSheet(input_style)

        # Email field
        email_label = QtWidgets.QLabel("Email")
        email_label.setStyleSheet(label_style)
        self.email_input = QtWidgets.QLineEdit()
        self.email_input.setObjectName("AuthInput")
        self.email_input.setPlaceholderText("Email")
        self.email_input.setMinimumHeight(40)
        self.email_input.setStyleSheet(input_style)

        # Password field
        password_label = QtWidgets.QLabel("Password")
        password_label.setStyleSheet(label_style)
        self.pass_input = QtWidgets.QLineEdit()
        self.pass_input.setObjectName("AuthInput")
        self.pass_input.setEchoMode(QtWidgets.QLineEdit.Password)
        self.pass_input.setPlaceholderText("Password")
        self.pass_input.setMinimumHeight(40)
        self.pass_input.setStyleSheet(input_style)

        # Confirm password field
        confirm_label = QtWidgets.QLabel("Confirm Password")
        confirm_label.setStyleSheet(label_style)
        self.confirm_input = QtWidgets.QLineEdit()
        self.confirm_input.setObjectName("AuthInput")
        self.confirm_input.setEchoMode(QtWidgets.QLineEdit.Password)
        self.confirm_input.setPlaceholderText("Confirm password")
        self.confirm_input.setMinimumHeight(40)
        self.confirm_input.setStyleSheet(input_style)

        # Error label
        self.error_label = QtWidgets.QLabel("")
        self.error_label.setWordWrap(True)
        self.error_label.setStyleSheet("font-size: 13px; color: #EF4444; background: transparent;")

        # Signup button
        self.signup_btn = QtWidgets.QPushButton("Create account")
        self.signup_btn.setObjectName("PrimaryButton")
        self.signup_btn.setMinimumHeight(54)
        self.signup_btn.setStyleSheet("""
            QPushButton {
                background: qlineargradient(x1:0, y1:0, x2:1, y2:0,
                    stop:0 #3B82F6,
                    stop:1 #2563EB);
                color: #ffffff;
                border: 2px solid rgba(59, 130, 246, 0.70);
                border-radius: 12px;
                font-size: 16px;
                font-weight: 700;
                padding: 14px;
            }
            QPushButton:hover {
                background: qlineargradient(x1:0, y1:0, x2:1, y2:0,
                    stop:0 #2F6FE0,
                    stop:1 #1D4ED8);
                border: 2px solid rgba(59, 130, 246, 0.85);
            }
            QPushButton:pressed {
                background: #2A63C8;
            }
        """)
        self.signup_btn.setCursor(QtCore.Qt.PointingHandCursor)
        self.signup_btn.clicked.connect(self._on_signup)

        # Vertical layout
        layout = QtWidgets.QVBoxLayout(self)
        layout.setContentsMargins(0, 0, 0, 0)
        layout.setSpacing(0)
        
        layout.addWidget(title)
        layout.addSpacing(4)
        layout.addWidget(subtitle)
        layout.addSpacing(24)
        
        layout.addWidget(name_label)
        layout.addSpacing(6)
        layout.addWidget(self.name_input)
        layout.addSpacing(16)
        
        layout.addWidget(email_label)
        layout.addSpacing(6)
        layout.addWidget(self.email_input)
        layout.addSpacing(16)
        
        layout.addWidget(password_label)
        layout.addSpacing(6)
        layout.addWidget(self.pass_input)
        layout.addSpacing(16)
        
        layout.addWidget(confirm_label)
        layout.addSpacing(6)
        layout.addWidget(self.confirm_input)
        layout.addSpacing(8)
        
        layout.addWidget(self.error_label)
        layout.addSpacing(20)
        layout.addWidget(self.signup_btn)
        layout.addStretch()

    def _set_loading(self, loading: bool) -> None:
        for w in (self.name_input, self.email_input, self.pass_input, self.confirm_input, self.signup_btn):
            w.setDisabled(loading)
        self.signup_btn.setText("Creating…" if loading else "Create account")

    def _on_signup(self) -> None:
        self.error_label.setText("")
        name = self.name_input.text().strip()
        email = self.email_input.text().strip()
        password = self.pass_input.text()
        confirm_password = self.confirm_input.text()

        self._set_loading(True)

        def work():
            self.api.signup(name=name, email=email, password=password, confirm_password=confirm_password)
            return True

        self._worker = ApiWorker(work, self)
        self._worker.succeeded.connect(self._ok)
        self._worker.failed.connect(self._failed)
        self._worker.start()

    def _ok(self, _):
        self._set_loading(False)
        self.signed_up.emit()

    def _failed(self, message: str):
        self._set_loading(False)
        self.error_label.setText(message)


class AuthWidget(QtWidgets.QFrame):
    authenticated = QtCore.pyqtSignal()

    def __init__(self, api: ApiClient, parent=None):
        super().__init__(parent)
        self.api = api
        self.setObjectName("AuthCard")
        self.setStyleSheet("""
            QFrame#AuthCard {
                background: qlineargradient(x1:0, y1:0, x2:0, y2:1,
                    stop:0 rgba(17, 24, 39, 0.6),
                    stop:1 rgba(17, 24, 39, 0.4));
                border: 2px solid rgba(31, 41, 55, 0.8);
                border-radius: 24px;
            }
        """)

        self._stack = QtWidgets.QStackedWidget()
        self._stack.setStyleSheet("background: transparent; border: none;")
        
        self._login = LoginWidget(api)
        self._signup = SignupWidget(api)

        self._login.logged_in.connect(self.authenticated)
        self._signup.signed_up.connect(self.authenticated)

        self._stack.addWidget(self._login)
        self._stack.addWidget(self._signup)

        self._switch_hint = QtWidgets.QLabel("")
        self._switch_hint.setAlignment(QtCore.Qt.AlignCenter)
        self._switch_hint.setStyleSheet("font-size: 14px; color: #9CA3AF; background: transparent;")

        self._switch_btn = QtWidgets.QPushButton("")
        self._switch_btn.setObjectName("TextLink")
        self._switch_btn.setMinimumHeight(40)
        self._switch_btn.setCursor(QtCore.Qt.PointingHandCursor)
        self._switch_btn.setStyleSheet("""
            QPushButton#TextLink {
                background: transparent;
                border: none;
                color: #3B82F6;
                font-size: 15px;
                font-weight: 600;
                text-decoration: underline;
                padding: 8px;
            }
            QPushButton#TextLink:hover {
                color: #60A5FA;
            }
        """)
        self._switch_btn.clicked.connect(self._toggle)

        layout = QtWidgets.QVBoxLayout(self)
        layout.setContentsMargins(50, 40, 50, 40)
        layout.setSpacing(0)
        layout.addWidget(self._stack)
        layout.addSpacing(20)
        layout.addWidget(self._switch_hint)
        layout.addSpacing(8)
        layout.addWidget(self._switch_btn)
        layout.addSpacing(12)

        self.show_login()

    def show_login(self) -> None:
        self._stack.setCurrentWidget(self._login)
        self._switch_hint.setText("Don’t have an account yet?")
        self._switch_btn.setText("Create an account")

    def show_signup(self) -> None:
        self._stack.setCurrentWidget(self._signup)
        self._switch_hint.setText("Already have an account?")
        self._switch_btn.setText("Back to login")

    def _toggle(self) -> None:
        if self._stack.currentWidget() is self._login:
            self.show_signup()
        else:
            self.show_login()
