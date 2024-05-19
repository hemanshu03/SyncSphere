from db_Handler import room_op as ro

print(f"Result: {ro.search_rooms({'room_code':'OHKOYUEOLM'}, def_=1)}")