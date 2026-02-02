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

        title = QtWidgets.QLabel("Welcome back")
        title.setObjectName("H1")
        title.setStyleSheet("font-size: 38px; font-weight: 900; background: transparent; color: #E5E7EB;")
        subtitle = QtWidgets.QLabel("Sign in to access your datasets and reports")
        subtitle.setObjectName("Muted")
        subtitle.setStyleSheet("font-size: 18px; background: transparent; color: #9CA3AF;")

        self.user_input = QtWidgets.QLineEdit()
        self.user_input.setPlaceholderText("Email or Username")
        self.user_input.setMinimumHeight(56)
        self.user_input.setStyleSheet("font-size: 17px;")

        self.pass_input = QtWidgets.QLineEdit()
        self.pass_input.setEchoMode(QtWidgets.QLineEdit.Password)
        self.pass_input.setPlaceholderText("Password")
        self.pass_input.setMinimumHeight(56)
        self.pass_input.setStyleSheet("font-size: 17px;")

        self.error_label = QtWidgets.QLabel("")
        self.error_label.setObjectName("Muted")
        self.error_label.setWordWrap(True)
        self.error_label.setStyleSheet("font-size: 14px;")

        self.login_btn = QtWidgets.QPushButton("Login")
        self.login_btn.setObjectName("PrimaryButton")
        self.login_btn.setMinimumHeight(52)
        self.login_btn.clicked.connect(self._on_login)

        form = QtWidgets.QFormLayout()
        form.setLabelAlignment(QtCore.Qt.AlignLeft)
        
        email_label = QtWidgets.QLabel("Email / Username")
        email_label.setStyleSheet("background: transparent; color: #9CA3AF; font-size: 15px; font-weight: 600;")
        password_label = QtWidgets.QLabel("Password")
        password_label.setStyleSheet("background: transparent; color: #9CA3AF; font-size: 15px; font-weight: 600;")
        
        form.addRow(email_label, self.user_input)
        form.addRow(password_label, self.pass_input)

        layout = QtWidgets.QVBoxLayout(self)
        layout.setContentsMargins(0, 0, 0, 0)
        layout.addWidget(title)
        layout.addWidget(subtitle)
        layout.addSpacing(10)
        layout.addLayout(form)
        layout.addSpacing(8)
        layout.addWidget(self.error_label)
        layout.addSpacing(8)
        layout.addWidget(self.login_btn)

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

        title = QtWidgets.QLabel("Create your account")
        title.setObjectName("H1")
        title.setStyleSheet("font-size: 38px; font-weight: 900; background: transparent; color: #E5E7EB;")
        subtitle = QtWidgets.QLabel("Sign up and start uploading CSVs")
        subtitle.setObjectName("Muted")
        subtitle.setStyleSheet("font-size: 18px; background: transparent; color: #9CA3AF;")

        self.name_input = QtWidgets.QLineEdit()
        self.name_input.setPlaceholderText("Full name")
        self.name_input.setMinimumHeight(56)
        self.name_input.setStyleSheet("font-size: 17px;")

        self.email_input = QtWidgets.QLineEdit()
        self.email_input.setPlaceholderText("Email")
        self.email_input.setMinimumHeight(56)
        self.email_input.setStyleSheet("font-size: 17px;")

        self.pass_input = QtWidgets.QLineEdit()
        self.pass_input.setEchoMode(QtWidgets.QLineEdit.Password)
        self.pass_input.setPlaceholderText("Password")
        self.pass_input.setMinimumHeight(56)
        self.pass_input.setStyleSheet("font-size: 17px;")

        self.confirm_input = QtWidgets.QLineEdit()
        self.confirm_input.setEchoMode(QtWidgets.QLineEdit.Password)
        self.confirm_input.setPlaceholderText("Confirm password")
        self.confirm_input.setMinimumHeight(56)
        self.confirm_input.setStyleSheet("font-size: 17px;")

        self.error_label = QtWidgets.QLabel("")
        self.error_label.setObjectName("Muted")
        self.error_label.setWordWrap(True)
        self.error_label.setStyleSheet("font-size: 14px;")

        self.signup_btn = QtWidgets.QPushButton("Create account")
        self.signup_btn.setObjectName("PrimaryButton")
        self.signup_btn.setMinimumHeight(52)
        self.signup_btn.clicked.connect(self._on_signup)

        form = QtWidgets.QFormLayout()
        form.setLabelAlignment(QtCore.Qt.AlignLeft)
        form.setFormAlignment(QtCore.Qt.AlignTop)
        form.setHorizontalSpacing(14)
        form.setVerticalSpacing(12)
        
        name_label = QtWidgets.QLabel("Name")
        name_label.setStyleSheet("background: transparent; color: #9CA3AF; font-size: 15px; font-weight: 600;")
        email_label = QtWidgets.QLabel("Email")
        email_label.setStyleSheet("background: transparent; color: #9CA3AF; font-size: 15px; font-weight: 600;")
        password_label = QtWidgets.QLabel("Password")
        password_label.setStyleSheet("background: transparent; color: #9CA3AF; font-size: 15px; font-weight: 600;")
        confirm_label = QtWidgets.QLabel("Confirm")
        confirm_label.setStyleSheet("background: transparent; color: #9CA3AF; font-size: 15px; font-weight: 600;")
        
        form.addRow(name_label, self.name_input)
        form.addRow(email_label, self.email_input)
        form.addRow(password_label, self.pass_input)
        form.addRow(confirm_label, self.confirm_input)

        layout = QtWidgets.QVBoxLayout(self)
        layout.setContentsMargins(0, 0, 0, 0)
        layout.addWidget(title)
        layout.addWidget(subtitle)
        layout.addSpacing(10)
        layout.addLayout(form)
        layout.addSpacing(8)
        layout.addWidget(self.error_label)
        layout.addSpacing(8)
        layout.addWidget(self.signup_btn)

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
        self.setObjectName("Card")

        self._stack = QtWidgets.QStackedWidget()
        self._login = LoginWidget(api)
        self._signup = SignupWidget(api)

        self._login.logged_in.connect(self.authenticated)
        self._signup.signed_up.connect(self.authenticated)

        self._stack.addWidget(self._login)
        self._stack.addWidget(self._signup)

        self._switch_hint = QtWidgets.QLabel("")
        self._switch_hint.setObjectName("Muted")
        self._switch_hint.setStyleSheet("font-size: 15px;")

        self._switch_btn = QtWidgets.QPushButton("")
        self._switch_btn.setObjectName("OutlineButton")
        self._switch_btn.setMinimumHeight(50)
        self._switch_btn.clicked.connect(self._toggle)

        layout = QtWidgets.QVBoxLayout(self)
        layout.setContentsMargins(50, 40, 50, 40)
        layout.setSpacing(18)
        layout.addWidget(self._stack)
        layout.addSpacing(6)
        layout.addWidget(self._switch_hint)
        layout.addWidget(self._switch_btn)

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
