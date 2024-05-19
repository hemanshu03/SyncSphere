import sys
from PyQt5.QtWidgets import QApplication, QWidget, QLabel, QLineEdit, QPushButton, QVBoxLayout, QMessageBox, QColorDialog
from PyQt5.QtGui import QFont
from PyQt5.QtCore import Qt
from googleapiclient.http import MediaFileUpload, MediaIoBaseDownload
from googleapiclient.discovery import build
from google_auth_oauthlib.flow import InstalledAppFlow
from db_Handler import licencee_op as lo

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
        self.setWindowTitle("Register your app on the device")
        self.setStyleSheet(dark_stylesheet)
        self.setFixedSize(600, 400)  # Set a fixed size
        self.center()  # Center the window

        # Set font
        font = QFont("Candara", 16)
        self.setFont(font)

        # Create widgets
        self.username_label = QLabel("Enter your username:")
        self.username_entry = QLineEdit()
        self.license_label = QLabel("Enter your license key:")
        self.license_entry = QLineEdit()
        self.submit_button = QPushButton("Submit")
        self.submit_button.clicked.connect(self.submit)

        # Set the font for each widget
        self.username_label.setFont(font)
        self.username_entry.setFont(font)
        self.license_label.setFont(font)
        self.license_entry.setFont(font)
        self.submit_button.setFont(font)


        # Set layout
        layout = QVBoxLayout()
        layout.addWidget(self.username_label)
        layout.addWidget(self.username_entry)
        layout.addWidget(self.license_label)
        layout.addWidget(self.license_entry)
        layout.addWidget(self.submit_button)
        self.setLayout(layout)

    def submit(self):
        username = self.username_entry.text()
        license_key = self.license_entry.text()

        if username and license_key:
            self.chk_on_gd(username, license_key)
        else:
            QMessageBox.critical(self, "Error", "Please fill in all fields")

    def raise_main_window(self):
        self.raise_()

    def chk_on_gd(self, username, license_key):
        gd_fid = lo.find_fid_by_username(username=username)
        file_id = gd_fid

        #drive_service = self.authenticate_drive(credentials_file)
        file_contents = self.start_authentication(fid_=file_id)
        file_contents = file_contents.decode('utf-8')

        if file_contents == license_key:
            self.raise_main_window()
            QMessageBox.information(self, "Success", "Username: {}\nLicense Key: {}".format(username, license_key))
            exit(0)
        else:
            self.raise_main_window()
            QMessageBox.information(self, "Failed", "Username: {}\nLicense Key: {} is incorrect.\nRe-Check and try again.".format(username, license_key))
            exit(0)
    
    def authenticate_drive_(self, credentials_file):
        flow = InstalledAppFlow.from_client_secrets_file(credentials_file, scopes=['https://www.googleapis.com/auth/drive.readonly'])
        credentials = flow.run_local_server(port=0)
        drive_service = build('drive', 'v3', credentials=credentials)
        return drive_service
    
    def start_authentication(self, fid_):
        credentials_file = r'R:\TY_miniproject\SyncSphere\Refresh_7\SyncSphere_License_manager.json'
        drive_service = self.authenticate_drive_(credentials_file)
        file_id = fid_
        google_drive_file_contents = self.download_file_(drive_service, file_id)
        return google_drive_file_contents

    def download_file_(self, drive_service, file_id):
        request = drive_service.files().get_media(fileId=file_id)
        file_contents = request.execute()
        return file_contents

    def center(self):
        # Center the window on the screen
        frame_geometry = self.frameGeometry()
        center_point = QApplication.primaryScreen().availableGeometry().center()
        frame_geometry.moveCenter(center_point)
        self.move(frame_geometry.topLeft())

    def download_file(self, service, file_id, file_path):
        try:
            # Request metadata of the file
            file_metadata = service.files().get(fileId=file_id).execute()

            # Download the file
            request = service.files().get_media(fileId=file_id)
            with open(file_path, 'wb') as file:
                downloader = MediaIoBaseDownload(file, request)
                done = False
                while not done:
                    status, done = downloader.next_chunk()

            print(f"File '{file_metadata['name']}' downloaded successfully.")

            return file_path

        except Exception as e:
            print('Error:', str(e))
            return None

    def delete_file(self, service, file_id):
        try:
            service.files().delete(fileId=file_id).execute()
            print(f"File with ID '{file_id}' deleted successfully.")
        except Exception as e:
            print('Error:', str(e))

if __name__ == "__main__":
    app = QApplication(sys.argv)
    form = InputForm()
    form.show()
    sys.exit(app.exec_())
