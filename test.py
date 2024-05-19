import string
import random

def generate_random_string(length):
        # Define the characters to choose from
        characters = string.ascii_uppercase + string.digits

        # Generate random string
        random_string = ''.join(random.choice(characters) for _ in range(length))

        return random_string

print(f"Output: {generate_random_string(10)}")