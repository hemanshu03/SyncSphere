from flask import Flask, render_template, request, jsonify, redirect, url_for, send_from_directory, send_file, request
from flask_socketio import SocketIO, join_room, leave_room, send
import random
from string import ascii_uppercase
from werkzeug.utils import secure_filename
import zipfile
from datetime import datetime
import shutil
import os
from zipfile import ZipFile
from io import BytesIO
import base64
import ssl
from s_funcs import functions
from db_Handler import room_op as ro
import hashlib
from mtranslate import translate

MAX_MEMORY_SIZE = 2 * 1024 * 1024 * 1024

ALLOWED_EXTENSIONS = {'txt', 'pdf', 'png', 'jpg', 'jpeg', 'gif', 'mp4', 'mov', 'mkv', 'zip', 'doc', 'docx', 'ppt', 'pptx', 'xls', 'xlsx', 'py', 'ipynb', 'html','css','js','c','cpp','7z','tar','exe','csv','xml','spg','dng','tif', 'avi','mp3','flv'}

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

app = Flask(__name__)
socketio = SocketIO(app, manage_session=False)

rooms = ["WVUHJRNZK8", "XXOOMVKK40"]

def ordinal_suffix(day):
    if 4 <= day <= 20 or 24 <= day <= 30:
        suffix = "th"
    else:
        suffix = ["st", "nd", "rd"][day % 10 - 1]
    return suffix

def get_current_datetime():
    # Get the current datetime
    current_datetime = datetime.now()
    
    # Extract day, month, hour, and minute
    day = current_datetime.day
    month = current_datetime.strftime("%b")
    hour_minute = current_datetime.strftime("%I:%M")
    am_pm = current_datetime.strftime("%p")
    
    # Add ordinal suffix to day
    day_with_suffix = str(day) + ordinal_suffix(day)
    
    # Format the datetime string
    formatted_datetime = f"{day_with_suffix} {month}, {hour_minute} {am_pm}"
    
    return formatted_datetime

def generate_room_code(length):
    code = ""
    for i in range(length):
        for _ in range(length - random.randint(1, 3)):
            if len(code) == 10:
                break
            code = code + random.choice(ascii_uppercase)
        for __ in range(length - random.randint(1, 3)):
            if len(code) == 10:
                break
            code = code + str(random.randint(0, 9))
        for ___ in range(length - random.randint(1, 4)):
            if len(code) == 10:
                break
            code = code + random.choice(ascii_uppercase)

    if code in rooms:
        generate_room_code(length)
    else:
        return code

def image_to_base64(image_path):
    with open(image_path, "rb") as img_file:
        return base64.b64encode(img_file.read()).decode('utf-8')

@app.route('/')
def chat_room():
    base64_image = image_to_base64('static/images/rooms_handler.jpg')
    rooms_ = ro.search_rooms(def_=2)
    return render_template('room_2.html', rooms=rooms_, base64_image=base64_image)

@socketio.on('check_room')
def check_room_existence(data):
    room_name = data['room_name']
    if room_name in rooms:
        socketio.emit('room_existence', {'exists': True})
    else:
        socketio.emit('room_existence', {'exists': False})

@app.route('/get_files', methods=['POST'])
def get_files():
    data = request.get_json()
    room_directory = data.get('roomDirectory', '')

    if os.path.isdir(room_directory):
        files = os.listdir(room_directory)
        return jsonify({'files': files})
    else:
        return jsonify({'files': []})

@app.route('/upload', methods=['POST'])
def upload():
    try:
        if 'files[]' not in request.files or 'room_code' not in request.form:
            return 'Invalid request'

        room_code = request.form['room_code']

        files = request.files.getlist('files[]')

        for file in files:
            if file.filename != '' and allowed_file(file.filename):
                room_directory = os.path.join('uploads', str(room_code))
                os.makedirs(room_directory, exist_ok=True)
                file.save(os.path.join(room_directory, secure_filename(file.filename)))

        return 'Files uploaded successfully'
    except Exception as e:
        return f'Error: {str(e)}'

def give_random_color():
    colors = ['#ff0000', '#00ff00', '#0000ff', '#ffff00', '#00ffff', '#ff00ff', '#ffa500', '#800080']
    return random.choice(colors)

@app.route("/room/<room_>", methods=['POST', 'GET'])
def room_(room_):
    if ro.search_rooms({'room_code':room_}):
        room_data = ro.search_rooms(query={'room_code':room_}, def_=1)
        room_messages = room_data.get("chats", [])
        rooms_ = ro.search_rooms(def_=2)
        return render_template("room_7.html", rooms=rooms_, code=room_, messages=room_messages, user="Grace") #This page uses the obfuscated JS. room_handler_JS_o
    else:
        return redirect(url_for('chat_room'))

@app.route('/nojs')
def nojs(): #If JS is disabled, this html code will be returned.
    return render_template('nojs.html')

@socketio.on('here_it_is')
def get_room_code(room_code):
    room = room_code
    username = 'Grace'
    if not ro.search_rooms({'room_code':room}) or not username:
        return None
    if not ro.search_rooms({'room_code':room}):
        leave_room(room)
        return None

    join_room(room)
    
    content = {
        "name": username,
        "message": "entered the room",
        "timestamp": get_current_datetime(),
        "enter_event": True
    }
    send(content, to=room)
    #socketio.emit('connect_event', content, to=room)

def generate_msg_id(data, algorithm='sha256'):
    if isinstance(data, str):
        data = data.encode('utf-8')

    hash_func = hashlib.new(algorithm)
    hash_func.update(data)
    return hash_func.hexdigest()

@app.route('/check_room_pass', methods=['POST'])
def check_room_pass():
    data = request.get_json()
    room_code = data['room']
    r_pass_ = data['password']
    result = ro.check_room_pass(room_id=room_code, entered_pass_r=r_pass_)
    
    return jsonify({'result': result})

@socketio.on("message")
def message(data):
    room = data["room_code"]
    if not ro.search_rooms({'room_code':room}):
        return None
    
    timest = get_current_datetime()
    msg_ID = generate_msg_id(data=f'YOUr_Msg_IDenTIf!catIon: {data["name"]}_@{datetime.now()}_#@{request.remote_addr}_@msg?={data["data"]}_--__-_--_---_-_.')
    
    content = {
        "message_id": msg_ID,
        "name": data["name"],
        "message": data["data"],
        "timestamp": timest,
        "enter_event": False
    }

    ro.store_chats(room_id=room, message=data["data"], user=data["name"], timestamp=timest, msg_id=msg_ID)
    send(content, to=room)

@app.route('/delete_message', methods=['POST'])
def delete_message():
    data = request.get_json()
    message_id = data.get('message_id')

    if not message_id:
        return jsonify({'error': 'Message ID not provided'}), 400

    deletion_res = ro.delete_message(message_id=message_id)
    
    if deletion_res == "success":
        return jsonify({'success': True}), 200
    if deletion_res == "nf":
        return jsonify({'error': 'Message not found'}), 404
    if isinstance(deletion_res, Exception):
        return jsonify({'error': str(deletion_res)}), 500

@app.route('/delete_file/<room_code>/<filename>')
def delete_file(room_code, filename):
    directory = 'uploads/' + room_code
    file_path = os.path.join(directory, filename)

    try:
        os.remove(file_path)
        return jsonify({'success': True})
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)})

@app.route('/room/downloads/<room_code>/<filename>')
def download_file(room_code, filename):
    directory = 'uploads/' + room_code
    return send_from_directory(directory, filename)

@app.route('/download_multiple', methods=['POST'])
def download_multiple():
    data = request.get_json()
    room_code = data['room']
    selected_files = data['selectedfiles']

    zip_filename = f'uploads/{room_code}/{room_code}_selected_files.zip'

    with ZipFile(zip_filename, 'w') as zipf:
        for file in selected_files:
            file_path = os.path.join('uploads', room_code, file)
            zipf.write(file_path, file)

    try:
        return send_file(
            path_or_file=zip_filename,
            as_attachment=True,
            mimetype='application/zip',
            download_name=f'{room_code}_selected_files.zip'
        )
    except Exception as e:
        app.logger.error(f"Error sending file: {e}")
        raise

@app.route('/delete_zip/<room_code>/<filename>')
def delete_zip(room_code, filename):
    directory = 'uploads/' + room_code
    file_path = os.path.join(directory, filename)

    try:
        os.remove(file_path)
        return jsonify({'success': True})
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)})

@app.route('/translate_api', methods=['POST'])
def translate_api():
    try:
        data = request.json  # Get JSON data from the request
        text_to_translate = data.get('text_to_translate')  # Extract text to translate
        target_language = data.get('target_language', 'en')  # Extract target language (default to English)

        # Translate the text
        translated_text = translate(text_to_translate, target_language)

        # Create a result dictionary with translation information
        result = {
            "translatedText": translated_text
        }

        # Return the result as JSON
        return jsonify(result), 200
    except Exception as e:
        # Handle exceptions and return error response
        error_message = f"Error translating text: {str(e)}"
        return jsonify({"error": error_message}), 500

if __name__ == '__main__':
    ssl_context = ssl.create_default_context(ssl.Purpose.CLIENT_AUTH)
    ssl_context.load_cert_chain('OpenSSL_Certificates/cert.pem', 'OpenSSL_Certificates/key.pem')
    app.run(host=functions.get_public_ip(), port=5000, debug=True, ssl_context=ssl_context)

