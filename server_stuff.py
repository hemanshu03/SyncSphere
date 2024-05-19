import json
import os

def create_or_modify_config(file_path):
    if os.path.exists(file_path):
        print("Config file already exists. Reading...")
        read_config(file_path)
    else:
        print("Config file does not exist. Creating...")
        create_config(file_path)

def create_config(file_path):
    config_data = {
        "server": {
            "license_activate": True,
            "logged_in": False
        },
        "user": {
            "username": "",
            "password": ""
        }
    }

    with open(file_path, 'w') as f:
        json.dump(config_data, f)

    set_permissions(file_path)

def modify_config(file_path):
    config = read_config(file_path)

    config['server']['logged_in'] = True

    with open(file_path, 'w') as f:
        json.dump(config, f)

def set_permissions(file_path):
    os.chmod(file_path, 0o600)

def read_config(file_path):
    with open(file_path, 'r') as f:
        config = json.load(f)
    return config

config_file = 'server_config.json'

create_or_modify_config(config_file)

config = read_config(config_file)

def let_me_know_status():
    server_info = config['server']
    user_info = config['user']

    if server_info['license_activate']:
        print("Server License is activated")
        if server_info['logged_in']:
            print("User has logged in")
            return 2
        else:
            print('User has not logged in')
            return 1
    else:
        print("Server License is not activated")
        return 0

let_me_know_status()
