from flask import Flask, render_template, request, url_for, redirect, jsonify, send_from_directory, send_file, session
from flask_socketio import SocketIO, join_room, leave_room, send
from s_funcs import functions, CaptchaFunctions
import os
from werkzeug.utils import secure_filename
from datetime import datetime
import hashlib
from mtranslate import translate
from langdetect import detect
from langcodes import Language
import base64
from zipfile import ZipFile
from db_Handler import session_op as so, Captcha_ as cptch, user_op as uo, room_op as ro
import ssl
from cryptography.fernet import Fernet

session_user_dets = {}

MAX_MEMORY_SIZE = 2 * 1024 * 1024 * 1024
ALLOWED_EXTENSIONS = {'txt', 'pdf', 'png', 'jpg', 'jpeg', 'gif', 'mp4', 'mov', 'mkv', 'zip', 'doc', 'docx', 'ppt', 'pptx', 'xls', 'xlsx', 'py', 'ipynb', 'html','css','js','c','cpp','7z','tar','exe','csv','xml','spg','dng','tif', 'avi','mp3','flv'}

app = Flask(__name__) #This particular variable is responsible to create the Flask application.
socketio = SocketIO(app, manage_session=False) #This particular variable is resplosible to create a socket connection.
app.secret_key = os.urandom(24).hex() #This line creates a unique password for the application (Security aspect of Flask Library).

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

def ordinal_suffix(day):
    if 4 <= day <= 20 or 24 <= day <= 30:
        suffix = "th"
    else:
        suffix = ["st", "nd", "rd"][day % 10 - 1]
    return suffix

def get_current_datetime():
    current_datetime = datetime.now()

    day = current_datetime.day
    month = current_datetime.strftime("%b")
    hour_minute = current_datetime.strftime("%I:%M")
    am_pm = current_datetime.strftime("%p")

    day_with_suffix = str(day) + ordinal_suffix(day)

    formatted_datetime = f"{day_with_suffix} {month}, {hour_minute} {am_pm}"
    
    return formatted_datetime

def image_to_base64(image_path):
    with open(image_path, "rb") as img_file:
        return base64.b64encode(img_file.read()).decode('utf-8')

@app.route('/rooms')
def chat_room():
    rooms_ = ro.search_rooms(def_=2)
    return render_template('room_2.html', rooms=rooms_)

@app.route("/room/<room_>/<session_>", methods=['POST', 'GET'])
def room_(room_, session_):
    if ro.search_rooms({'room_code':room_}):
        print("-------------SessionID-------------------------------", session_)
        user = session_user_dets.get(session_)
        #user = request.json.get("user")
        print("-------------USER-------------------------------", user)
        room_data = ro.search_rooms(query={'room_code':room_}, def_=1)
        room_messages = room_data.get("chats", [])
        rooms_ = ro.search_rooms(def_=2)
        return render_template("room_7.html", rooms=rooms_, code=room_, messages=room_messages, user=user) #This page uses the obfuscated JS. room_handler_JS_o
    else:
        return redirect(url_for('chat_room'))

@socketio.on('redirect_to_room')
def redirect_to_room(data):
    room_name = data['room_name']
    sid = data['session_id']
    session_user_dets[sid] = data['username']
    if ro.search_rooms({'room_code': room_name}):
        socketio.emit('redirect_to_room__', {'room': room_name})
    else:
        socketio.emit('room_existence', {'exists': False})

@socketio.on('check_room')
def check_room_existence(data):
    room_name = data['room_name']
    if ro.search_rooms({'room_code': room_name}):
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
        
        source_language = Language.get(str(detect(text_to_translate))).display_name()
        # source_language = detect(text_to_translate)

        # Translate the text
        translated_text = translate(text_to_translate, target_language)

        # Create a result dictionary with translation information
        result = {
            "translatedText": translated_text,
            "sourceLanguage": source_language,  # Assuming auto-detection of source language
            "targetLanguage": target_language
        }
        
        # Return the result as JSON
        return jsonify(result), 200
    except Exception as e:
        # Handle exceptions and return error response
        error_message = f"Error translating text: {str(e)}"
        return jsonify({"error": error_message}), 500

@app.route('/', methods=['GET', 'POST'])
def home(): #This function renders the home/landing page.
    if request.method == "POST":
        login_ = request.form.get('Login-btn', False)
        create_ = request.form.get('create-btn', False)
        support_ = request.form.get('support', False)
        if login_ != False:
            return redirect(url_for('login'))
        if create_ != False:
            return redirect(url_for('register__'))
        if support_ != False:
            return redirect(url_for('redirect_', data='support'))
    return render_template('landing.html')

@app.route('/get_new_captcha', methods=['GET'])
def refresh_captcha(): #This function creates a new captcha image and passes it to the client using XHR Requests.
    session_id = request.headers.get('X-Session-ID')
    captcha_image = cptch.get_captcha_image('lol')
    return jsonify({'new_captcha': captcha_image})

@app.route('/login', methods=['POST', 'GET'])
def login(): #This function renders the login webpage (not yet ready).
    socketio.emit('request_session')
    key = so.create_session_id()
    return render_template('login.html', captcha_image=cptch.get_captcha_image(key), session_id=key) 

@app.route('/register')
def register__(): #This function renders the registration webpage (not yet ready).
    socketio.emit('request_session')
    key = so.create_session_id()
    return render_template('create.html', captcha_image=cptch.get_captcha_image(), session_id=key)

@socketio.on('check_username')
def check_username_for_reg(data):
    usnm = data.get('username')
    if uo.check_username(usnm) == 1:
        socketio.emit('usnm_verification_status', {'exists': True})
    if uo.check_username(usnm) == 0:
        socketio.emit('usnm_verification_status', {'exists': False})

@app.route('/support')
def support_form(): #This function renders the support form (not yet ready).
    return render_template('support_form.html', video_='/static/videos/under_construction.mp4')

@app.route('/redirect/where?=<data>')
def redirect_(data): #This function is to redirect the client to various locations. Locations are passed to this function using the "data" variable.
    if data == 'support':
        return render_template('redirect.html', link__='/support', location_='support form')

def authenticate_(data): #This is to check if the session id passed to it is authentic or not. This one checks in the DB.
    if so.check_sid(data):
        return True
    else:
        return False

@app.route('/check_entered_details', methods=['POST'])
def check_entered_details():
    data = request.get_json()

    userid = data.get('uid')
    pass__ = data.get('pass__')
    captcha_r = data.get('captcha')
    sessionId = data.get('session_id')
    
    if not authenticate_(sessionId):
        socketio.emit('redirect', {'url' : '/redirect'})
    if authenticate_(sessionId):
        dts = {
            'uid': userid,
            'password': pass__,
            'captcha_text':captcha_r,
            'sid':sessionId
        }
        if uo.check_user_details(data=dts) == 6:
            session_user_dets[sessionId] = userid
            return jsonify({'status': 'success', 'url': '/rooms'})
        else:
            return jsonify({'status': 'failed', 'error': uo.check_user_details(data=dts)})

@app.route('/authenticate_sid', methods=['POST', 'GET'])
def authenticate_signal_handler(): #To see if the session id is authentic or not, This is the socket emission function. Does not check in the DB
    sid = request.headers.get('X-Session-ID')
    if authenticate_(sid):
        return jsonify({'url': 'authentic'})
    if not authenticate_(sid):
        return jsonify({'url': '/redirect'})

@socketio.on('join_room')
def handle_join_room(data): #This function receives the socket emission from the client side to connect itself in a room to isolate itself from other connections.
    session = data.get('session')
    if authenticate_(session):
        join_room(session)
    if not authenticate_(session):
        return redirect(url_for('unauthorized'))

@app.route('/redirect')
def unauthorized(): #Unauthorized connections are redirected here to redirect back to the home page.
    return render_template('unauthorized.html')

if __name__ == '__main__':
    ssl_context = ssl.create_default_context(ssl.Purpose.CLIENT_AUTH)
    ssl_context.load_cert_chain('OpenSSL_Certificates/cert.pem', 'OpenSSL_Certificates/key.pem')
    app.run(host=functions.get_public_ip(), port=5001, debug=True, ssl_context=ssl_context)
    #app.run(host='localhost', port=5001, debug=True, ssl_context=ssl_context)
