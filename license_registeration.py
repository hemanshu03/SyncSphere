from googleapiclient.http import MediaFileUpload
from googleapiclient.discovery import build
from google_auth_oauthlib.flow import InstalledAppFlow
import hashlib
import string
import random
from db_Handler import licencee_op as lo
from s_funcs import EmailFunctions as ef

def authenticate_drive(credentials_file):
    flow = InstalledAppFlow.from_client_secrets_file(credentials_file, scopes=['https://www.googleapis.com/auth/drive'])
    credentials = flow.run_local_server(port=0)

    drive_service = build('drive', 'v3', credentials=credentials)
    return drive_service

def generate_random_string(length=24):
    characters = string.ascii_lowercase + string.digits + string.ascii_uppercase
    random_string = ''.join(random.choice(characters) for _ in range(length))
    random_string_with_dashes = '-'.join([random_string[i:i+4] for i in range(0, length, 4)])
    return random_string_with_dashes

def generate_file_id(data, algorithm='sha256'):
    if isinstance(data, str):
        data = data.encode('utf-8')

    hash_func = hashlib.new(algorithm)
    hash_func.update(data)
    return hash_func.hexdigest()

def upload_file(service, file_path, user, folder_id=None):
    filename_gd = f'User_with_username_{user}_got_license'
    file_metadata = {'name': filename_gd, 'parents': [folder_id]} if folder_id else {'name': generate_file_id()}
    media = MediaFileUpload(file_path)
    file = service.files().create(body=file_metadata, media_body=media, fields='id').execute()

    print(f'Created a license file for\nUser: {user}\nWith File name: {filename_gd}\nOf file ID: {file.get('id')}\n')

    return file.get('id')

def create_license_file(user):
    license_ = generate_random_string()
    with open(f'licenses/{user}.txt', 'w') as lf:
        lf.write(license_)

def license_creation(user, email_):
    user_ = user
    u_checker = lo.check_user(user=user_)

    if u_checker == 0:
        create_license_file(user=user_)

        folder_id = '1Hlo0KXj7Eq3Z6T4mGAgPxBoYSwuEdQOP'

        credentials_file = r'R:\TY_miniproject\SyncSphere\Refresh_7\SyncSphere_License_manager.json'

        drive_service = authenticate_drive(credentials_file)

        file_path = f'licenses/{user_}.txt'

        file_id = upload_file(service=drive_service, file_path=file_path, folder_id=folder_id, user=user_)
        if file_id != None:
            print("Registering user in the database..")
            with open(f'licenses/{user_}.txt', 'r') as lf:
                print("Writing..")
                license_key = lf.read()
                data={
                    "uid": user_,
                    "email": email_,
                    "license_key": license_key,
                    "fid_gd": file_id
                }
                res_writ = lo.register_user_license(data)
                if res_writ == 0:
                    print("Failed to write in database.")
                if res_writ == 1:
                    ef.custom_email()
                    print("Done!")

    if u_checker == 1:
        print(f'User "{user_}" already exist on SyncSphere.')
        exit(0)

license_creation("trial", 'trial@gmail.com')