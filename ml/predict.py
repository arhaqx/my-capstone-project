import requests

HF_API_URL = "https://murera-mental-health-nlp.hf.space/run/predict"


def convert_to_phq_score(p_negative, p_neutral, p_positive):
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
    payload = {
        "data": [text]
    }

    response = requests.post(HF_API_URL, json=payload)

    result = response.json()

    print("HF RESPONSE:", result)

    # ambil hasil dari gradio
    prediction = result["data"][0]

    p_negative = prediction["negative"]
    p_neutral = prediction["neutral"]
    p_positive = prediction["positive"]

    phq_score = convert_to_phq_score(
        p_negative,
        p_neutral,
        p_positive
    )

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
    if not isinstance(answer_list, list) or len(answer_list) == 0:
        return {"error": "No valid input"}

    total_score = 0
    details = []

    for idx, item in enumerate(answer_list):

        score = item.get("score", 0)

        text = item.get("text", "").strip()

        if score not in [0, 1, 2, 3]:
            score = 0

        total_score += score

        if text:
            nlp_result = predict_text(text)
        else:
            nlp_result = None

        details.append({
            "question_index": idx,
            "score": score,
            "text": text,
            "nlp": nlp_result
        })

    avg_score = total_score / len(answer_list)

    category = classify_phq(total_score)

    return {
        "total_score": total_score,
        "average_score": avg_score,
        "category": category,
        "interpretation": interpretation(category),
        "details": details
    }