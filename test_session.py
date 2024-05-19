from flask import Flask, render_template, request, redirect, jsonify, session, url_for, send_from_directory, send_file
from flask_socketio import SocketIO, join_room, send, leave_room
from flask_session import Session
import os
from datetime import datetime
import hashlib
import base64
from zipfile import ZipFile
from db_Handler import session_op as so, Captcha_ as cptch, user_op as uo, room_op as ro, activity_op as ao
from s_funcs import EmailFunctions as eaf, functions
from werkzeug.utils import secure_filename
from mtranslate import translate
from langdetect import detect
from langcodes import Language
import secrets
import ssl
import json
from threading import Timer

MAX_MEMORY_SIZE = 2 * 1024 * 1024 * 1024
ALLOWED_EXTENSIONS = {
    'txt', 'pdf', 'png', 'jpg', 'jpeg', 'gif', 'mp4', 'mov', 'mkv', 
    'doc', 'docx', 'ppt', 'pptx', 'xls', 'xlsx', 'html', 'css', 'js', 
    'c', 'cpp', 'csv', 'xml', 'mp3', 'zip', 'rar', 'wav'
}

server_secret_key = secrets.token_bytes(16)
current_datetime_server = datetime.now()

# Format the datetime
formatted_datetime_server = current_datetime_server.strftime('%H_%M_%S_%d_%m_%Y')

app = Flask(__name__)

app.config['SECRET_KEY'] = server_secret_key
app.config['SESSION_COOKIE_SECRET_KEY'] = server_secret_key
app.config['SESSION_COOKIE_SECURE'] = True
app.config['SESSION_COOKIE_EXPIRES'] = False
app.config['SESSION_COOKIE_SAMESITE'] = 'Strict'
app.config['SESSION_TYPE'] = 'filesystem'

#with open(f'server_configs/server_config_start__{formatted_datetime_server}.txt', 'x') as slf:
#    slf.write(f"Server configuration:\nSecret key: {app.config['SECRET_KEY']}\nSession cookie secure?= {app.config['SESSION_COOKIE_SECURE']}\nSession cookie expires?= {app.config['SESSION_COOKIE_EXPIRES']}\n Session cookie configuration: {app.config['SESSION_COOKIE_SAMESITE']}\nSession Type: {app.config['SESSION_TYPE']}")

socketio = SocketIO(app, manage_session=False)

Session(app)

active_participants = {}
activity_timers = {}
afk_status = {}
mems = []


#################################### OTHER FUNCTIONS FOR SERVER #########################################################
# Add participants to a room
def add_participant(room_code, participant):
    if room_code in active_participants:
        active_participants[room_code].append(participant)
    else:
        active_participants[room_code] = [participant]

# Remove participant from a room
def remove_participant(room_code, participant):
    if room_code in active_participants:
        if participant in active_participants[room_code]:
            active_participants[room_code].remove(participant)
            if len(active_participants[room_code]) == 0:
                del active_participants[room_code]

# Get participants in a room
def get_participants(room_code):
    return active_participants.get(room_code, [])

def generate_hash(data, algorithm='sha256'):
    if isinstance(data, str):
        data = data.encode('utf-8')

    hash_func = hashlib.new(algorithm)
    hash_func.update(data)
    return hash_func.hexdigest()

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

#################################### OTHER FUNCTIONS FOR SERVER #########################################################

#################################### SELECT ROOM HANDLER ################################################################
@app.route('/rooms')
def chat_room():
    rooms_ = ro.search_rooms(def_=2)
    try:
        if not session.get('session_id'):
            if not session['logged_in']:
                return redirect(url_for('login'))
        if 'username' not in session:
            return redirect(url_for('login'))
    except KeyError:
        return redirect(url_for('login'))
    return render_template('room_2.html', rooms=rooms_,  user=session['username'])

@app.route('/password_checker_room', methods=['POST'])
def check_r_pass():
    data = request.get_json()
    sig = data.get('password_stats')
    print(f'------------------------SIG: {sig} --------------------')
    if sig == 'check_pass_success':
        session['room_password_stat'] = True
        return jsonify({'redirect_accepted': True}), 200
    else:
        return jsonify({'error': 'Invalid password_stats'}), 400

def send_join_event(data, flag=0):
    timest = get_current_datetime()
    if flag == 0:
        content = {
            "name": data["name"],
            "message": 'joined the room at',
            "timestamp": timest,
            "enter_event": True
        }
    if flag == 1:
        content = {
            "name": data["name"],
            "message": data["message"],
            'file': data['file'],
            "timestamp": timest,
            "file_event": True,
            "files_event": False
        }
    if flag == 2:
        content = {
            "name": data["name"],
            "message": data["message"],
            'file': data['file'],
            "timestamp": timest,
            "file_event": False,
            "files_event": True
        }
    if flag == 3:
        content = {
            "name": data["name"],
            "message": data['message'],
            "timestamp": timest,
            "enter_event": True
        }
    socketio.send(data=content, to=data.get("room"))

#################################### SELECT ROOM HANDLER ################################################################


################################### USER ACTIVITY STATUS ################################################################

@app.route('/get_partis', methods=['POST']) 
def get_partis():
    data = request.get_json()
    room_code = data.get('roomDirectory')
    room_data = ro.search_rooms(query={'room_code': room_code}, def_=1)
    room_members = room_data.get("users", [])

    partidat = {member['username']: (ao.get_user_activity(username=member['username'], room_code=room_code)) for member in room_members}

    for member in room_members:
        if not member['username'] in mems:
            mems.append(member['username'])
        #print(f'Member: {member['username']}: {ao.get_user_activity(username=member['username'], room_code=room_code)}')
    
    print(f'============================================\n\nRoom members:\n{room_members}\n\n============================================')
        
    print(f'=====================================Paridat: {partidat}====================================================')
    try:
        # Retrieve status of each member as a dictionary

        return jsonify({'mems': mems, 'status': partidat})
    except Exception as e:
        print(f'=====================================Error: {e}====================================================')
        return jsonify({'error': str(e)})

@app.route('/back_online', methods=['POST'])
def set_online():
    username = session['username']
    room = session['room_joined']
    print(f'back_online was triggered by {username} from room {room}')
    if username in activity_timers:
        activity_timers[username].cancel()
    afk_status[username] = 1  # Reset AFK status when user is back online
    return jsonify({'data': 'success'})

def set_activity(username, room, stat):
    ao.add_or_update_user_activity(username=username, room_code=room, activity_stat=stat)
    '''
        if stat == '': pass
        active_participants[room].remove(username)
        afk_status[username] = 0
        print(f'User {username} flagged as offline in room {room}')
    else:
        print(f'User {username} was not found in active participants list for room {room}')
    '''

def set_offline(username, room):
    ao.add_or_update_user_activity(username=username, room_code=room, activity_stat=0)

@app.route('/heartbeat', methods=['POST'])
def handle_heartbeat():
    data = request.get_json()
    username = session['username']
    room = session['room_joined']
    status = data.get('status')
    current_status  = ao.get_user_activity(username=username, room_code=room)
    print(f'Heartbeat was triggered by {username} from room {room} with status {status}')
    try:
        if current_status == 404:
            return jsonify({'data': 0xFF})
        if current_status == status:
            activity_timers[username].cancel()
            activity_timers[username] = Timer(120, set_offline, args=[username, room])
            activity_timers[username].start()
            return jsonify({'data': 'success'})
        if current_status != status:
            ao.add_or_update_user_activity(username=username, room_code=room, activity_stat=status)
            activity_timers[username].cancel()
            activity_timers[username] = Timer(120, set_offline, args=[username, room])
            activity_timers[username].start()
            return jsonify({'data': 'success'})
    except Exception as error:
        return jsonify({'error': str(error)})

################################### USER ACTIVITY STATUS ################################################################

################################### INSIDE ROOM HANDLER #################################################################
@app.route("/room/<room_>", methods=['POST', 'GET'])
def room_(room_):
    if ro.search_rooms({'room_code': room_}):
        if not 'logged_in' in session:
            return redirect(url_for('login'))
        if not session['logged_in']:
            return redirect(url_for('login'))
        if not session.get('room_password_stat', False):
            return redirect(url_for('chat_room'))

        session['room_joined'] = room_
        user = session['username']
        room_data = ro.search_rooms(query={'room_code': room_}, def_=1)
        room_messages = room_data.get("chats", [])
        rooms_ = ro.search_rooms(def_=2)

        if room_ not in active_participants:
            active_participants[room_] = []
        if user not in active_participants[room_]:
            active_participants[room_].append(user)

        return render_template("room_8.html", rooms=rooms_, code=room_, messages=room_messages, user=session['username'])
    else:
        return redirect(url_for('chat_room'))

@socketio.on('redirect_to_room')    
def redirect_to_room(data):
    room_name = data['room_name']
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

@app.route('/extension_check', methods=['POST'])
def extension_check():
    try:
        file_exts = request.form.getlist('file_exts[]') # Get list of file extensions
        for file_ext in file_exts:
            if allowed_file('.' + file_ext): # Check if all file extensions are allowed
                return jsonify({'allowed': True})
            if not allowed_file('.' + file_ext): # Check if all file extensions are allowed
                return jsonify({'allowed': False})
    except Exception as e:
        return jsonify({'error': str(e)})

@app.route('/upload', methods=['POST'])
def upload():
    try:
        if 'files[]' not in request.files or 'room_code' not in request.form:
            return 'Invalid request'

        room_code = session['room_joined']
        print(f'===========Room code: {room_code} ========================')

        files = request.files.getlist('files[]')
        
        count = 0
        
        for file in files:
            if file.filename != '' and allowed_file(file.filename):
                room_directory = os.path.join('uploads', str(room_code))
                os.makedirs(room_directory, exist_ok=True)
                file.save(os.path.join(room_directory, secure_filename(file.filename)))
                count += 1
        
        if count > 1:
            data = {
                'name': session['username'],
                'message': 'uploaded multiple files',
                'file': 'multiple'
            }
            send_join_event(data, flag=2)
        if count == 1:
            data = {
                'name': session['username'],
                'message': f"uploaded file: ",
                'file': file.filename
            }
            send_join_event(data, flag=1)

        return 'Files uploaded successfully'
    except Exception as e:
        return f'Error: {str(e)}'

################################### INSIDE ROOM HANDLER #################################################################

@app.route('/nojs')
def nojs(): #If JS is disabled, this html code will be returned.
    return render_template('nojs.html')

@app.route('/check_auth')
def check_SID_Validity():
    if 'session_id' in session:
        return ('', 204)
    if 'session_id' not in session:
        return ('', 404)

@app.route('/cookie_error')
def cookie_disabled():
    return render_template('no_cookies.html')

@socketio.on('here_it_is')
def get_room_code(data):
    room = data.get('room_code')
    username = data.get('usnm')
    if not ro.search_rooms({'room_code':room}) or not username:
        return redirect(url_for('unauthorized'))
    if not ro.search_rooms({'room_code':room}):
        leave_room(room)
        return redirect(url_for('unauthorized'))

    join_room(room)
    
    content = {
        "name": username,
        "message": "entered the room",
        "timestamp": get_current_datetime(),
        "enter_event": True,
        "room_": room
    }
    #send(content, to=room)
    broadcast_message(content__=content)

@app.route('/check_room_pass', methods=['POST'])
def check_room_pass():
    data = request.get_json()
    room_code = data['room']
    r_pass_ = data['password']
    result = ro.check_room_pass(room_id=room_code, entered_pass_r=r_pass_)

    return jsonify({'result': result})

@socketio.on("message")
def message(data):
    room = data.get("room_code")
    user_nm = session['username']
    if not ro.search_rooms({'room_code':room}):
        return None

    timest = get_current_datetime()

    # This function creates an absolute unique hash for each message
    # This string "- -- - --   - --   - --- -   - - --- -   --- - --   - - --   - - - -   - - - -- -   - ---   --- - --   - - -- -   - - - -- -   - ---   - --- - - -   - - - - -   - - - -- -   - ---   --- - --   - -- -- -   - -- - --   - -- - -   - -- -- -   - -- - -   - -- -- -   - -- - -- -   - --- - -   - ---   - --- - - -   - --- - --   - - --- - - -   - -- - -   - - -- -   - - -- --   - - -- -   - --- - --   - - -- -   - --- - -   - -- - --   - - - - -   - - - -" means:
    # "This is a secret code for SyncSphere. You cannot proceed without this hash :)" converted to binary, where every 1 is represented by "-"
    # And every 0 is represented by " " (a blank space)
    msg_ID = generate_hash(data=f'YOUr_Msg_IDenTIf!catIon: {user_nm}_@{datetime.now()}_#@{request.remote_addr}_@msg?={data["data"]}- -- - --   - --   - --- -   - - --- -   --- - --   - - --   - - - -   - - - -- -   - ---   --- - --   - - -- -   - - - -- -   - ---   - --- - - -   - - - - -   - - - -- -   - ---   --- - --   - -- -- -   - -- - --   - -- - -   - -- -- -   - -- - -   - -- -- -   - -- - -- -   - --- - -   - ---   - --- - - -   - --- - --   - - --- - - -   - -- - -   - - -- -   - - -- --   - - -- -   - --- - --   - - -- -   - --- - -   - -- - --   - - - - -   - - - - .')

    content = {
        "message_id": msg_ID,
        "name": user_nm,
        "message": data.get("data"),
        "timestamp": timest,
        "enter_event": False
    }

    ro.store_chats(room_id=room, message=data.get("data"), user=user_nm, timestamp=timest, msg_id=msg_ID)
    send(message=content, to=room)
    #broadcast_message(content__=content)

def broadcast_message(content__):
    socketio.emit('message', content__)

@app.route('/delete_message', methods=['POST'])
def delete_message():
    data = request.get_json()
    message_id = data.get('message_id')
    usr_nm = session['username']


    if not message_id:
        return jsonify({'error': 'Message ID not provided'}), 400

    deletion_res = ro.delete_message(message_id=message_id, username=usr_nm)
    
    #print(f"====================Delete Message Debugger====================\nUsername: {usr_nm}\nMessage ID: {message_id}\nDeletion Result: {deletion_res}")

    if deletion_res == "success":
        return jsonify({'success': True}), 200
    if deletion_res == "nf":
        return jsonify({'error': 'Message not found'}), 404
    if deletion_res == "msg_0":
        return jsonify({'error': 'Error in Message ID or Username.'}), 404
    if isinstance(deletion_res, Exception):
        return jsonify({'error': str(deletion_res)}), 500

@app.route('/delete_file/<filename>')
def delete_file(filename):
    directory = 'uploads/' + session['room_joined']
    file_path = os.path.join(directory, filename)

    try:
        os.remove(file_path)
        data = {
                'name': session['username'],
                'message': f"deleted file: '{filename}'"
            }
        send_join_event(data=data, flag=3)
        return jsonify({'success': True})
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)})

@app.route('/room/downloads/<filename>')
def download_file(filename):
    directory = 'uploads\\' + session['room_joined'] + '\\' + filename
    print(f'+===============Directory: {directory}======================+')
    return send_file(path_or_file=directory, as_attachment=True, download_name=f'{session["room_joined"]}_{filename}')

@app.route('/download_multiple', methods=['POST'])
def download_multiple():
    data = request.get_json()
    room_code = data.get('room')
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
        text_to_translate = str(data.get('text_to_translate', ''))  # Extract text to translate
        target_language = str(data.get('target_language', 'en'))  # Extract target language (default to English)
        
        # Detect source language
        try:
            source_language = Language.get(str(detect(text_to_translate))).display_name()
        except Exception as e:
            source_language = 'Unknown'

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
    except KeyError as e:
        # Handle missing keys in JSON data
        error_message = f"Missing key in JSON data: {str(e)}"
        return jsonify({"error": error_message}), 400
    except Exception as e:
        # Handle other exceptions
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
    if session:
        if session['logged_in'] == True:
            return render_template('landing_2.html', user=session['username'], logged_in=True, logo_src="static/images/site_logof.svg", logo_src_fav="static/images/site_logof.ico")
    return render_template('landing_2.html', logged_in=False, logo_src="static/images/site_logof.svg", logo_src_fav="static/images/site_logof.ico")

@app.route('/get_new_captcha', methods=['GET'])
def refresh_captcha():
    captcha_image, captcha_text = cptch.get_captcha_image()
    session['captcha_text'] = captcha_text
    return jsonify({'new_captcha': captcha_image})

@app.route('/login', methods=['POST', 'GET'])
def login():
    # Check if the user is already logged in
    if session.get('logged_in'):
        if session['logged_in']:
            return redirect(url_for('chat_room'))

    # Initialize session variables if session is not already active
    if not session.get('session_id'):
        session['session_id'] = so.create_session_id()
    if not session.get('logged_in'):
        session['logged_in'] = False
    if not session.get('room_password_stat'):
        session['room_password_stat'] = False

    # Generate CAPTCHA image and text
    captcha_img, captcha_txt = cptch.get_captcha_image()
    session['captcha_text'] = captcha_txt

    return render_template('login.html', captcha_image=captcha_img)

@app.route('/check_entered_details', methods=['POST'])
def check_entered_details():
    data = request.get_json()
    userid = data.get('uid')
    pass__ = data.get('pass__')
    captcha_r = data.get('captcha')
    client_finprt = data.get('client_fingerprint')

    dts = {
        'uid': userid,
        'password': pass__,
    }

    result = uo.check_user_details(data=dts)

    if result == 2 and captcha_r == session['captcha_text']:
        print('----------------------Ok------------------------')
        session['username'] = userid
        session['logged_in'] = True
        return jsonify({'status': 'success', 'url': '/rooms'})
    if captcha_r != session['captcha_text']:
        print('----------------------captcha bad------------------------')
        return jsonify({'status': 'failed', 'error': 5})
    else:
        print('----------------------Don"t know------------------------')
        return jsonify({'status': 'failed', 'error': result})

@app.route('/logout', methods=['POST', 'GET'])
def logout_user():
    session.clear()  # Clear the entire session
    return redirect('/redirect/login')

@app.route('/forgot_password')
def forgot_pass():
    session['session_id'] = so.create_session_id()
    session['logged_in'] = False
    captcha_img, captcha_txt = cptch.get_captcha_image()
    session['captcha_text'] = captcha_txt
    return render_template('forgot_password.html', captcha_image=captcha_img)

@app.route('/register')
def register__(): #This function renders the registration webpage (not yet ready).
    session['session_id'] = so.create_session_id()
    session['logged_in'] = False
    captcha_img, captcha_txt = cptch.get_captcha_image()
    session['captcha_text'] = captcha_txt
    return render_template('create.html', captcha_image=captcha_img)

@socketio.on('check_username')
def check_username_for_reg(data):
    usnm = data.get('username')
    if uo.check_username(usnm) == 1:
        socketio.emit('usnm_verification_status', {'exists': True})
    if uo.check_username(usnm) == 0:
        socketio.emit('usnm_verification_status', {'exists': False})

@socketio.on('send_otp')
def send_otp(data):
    eaf.send_otp(email=data.get('email'), session_id=session['session_id'], ip=request.remote_addr, for_type=data.get('for_type'))

@socketio.on('register_user')
def final_register_step(data):
    captcha_r = data.get('captcha_')
    captcha_m = session['captcha_text']
    email = data.get('eml')
    usernm = data.get('usr')
    if captcha_r == captcha_m:
        data = {
            'uid': usernm,
            'email': email,
            'password': data.get('psrd')
        }
        if uo.register_user(data=data, asrooms=None, afr=None, admin=False, validated=True, ev=True) == 1:
            eaf.send_thank_you(email_=email, user_=usernm)
            socketio.emit('registration_status', {'isFailed': False})
        else:
            socketio.emit('registration_status', {'isFailed': True})
    if captcha_r != captcha_m:
        socketio.emit('validation_result', {'result': 'incorrect'})

@socketio.on('validate_otp')
def validate_otp_reg(data):
    status_em = eaf.validate_otp(session_id=session['session_id'], otpv=data.get('otp'))
    if status_em == 'correct':
        socketio.emit('otp_verification', {'result': True, 'error': False})
    if status_em == 'incorrect':
        socketio.emit('otp_verification', {'result': False, 'error': False})
    if status_em == 'False':
        socketio.emit('otp_verification', {'result': False, 'error': True})

@socketio.on('check_email')
def validate_email(data):
    uid = data.get('urnm')
    email_ = data.get('email__')
    if uo.check_email(uid=uid, email_=email_) == 1:
        socketio.emit('email_status', {'incorrect': True})
    if uo.check_email(uid=uid, email_=email_) == 2:
        socketio.emit('email_status', {'incorrect': False})

@socketio.on('update_password')
def update_password(data):
    captcha_r = data.get('captcha_')
    captcha_m = session['captcha_text']
    email = data.get('eml')
    usernm = data.get('usr')
    pass__ = data.get('psrd')
    if uo.check_email(uid=usernm, email_=email) == 1:
        socketio.emit('email_status', {'incorrect': True})
        
    if captcha_r == captcha_m:
        data = {
            'uid': usernm,
            'email': email,
            'pass_': pass__,
            'ip': request.remote_addr
        }
        if uo.update_credentials(data=data) == 1:
            eaf.send_updation(email_=email, user_=usernm, ip=request.remote_addr)
            socketio.emit('updation_status', {'isFailed': False})
        else:
            socketio.emit('updation_status', {'isFailed': True})
    if captcha_r != captcha_m:
        socketio.emit('validation_result', {'result': 'incorrect'})

@app.route('/support')
def support_form(): #This function renders the support form (not yet ready).
    return render_template('support.html')

@app.route('/send_support_query', methods=['POST'])
def send_support_query():
    form_data = request.json

    # Process the form data
    username = form_data.get('username')
    issue = form_data.get('issue')
    email = form_data.get('email')

    eaf.send_support(email_u=email, user=username, issue=issue)
    
    return jsonify({'success': True})

@app.route('/redirect/<data>')
def redirect_(data): #This function is to redirect the client to various locations. Locations are passed to this function using the "data" variable.
    if data == 'login':
        return render_template('redirect.html', link__='/', location_='home page')
    if data == 'support':
        return render_template('redirect.html', link__='/support', location_='support form')
    if data == 'forgot_password':
        return render_template('redirect.html', link__='/forgot_password', location_='forgot password')

@socketio.on('join_room_manual')
def handle_join_room(): #This function receives the socket emission from the client side to connect itself in a room to isolate itself from other connections.
    if session['logged_in'] == True:
        join_room(session['room_joined'])
        data = {
                'room': session['room_joined'],
                'name': session['username']
            }
        send_join_event(data)
    else:
        return redirect(url_for('unauthorized'))

@app.route('/redirect')
def unauthorized(): #Unauthorized connections are redirected here to redirect back to the home page.
    return render_template('unauthorized.html')

################################################################### CREATE ROOM ###################################################################

@app.route('/createroompage', methods=['POST', 'GET'])
def create_room():
    return render_template('create_room.html')

################################################################### CREATE ROOM ###################################################################

if __name__ == '__main__':
    ssl_context = ssl.create_default_context(ssl.Purpose.CLIENT_AUTH)
    ssl_context.load_cert_chain('OpenSSL_Certificates/self_signed/server.crt', keyfile='OpenSSL_Certificates/self_signed/server.key')
    app.run(host=functions.get_public_ip(), port=5001, debug=True, ssl_context=ssl_context)
    #app.run(host='localhost', port=5001, debug=True, ssl_context=ssl_context)
