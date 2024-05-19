import sys
from PyQt5.QtWidgets import QApplication, QWidget, QLabel, QLineEdit, QPushButton, QVBoxLayout, QMessageBox, QColorDialog
from PyQt5.QtGui import QFont
from PyQt5.QtCore import Qt

dark_stylesheet = """
    QWidget {
        background-color: #000000;
        color: #b1b1b1;
    }
    QLineEdit, QPushButton, QLabel {
        border: none;
        border-radius: 10px;
    }
    QLineEdit{
        border: 1px solid white;
        border-radius: 10px;
        padding: 10px;
        height: 50px; /* Adjust the height here */
    }
    QPushButton {
        background-color: #3daee9;
        padding: 5px;
        border: none;
        border-radius: 10px;
        color: #2b2b2b;
    }
    QPushButton:hover {
        background-color: #81ccff;
    }
    QPushButton:pressed {
        background-color: #57aaff;
    }
"""

class InputForm(QWidget):
    def __init__(self):
        super().__init__()
        self.setWindowTitle("Modern Input Form")
        self.setStyleSheet(dark_stylesheet)
        self.setFixedSize(600, 400)  # Set a fixed size
        self.center()  # Center the window

        # Set font
        font = QFont("Candara", 16)
        self.setFont(font)

        # Create widgets
        self.username_label = QLabel("Enter your username:")
        self.username_entry = QLineEdit()
        self.password_label = QLabel("Enter your password:")
        self.password_entry = QLineEdit()
        self.password_entry.setEchoMode(QLineEdit.Password)
        self.license_label = QLabel("Enter your license key:")
        self.license_entry = QLineEdit()
        self.submit_button = QPushButton("Submit")
        self.submit_button.clicked.connect(self.submit)

        # Set the font for each widget
        self.username_label.setFont(font)
        self.username_entry.setFont(font)
        self.password_label.setFont(font)
        self.password_entry.setFont(font)
        self.license_label.setFont(font)
        self.license_entry.setFont(font)
        self.submit_button.setFont(font)


        # Set layout
        layout = QVBoxLayout()
        layout.addWidget(self.username_label)
        layout.addWidget(self.username_entry)
        layout.addWidget(self.password_label)
        layout.addWidget(self.password_entry)
        layout.addWidget(self.license_label)
        layout.addWidget(self.license_entry)
        layout.addWidget(self.submit_button)
        self.setLayout(layout)

    def submit(self):
        username = self.username_entry.text()
        password = self.password_entry.text()
        license_key = self.license_entry.text()

        if username and password and license_key:
            QMessageBox.information(self, "Success", "Username: {}\nPassword: {}\nLicense Key: {}".format(username, password, license_key))
            exit(0)
        else:
            QMessageBox.critical(self, "Error", "Please fill in all fields")

    def center(self):
        # Center the window on the screen
        frame_geometry = self.frameGeometry()
        center_point = QApplication.primaryScreen().availableGeometry().center()
        frame_geometry.moveCenter(center_point)
        self.move(frame_geometry.topLeft())

if __name__ == "__main__":
    app = QApplication(sys.argv)
    form = InputForm()
    form.show()
    sys.exit(app.exec_())
