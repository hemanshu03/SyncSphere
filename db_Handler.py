from pymongo import MongoClient
from s_funcs import functions as sf, CaptchaFunctions
from datetime import datetime
import secrets
import random
from string import ascii_uppercase
import base64

connection = MongoClient("mongodb://localhost:27017")
main_DB = connection['SyncSphere']
user_DB = main_DB['User_Database']
sessions_ = main_DB['sessions']
rooms_ = main_DB['Rooms']
licencee = main_DB['Licencee']

class user_op:
    @staticmethod
    def check_username(username):
        username = username
        existing_user = user_DB.find_one({"username": username})
        if existing_user:
            return 1
        else:
            return 0

    @staticmethod
    def register_user(data, asrooms=None, afr=None, admin=False, validated=None, ev=False):
        required_keys = {'uid', 'email', 'password'}
        missing_keys = required_keys - set(data.keys())
        required_ip = {'ip'}
        missing_ip = required_ip - set(data.keys())
        if missing_keys:
            return 10
        else:
            uid = data['uid']
            email = data['email']
            pass_ = data['password']
            cdt = datetime.now()
            fdt = cdt.strftime("%I:%M:%S %p %d/%m/%Y")
            if missing_ip:
                ip = None
            else:
                ip = data['ip']
        if user_op.check_username(uid) == 1:
            return 2
        if user_op.check_username(uid) == 0:
            user_DB.insert_one({
                "username": uid,
                "password": pass_,
                "email_id": email,
                "Request time" : fdt,
                "Last modified by" : ip,
                "Last modified at": None,
                "Number of times modified": 0,
                "Associated rooms" : asrooms,
                "Admin for rooms" : afr,
                "Is Admin at SyncSphere Development Team?" : admin,
                "User is validated?" : validated,
                "Is user's email validated?" : ev
            })
        if user_DB.count_documents({"username": uid}) == 0:
            return 5
        if user_DB.count_documents({"username": uid}) != 0:
            return 1

    @staticmethod
    def check_sid_only(sid):
        return sessions_.find_one({"sid" : sid})
    
    @staticmethod
    def check_email(uid, email_):
        user = user_DB.find_one({"username": uid})
        if user:
            email_tc = user["email_id"]
            if email_ == email_tc:
                return 2
            else:
                return 1

    @staticmethod
    def check_user_details(data):
        required_keys = {'uid', 'password'}
        missing_keys = required_keys - set(data.keys())

        uid = data['uid']
        user = user_DB.find_one({"username": uid})
        pass_ = data['password']

        if missing_keys:
            return 10
        else:
            if user:
                pass_tc = user["password"]
                if pass_ == pass_tc:
                    return 2
                else:
                    return 1
            else:
                return 0

    @staticmethod
    def update_change(uid, ip):
        ip_ = ip
        cudt = datetime.now()
        fodt = cudt.strftime("%I:%M:%S %p %d/%m/%Y")
        user_DB.update_one(
                    {'username': uid},
                    {
                        '$set': {'Last modified at': fodt, 'Last modified by': ip_},
                        '$inc': {'Number of times modified': 1}
                    }
                )

    @staticmethod
    def update_credentials(data):
        uid = data.get('uid')
        password = data.get('pass_')
        email = data.get('email')
        req_by = data.get('ip')
        as_r = data.get('room_s')
        ad_fr = data.get('ad_room_s')
        vali = data.get('valid_u')
        e_vali = data.get('valid_e')

        if not password and not email and not as_r and not ad_fr and not vali and not e_vali:
            return 0
        
        if uid:
            if user_op.check_username(uid) == 1:
                if password:
                    user_DB.update_one(filter=({'username': uid}), update=({'$set': {'password': password}}))
                if email:
                    user_DB.update_one(filter=({'username': uid}), update=({'$set': {'email_id': email}}))
                if not req_by:
                    req_by = "No identity"
                if as_r:
                    user_DB.update_one(filter=({'username': uid}), update=({'$set': {'Associated rooms': as_r}}))
                if ad_fr:
                    user_DB.update_one(filter=({'username': uid}), update=({'$set': {'Admin for rooms': ad_fr}}))
                if vali:
                    user_DB.update_one(filter=({'username': uid}), update=({'$set': {'User is validated?': vali}}))
                if e_vali:
                    user_DB.update_one(filter=({'username': uid}), update=({'$set': {"Is user's email validated?": e_vali}}))
                
                print("IP was:", req_by)
                user_op.update_change(uid=uid, ip=req_by)
                return 1
            else:
                return 2
        else:
            return 5

    @staticmethod
    def delete_acc(uid):
        user_DB.find_one_and_delete({'username': uid})

class Captcha_:
    @staticmethod
    def get_captcha_image():
        captcha_text = CaptchaFunctions.create_captcha()
        captcha_image = CaptchaFunctions.generate_captcha_image(captcha_text=captcha_text)
        return captcha_image, captcha_text

class session_op:
    @staticmethod
    def create_session_id():
        random_bytes = secrets.token_bytes(16)
        base64_encoded = base64.urlsafe_b64encode(random_bytes).decode('utf-8').rstrip('=')
        no_dashes_string = base64_encoded.replace('-', '!')
        return no_dashes_string
'''
    @staticmethod
    def operate_session_id(operation, sid=None, data=None):
        if operation == 1: #Create, SID Required
            cudt = datetime.now()
            fodt = cudt.strftime("%I:%M:%S %p %d/%m/%Y")
            sessions_.insert_one({
                'sid' : sid,
                'associated_user' : None,
                'validity_in_minutes' : 1440,
                'remaining_validity' : 1440, 
                'captcha_text' : None,
                'logged_in' : False,
                'admin_session' : False,
                'created at time' : fodt,
                'expired?' : False
            })

        if operation == 117118:  # Update validity for all sessions, SID not required
            all_sessions = sessions_.find()

            for sinst in all_sessions:
                sid = sinst['sid']
                f = sinst['created at time']
                validity = (sinst['validity_in_minutes'])*(-1)
                rv = sinst.get('remaining_validity', None)  # Get the remaining_validity if it exists

                fodt_ = datetime.strptime(f, "%I:%M:%S %p %d/%m/%Y")
                cudt = datetime.now()
                fodt = cudt.strftime("%I:%M:%S %p %d/%m/%Y")

                diff = ((fodt_ - cudt).total_seconds() / 60)

                new_rv = ((validity*(-1))+diff)

                if new_rv < -10:
                    sessions_.find_one_and_delete({'sid' : sid})
                if rv < 0 or rv == 0:
                    continue
                if rv != 0 or rv > 0:
                    if new_rv < 0 or new_rv == 0:
                        sessions_.update_one(({'sid' : sid}), ({'$set' : {'expired?' : True, 'associated_user': None, 'logged_in': False, 'admin_session': False, 'captcha_text': None}}))
                    sessions_.update_one(({'sid' : sid}), ({'$set' : {'remaining_validity' : new_rv}}))

        if operation == 0: #Delete, SID Required
            if sid == None:
                return 0
            else:
                sinst = sessions_.find_one_and_delete({'sid' : sid})

        if operation == 3: #Update values related to SID, SID is required
            asu = data.get('associated_user')
            cpt = data.get('captcha_text')
            lgi = data.get('logged_in')
            adms = data.get('admin_session')

            if sid != None: #Check if SID is sent
                sinst_ = sessions_.find_one({'sid': sid}) #sessions_ instance
                if sinst_: #Check if SID exists
                    if asu: #associated user, returns 1 on success
                        sessions_.update_one(({'sid': sid}), ({'$set': {'associated_user': asu}}))
                        return 1
                    if cpt: # captcha text, returns 1 on success
                        if cpt == 'Delete_existing': #Delete existing captcha, returns 1 on success
                            sessions_.update_one(({'sid': sid}), ({'$set': {'captcha_text': None}}))
                            return 1
                        else: #anything else than delete exising and None, returns 1 on success
                            sessions_.update_one(({'sid': sid}), ({'$set': {'captcha_text': cpt}}))
                            return 1
                    if lgi: #logged in, returns 1 on success
                        sessions_.update_one(({'sid': sid}), ({'$set': {'logged_in': lgi}}))
                        return 1
                    if adms: #admin session, returns 1 on success
                        sessions_.update_one(({'sid': sid}), ({'$set': {'admin_session': adms}}))
                        return 1
                    if adms is None and lgi is None and cpt is None and asu is None: #returns 5 if nothing was sent
                        return 5
                else: #0
                    return 0
            else: #returns 10 if SID not sent
                return 10

        if operation == 2: #Check validity, SID required
            if sid != None:
                existing_session = sessions_.find_one({'sid': sid})
                if not existing_session.get('expired', False):
                    return True
                else:
                    return False
            else:
                return None
'''

class room_op:
    @staticmethod
    def search_rooms(query=None, def_=0):
        # Perform search query
        existing_room = rooms_.find_one(query)
        if existing_room and def_ == 0: #Tells if the room exist
            return True
        if existing_room and  def_ == 1: #Gives everything stored in the document related to the room
            return existing_room
        if def_ == 2: #Gives a list of rooms present in the DB
            return rooms_.distinct("room_code")
        else:
            return False
    
    @staticmethod
    def generate_room_code():
        code = ""
        length=10
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

        if room_op.search_rooms({'room_code' : code}):
            room_op.generate_room_code(length)
        else:
            return code

    @staticmethod
    def store_chats(room_id, message, user, timestamp, msg_id):
        data = {
            'chats': {
                "message_id" : msg_id,
                "name": user,
                "message": message,
                "timestamp": timestamp
            }
        }
        rooms_.update_one({'room_code': room_id}, {'$push': data})
        return
    
    '''@staticmethod
    def delete_message(message_id):
        if not message_id:
            return "mid0"

        try:
            result = rooms_.update_one({'chats.message_id': message_id}, {'$pull': {'chats': {'message_id': message_id}}})
            if result.modified_count > 0:
                return "success"
            else:
                return "nf"
        except Exception as e:
            return e'''
    
    @staticmethod
    def delete_message(username, message_id):
        if not (username and message_id):
            return "msg_0"

        try:
            # Assuming you have a MongoDB collection named 'rooms_'
            # Assuming each document in 'rooms_' represents a room and has a field 'chats' which is an array of messages
            result = rooms_.update_one({'chats.message_id': message_id, 'chats.name': username}, {'$pull': {'chats': {'message_id': message_id}}})
            
            if result.modified_count > 0:
                return "success"
            else:
                return "nf"
        except Exception as e:
            return str(e)

    @staticmethod
    def create_room():
        room_id = room_op.generate_room_code()
        rooms_.insert_one({
            'room_code': room_id,
            'users': [],
            'chats': [],
            'room_key': [],
            'uploads': []
        })
        return room_id

    @staticmethod
    def check_room_pass(room_id, entered_pass_r):
        # Query the collection to find the document containing the room_password
        document = rooms_.find_one({"room_code": room_id})  # Query by room_code or any other unique identifier

        # Access the value of the room_password field
        if document:
            if entered_pass_r == document.get("room_password"):
                return True
            else:
                return False
        else:
            None

class activity_op:
    @staticmethod
    def update_activity(username, room_code, activity_stat):
        # Construct the filter to find the document
        filter_ = {"room_code": room_code}

        # Construct the path to the user's activity status
        user_path = f"users.$[elem]"

        # Define the update operation
        update_data = {
            "$set": {
                user_path: activity_stat
            }
        }

        # Define array filter to match the specific user in the users array
        array_filters = [{"elem.username": username}]

        # Perform the update operation
        result = rooms_.update_one(filter_, update_data, array_filters=array_filters, upsert=True)

        print("Documents matched:", result.matched_count)
        print("Documents modified:", result.modified_count)
    '''
    @staticmethod
    def add_or_update_user_activity(username, room_code, activity_stat):
        # Construct the filter to find the document
        filter_ = {"room_code": room_code}

        # Define the new user data
        new_user = {"username": username, "activity_status": activity_stat}

        # First try to update the user if they already exist
        user_path = f"users.$[elem].activity_status"
        update_data = {
            "$set": {
                user_path: activity_stat
            }
        }
        array_filters = [{"elem.username": username}]
        result = rooms_.update_one(filter_, update_data, array_filters=array_filters)

        # If no document was modified, check if the user exists
        if result.modified_count == 0:
            user_exists = rooms_.find_one({"room_code": room_code, "users.username": username})
            # If the user doesn't exist, add them
            if user_exists is None:
                update_data = {
                    "$push": {
                        "users": new_user
                    }
                }
                result = rooms_.update_one({"room_code": room_code}, update_data)

        print("Documents matched:", result.matched_count)
        print("Documents modified:", result.modified_count)
        print(result)
    '''

    @staticmethod
    def add_or_update_user_activity(username, room_code, activity_stat):
        # Construct the filter to find the document
        filter_ = {"room_code": room_code, "users.username": username}

        # First check if the user exists in the room
        user_exists = rooms_.find_one(filter_)

        if user_exists:
            # User exists, update the activity_status
            user_path = "users.$[elem].activity_status"
            update_data = {
                "$set": {
                    user_path: activity_stat
                }
            }
            array_filters = [{"elem.username": username}]
            rooms_.update_one({"room_code": room_code}, update_data, array_filters=array_filters)

            #print("Documents matched:", result.matched_count)
            #print("Documents modified:", result.modified_count)
            #print(result)
        else:
            # User does not exist, return 404
            #print("User not found")
            return 404

        return 200
    
    @staticmethod
    def get_user_activity(username, room_code):
        # Construct the filter to find the document
        filter_ = {"room_code": room_code, "users.username": username}

        # Perform the find operation
        document = rooms_.find_one(filter_, {"users.$": 1})

        # Extract the activity_status for the specific user
        if document is not None and "users" in document and len(document["users"]) > 0:
            user = document["users"][0]
            activity_status = user["activity_status"]
            #print(f"Activity status of {username} in room {room_code}: {activity_status}")
            return activity_status
        else:
            #print(f"No user named {username} found in room {room_code}")
            return 404

class licencee_op:
    @staticmethod
    def register_user_license(data):
        required_keys = {'uid', 'email', 'license_key', 'fid_gd'}
        missing_keys = required_keys - set(data.keys())
        if missing_keys:
            return 2
        else:
            uid = data['uid']
            email = data['email']
            license_key = data['license_key']
            gdfid = data['fid_gd']
            cdt = datetime.now()
            fdt = cdt.strftime("%I:%M:%S %p %d/%m/%Y")
            licencee.insert_one({
                "username": uid,
                "email_id": email,
                "Request time" : fdt,
                "License": license_key,
                "gd_file_ID": gdfid
            })
        if licencee.count_documents({"username": uid}) == 0:
            return 0
        if licencee.count_documents({"username": uid}) != 0:
            return 1

    @staticmethod
    def check_user(user):
        username = user
        existing_user = licencee.find_one({"username": username})
        if existing_user:
            return 1
        else:
            return 0

    @staticmethod
    def find_fid_by_username(username):
        # Query to find documents where the 'username' attribute matches the given value
        query = {'username': username}

        # Execute the query
        result = licencee.find_one(query)

        # If a document matching the query is found, return the value of the 'License' attribute
        if result:
            return result.get('gd_file_ID')
        else:
            return None


"""
_id: 660c0a579d09861df7c0dabb
room_code: "SUBMISSIONS"

users: Array (1)
    0: Object
        username: "Hemanshu"
        activity_status: 2

room_key: Array (empty)

uploads: Array (empty)

chats: Array (10)

room_password: "47b23b772c8dd26ae351e86af681dcba18d3be238f5eba6d9f1d1a548ec5b35f"

"""