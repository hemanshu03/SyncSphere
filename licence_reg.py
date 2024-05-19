import json
import os

def create_or_modify_config(file_path):
    if os.path.exists(file_path):
        # If the file already exists, modify it
        print("Config file already exists. Modifying...")
        modify_config(file_path)
    else:
        # If the file doesn't exist, create it
        print("Config file does not exist. Creating...")
        create_config(file_path)

def create_config(file_path):
    # Create a dictionary with your flags
    config_data = {
        "flag1": True,
        "flag2": False,
        "flag3": "some_value"
    }

    # Write the dictionary to a JSON file
    with open(file_path, 'w') as f:
        json.dump(config_data, f)

    # Set permissions to read and write only for the owner
    set_permissions(file_path)

def modify_config(file_path):
    # Read the existing configuration
    config = read_config(file_path)

    # Modify the flags as needed
    config['flag1'] = False
    config['flag2'] = True

    # Write the modified configuration back to the file
    with open(file_path, 'w') as f:
        json.dump(config, f)

def set_permissions(file_path):
    # Set permissions to read and write only for the owner
    os.chmod(file_path, 0o600)

def read_config(file_path):
    # Read the configuration file
    with open(file_path, 'r') as f:
        config = json.load(f)
    return config

# File path for the configuration file
config_file = 'config.json'

# Create or modify the configuration file
create_or_modify_config(config_file)

# Read the configuration file
config = read_config(config_file)

# Access flags in your application
if config['flag1']:
    print("Flag 1 is True")
else:
    print("Flag 1 is False")
