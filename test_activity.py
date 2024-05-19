from db_Handler import activity_op as ao

room = "SUBMISSIONS"
user = "trial"
activity = 0

ao.add_or_update_user_activity(username=user, room_code=room, activity_stat=activity)

#ao.get_user_activity(username=user, room_code=room)

'''
_id: 660c0a579d09861df7c0dabb
room_code: "SUBMISSIONS"

users: Array (empty)

room_key: Array (empty)

uploads: Array (empty)

chats: Array (10)
room_password: "47b23b772c8dd26ae351e86af681dcba18d3be238f5eba6d9f1d1a548ec5b35f"

'''