import os
import torch
import torch.nn.functional as F
from transformers import AutoTokenizer, AutoModelForSequenceClassification

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
#MODEL_PATH = os.path.join(BASE_DIR, "model")
MODEL_NAME = "cardiffnlp/twitter-xlm-roberta-base-sentiment"

# load model
#tokenizer = AutoTokenizer.from_pretrained(MODEL_PATH)
#model = AutoModelForSequenceClassification.from_pretrained(MODEL_PATH)
tokenizer = AutoTokenizer.from_pretrained(MODEL_NAME)
model = AutoModelForSequenceClassification.from_pretrained(MODEL_NAME)

model.eval()

def convert_to_phq_score(p_negative, p_neutral, p_positive):
    # untuk lihat log cara kerja model
    score = (p_negative * 1.0) + (p_neutral * 0.4)

    if score < 0.3:
        return 0
    elif score < 0.7:
        return 1
    elif score < 1.1:
        return 2
    else:
        return 3

def classify_phq(total_score):
    if total_score <= 3:
        return "Minimal"
    elif total_score <= 6:
        return "Mild"
    elif total_score <= 9:
        return "Moderate"
    else:
        return "Severe"


def predict_text(text):
    inputs = tokenizer(text, return_tensors="pt", truncation=True, padding=True)

    with torch.no_grad():
        outputs = model(**inputs)
        probs = F.softmax(outputs.logits, dim=1)[0]

    p_negative = probs[0].item()
    p_neutral = probs[1].item()
    p_positive = probs[2].item()

    # 🔥 DEBUG
    print("TEXT:", text)
    print("NEG:", p_negative)
    print("NEU:", p_neutral)
    print("POS:", p_positive)

    phq_score = convert_to_phq_score(p_negative, p_neutral, p_positive)

    print("PHQ SCORE:", phq_score)
    print("-------------")

    return {
        "probabilities": {
            "negative": p_negative,
            "neutral": p_neutral,
            "positive": p_positive
        },
        "phq_score": phq_score
    }

def interpretation(category):
    mapping = {
        "Minimal": "Kondisi mental dalam batas normal.",
        "Mild": "Terdapat gejala ringan, disarankan menjaga pola hidup sehat.",
        "Moderate": "Perlu perhatian lebih terhadap kesehatan mental.",
        "Moderately Severe": "Disarankan konsultasi dengan profesional.",
        "Severe": "Segera cari bantuan profesional."
    }
    return mapping.get(category, "")

def predict_multiple(answer_list):
    #  Validasi input
    if not isinstance(answer_list, list) or len(answer_list) == 0:
        return {"error": "No valid input"}

    total_score = 0
    details = []

    for idx, item in enumerate(answer_list):
        # Ambil score dari dropdown (utama)
        score = item.get("score", 0)

        # Ambil text optional
        text = item.get("text", "").strip()

        # Validasi score (biar aman)
        if score not in [0, 1, 2, 3]:
            score = 0

        total_score += score

        #  NLP hanya dijalankan jika ada teks
        if text:
            nlp_result = predict_text(text)
        else:
            nlp_result = None

        # Simpan detail per pertanyaan
        details.append({
            "question_index": idx,
            "score": score,
            "text": text,
            "nlp": nlp_result
        })

    #  Hitung rata-rata
    avg_score = total_score / len(answer_list)

    #  Klasifikasi akhir
    category = classify_phq(total_score)

    #  DEBUG (opsional, boleh dihapus nanti)
    print("TOTAL SCORE:", total_score)
    print("AVERAGE SCORE:", avg_score)
    print("CATEGORY:", category)
    print("======================")

    return {
        "total_score": total_score,
        "average_score": avg_score,
        "category": category,
        "interpretation": interpretation(category),
        "details": details
    }