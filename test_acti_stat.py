import json
from db_Handler import activity_op as ao, room_op as ro
# Assuming partidat is your dictionary
room_code = "SUBMISSIONS"
room_data = ro.search_rooms(query={'room_code': room_code}, def_=1)
room_members = room_data.get("users", [])
#partidat = ao.add_or_update_user_activity(username='Hemanshu', room_code=room_code, activity_stat=2)
#partidat = {member: (ao.get_user_activity(username=member, room_code=room_code)) for member in room_members}
#print(f'Partidat: {partidat}')
## Convert the Python dictionary to a JSON string
#json_str = json.dumps(partidat)
#
#print(json_str)
for member in room_members:
    cur_u = member['username']
    print(f'Member: {cur_u}: {ao.get_user_activity(username=cur_u, room_code=room_code)}')
