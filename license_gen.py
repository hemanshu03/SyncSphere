import random
import string
from google.oauth2.credentials import Credentials
from google_auth_oauthlib.flow import InstalledAppFlow
from googleapiclient.discovery import build
import ssl
from s_funcs import functions

def generate_random_string(length):
    characters = string.ascii_lowercase + string.digits + string.ascii_uppercase
    random_string = ''.join(random.choice(characters) for _ in range(length))
    random_string_with_dashes = '-'.join([random_string[i:i+4] for i in range(0, length, 4)])
    return random_string_with_dashes

random_string = generate_random_string(24)
print(random_string)

####################################################################################################################################################################################################################################################################################################################
####################################################################################################################################################################################################################################################################################################################

def authenticate_drive(credentials_file):
    flow = InstalledAppFlow.from_client_secrets_file(credentials_file, scopes=['https://www.googleapis.com/auth/drive.readonly'])
    credentials = flow.run_local_server(port=0)

    drive_service = build('drive', 'v3', credentials=credentials)
    return drive_service

def download_file(drive_service, file_id):
    request = drive_service.files().get_media(fileId=file_id)
    file_contents = request.execute()
    return file_contents

def start_authentication():
    credentials_file = r'R:\TY_miniproject\SyncSphere\For Submitting -_-\server_key.json'

    drive_service = authenticate_drive(credentials_file)

    file_id = '1m8hFWqPJqjSudYj6SFr4l1liXK-zclEI'

    google_drive_file_contents = download_file(drive_service, file_id)

    local_file_path = r'R:\TY_miniproject\SyncSphere\For Submitting -_-\server_key.bin'

    with open(local_file_path, 'rb') as f:
        local_file_contents = f.read()

    if local_file_contents == google_drive_file_contents:
        print("Licence authentication successful. Welcome to SyncSphere!")
        
        return
    else:
        print("Licence Authentication failed. Halting start.")
        exit(0)

def start_server():
    start_authentication()

def proceed_with_start():
    exit(0)
    
start_server()
