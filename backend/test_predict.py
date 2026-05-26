import os
import sys
import django

sys.path.append('c:\\Users\\ACER\\Documents\\bootcamp\\capstone\\Capstone_FullstackB11\\backend')
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from api.views import predict_multiple

answers = [
    {"question_index": 1, "score": 0, "text": "Tidak Pernah"},
    {"question_index": 2, "score": 0, "text": "Tidak Pernah"},
    {"question_index": 3, "score": 0, "text": "Tidak Pernah"},
    {"question_index": 4, "score": 0, "text": "Tidak Pernah"},
    {"question_index": 5, "score": 0, "text": "Tidak Pernah"},
    {"question_index": 6, "score": 0, "text": "Tidak Pernah"},
    {"question_index": 7, "score": 0, "text": "Tidak Pernah"},
    {"question_index": 8, "score": 0, "text": "Tidak Pernah"},
    {"question_index": 9, "score": 0, "text": "Tidak Pernah"}
]

print("Testing predict_multiple...")
result = predict_multiple(answers)
print("RESULT:", result)
