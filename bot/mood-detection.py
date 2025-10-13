import joblib
import re
import os
from flask import Flask, request, jsonify
from flask_cors import CORS
from deep_translator import GoogleTranslator
import google.generativeai as genai

app = Flask(__name__)
CORS(app)

# Konfigurasi Gemini
GEMINI_API_KEY = "ISI_API_KEY_MU_DI_SINI"
genai.configure(api_key=GEMINI_API_KEY)
gemini_model = genai.GenerativeModel('gemini-2.0-flash-exp')

# 🧹 Fungsi clean text
def clean_text(text):
    text = str(text).lower()
    text = re.sub(r'[^a-zA-Z\s]', '', text)
    text = ' '.join(text.split())
    return text

# 📦 Load Model Machine Learning
print("="*60)
print("Loading emotion detection models from mood-training/ folder...")
print("="*60)

if not os.path.exists('mood-training'):
    print("\n❌ ERROR: 'mood-training/' folder not found!")
    print("\n⚠ Please run the training script first:")
    print("   python train_model.py")
    print("="*60)
    exit(1)

model_files = {
    'model': 'mood-training/model.pkl',
    'vectorizer': 'mood-training/vectorizer.pkl',
    'label_encoder': 'mood-training/label_encoder.pkl'
}

missing_files = [name for name, path in model_files.items() if not os.path.exists(path)]

if missing_files:
    print(f"\n❌ ERROR: Missing model files in mood-training/ folder!")
    for name in missing_files:
        print(f"  • {model_files[name]}")
    print("\n⚠ Please run the training script first:")
    print("   python train_model.py")
    print("="*60)
    exit(1)

try:
    MODEL = joblib.load(model_files['model'])
    VECTORIZER = joblib.load(model_files['vectorizer'])
    LABEL_ENCODER = joblib.load(model_files['label_encoder'])
    print("✓ Models loaded successfully!")
    print(f"✓ Available emotions: {', '.join(LABEL_ENCODER.classes_)}")
    print("✓ Gemini API configured!")
    print("="*60)
except Exception as e:
    print(f"\n❌ Error loading models: {e}")
    print("="*60)
    exit(1)

# 💬 Mood recommendations mapping
MOOD_RECOMMENDATIONS = {
    'happy': {'emoji': '😊','color': '#FFD700','activities': ['berbagi kebahagiaan', 'bertemu teman', 'olahraga ringan']},
    'sad': {'emoji': '😢','color': '#4682B4','activities': ['istirahat', 'curhat dengan orang terdekat', 'menulis jurnal']},
    'angry': {'emoji': '😠','color': '#DC143C','activities': ['bernafas dalam', 'olahraga', 'meditasi']},
    'fear': {'emoji': '😰','color': '#800080','activities': ['relaksasi', 'berbicara dengan orang terpercaya', 'mindfulness']},
    'love': {'emoji': '❤️','color': '#FF69B4','activities': ['mengekspresikan perasaan', 'quality time', 'memberikan perhatian']},
    'surprise': {'emoji': '😲','color': '#FFA500','activities': ['menikmati momen', 'berbagi pengalaman', 'refleksi']}
}

# 🧠 Fungsi rekomendasi dari Gemini
def generate_mood_recommendation(mood, text, confidence):
    try:
        prompt = f"""Kamu adalah psikolog AI yang memberikan rekomendasi personal berdasarkan emosi seseorang.

User sedang merasakan emosi: **{mood.upper()}** (confidence: {confidence*100:.1f}%)
Teks yang disampaikan: "{text}"

Buatkan rekomendasi personal yang hangat dan supportif dalam **TEPAT 7 KALIMAT**. Format:
1. Kalimat pembuka empati
2. Validasi perasaan
3. Penjelasan singkat
4. Rekomendasi aktivitas 1
5. Rekomendasi aktivitas 2
6. Tips mindset positif
7. Penutup encouraging

PENTING:
- Gunakan bahasa Indonesia yang hangat dan personal
- HANYA gunakan bold markdown (**text**) untuk penekanan penting
- Tulis dalam paragraf mengalir
- Fokus solusi praktis
"""
        response = gemini_model.generate_content(prompt)
        text = response.text.strip()

        # Bersihkan markdown yang tidak diperlukan
        text = re.sub(r'_([^_]+)_', r'\1', text)
        text = re.sub(r'\*([^\*]+)\*(?!\*)', r'\1', text)
        text = re.sub(r'~~([^~]+)~~', r'\1', text)
        text = re.sub(r'`([^`]+)`', r'\1', text)
        text = re.sub(r'```[^`]*```', '', text)
        text = re.sub(r'^\d+\.\s+', '', text, flags=re.MULTILINE)
        text = re.sub(r'^[-•]\s+', '', text, flags=re.MULTILINE)
        return text

    except Exception as e:
        print(f"⚠️ Gemini API Error: {e}")
        return f"Terima kasih telah berbagi perasaanmu. Sepertinya kamu sedang merasakan **{mood}**. Ini adalah emosi yang valid. Cobalah aktivitas yang membuatmu nyaman dan jangan ragu untuk meminta dukungan."

# 🧭 Fungsi prediksi mood dengan deep-translator
def predict_mood(text, include_recommendation=True):
    original_text = text
    try:
        # terjemahkan jika bahasa Indonesia
        translated = GoogleTranslator(source='id', target='en').translate(text)
        if translated and translated != text:
            print(f"[Translated] '{text[:50]}...' → '{translated[:50]}...'")
            text = translated
    except Exception as e:
        print(f"[Warning] Translation failed: {e}. Using original text.")
    
    text_clean = clean_text(text)
    if not text_clean.strip():
        return None, None, None
    
    vectorized_text = VECTORIZER.transform([text_clean])
    
    if hasattr(MODEL, 'predict_proba'):
        probabilities = MODEL.predict_proba(vectorized_text)[0]
        all_moods = []
        for i, prob in enumerate(probabilities):
            mood_label = LABEL_ENCODER.inverse_transform([i])[0]
            all_moods.append({
                "mood": mood_label,
                "confidence": round(float(prob), 4),
                "percentage": round(float(prob) * 100, 2)
            })
        all_moods.sort(key=lambda x: x['confidence'], reverse=True)

        top_mood = all_moods[0]['mood']
        top_confidence = all_moods[0]['confidence']

        recommendation = None
        if include_recommendation:
            recommendation = generate_mood_recommendation(top_mood, original_text, top_confidence)
        
        return top_mood, all_moods, recommendation
    else:
        prediction = MODEL.predict(vectorized_text)
        predicted_label = LABEL_ENCODER.inverse_transform(prediction)[0]
        return predicted_label, None, None

# 🩺 Health check
@app.route('/', methods=['GET'])
def home():
    return jsonify({
        "status": "running",
        "service": "Emotion Detection API with AI Recommendations",
        "version": "2.0",
        "available_emotions": LABEL_ENCODER.classes_.tolist(),
        "ai_model": "Gemini 2.0 Flash",
        "endpoints": {
            "predict": "/predict (POST)",
            "batch": "/batch (POST)",
            "health": "/ (GET)"
        },
        "note": "Input in Indonesian is automatically translated to English before prediction."
    })

# 🔥 Predict single atau array
@app.route('/predict', methods=['POST'])
def predict():
    try:
        data = request.get_json()
        if not data:
            return jsonify({"error": "No JSON data provided"}), 400
        
        # Array
        if isinstance(data, list):
            all_texts = [item.get('text', '').strip() for item in data if isinstance(item, dict)]
            if not all_texts:
                return jsonify({"status": "error", "error": "No valid texts found"}), 400
            
            combined_text = " ".join(all_texts)
            include_recommendation = True

            top_mood, all_moods, recommendation = predict_mood(combined_text, include_recommendation)
            if top_mood is None:
                return jsonify({"status": "error", "error": "Text too short"}), 400

            return jsonify({
                "status": "success",
                "total_inputs": len(all_texts),
                "combined_text": combined_text[:200] + "..." if len(combined_text) > 200 else combined_text,
                "primary_mood": top_mood,
                "confidence": all_moods[0]['confidence'],
                "percentage": all_moods[0]['percentage'],
                "all_moods": all_moods,
                "mood_info": MOOD_RECOMMENDATIONS.get(top_mood, {}),
                "recommendation": recommendation
            })
        
        # Single object
        else:
            text = data.get('text', '').strip()
            if not text:
                return jsonify({"error": "Text is required"}), 400
            
            include_recommendation = data.get('include_recommendation', True)
            top_mood, all_moods, recommendation = predict_mood(text, include_recommendation)
            if top_mood is None:
                return jsonify({"error": "Text too short"}), 400

            return jsonify({
                "status": "success",
                "text": text,
                "primary_mood": top_mood,
                "confidence": all_moods[0]['confidence'],
                "percentage": all_moods[0]['percentage'],
                "all_moods": all_moods,
                "mood_info": MOOD_RECOMMENDATIONS.get(top_mood, {}),
                "recommendation": recommendation
            })
    except Exception as e:
        return jsonify({"error": f"Internal server error: {str(e)}"}), 500

# 🧾 Batch predict multiple texts
@app.route('/batch', methods=['POST'])
def batch_predict():
    try:
        data = request.get_json()
        if not data or 'texts' not in data:
            return jsonify({"error": "Texts array is required"}), 400

        texts = data.get('texts', [])
        if not isinstance(texts, list):
            return jsonify({"error": "Texts must be an array"}), 400
        
        results = []
        for text in texts:
            top_mood, all_moods, recommendation = predict_mood(text, False)
            if top_mood:
                results.append({
                    "text": text,
                    "primary_mood": top_mood,
                    "confidence": all_moods[0]['confidence'],
                    "percentage": all_moods[0]['percentage'],
                    "all_moods": all_moods,
                    "recommendation": recommendation
                })
            else:
                results.append({"text": text, "error": "Could not predict emotion"})

        return jsonify({
            "status": "success",
            "count": len(results),
            "results": results
        })
    except Exception as e:
        return jsonify({"error": f"Internal server error: {str(e)}"}), 500

@app.errorhandler(404)
def not_found(e):
    return jsonify({"error": "Endpoint not found"}), 404

@app.errorhandler(500)
def internal_error(e):
    return jsonify({"error": "Internal server error"}), 500

if __name__ == '__main__':
    print("\n" + "="*60)
    print("🚀 EMOTION DETECTION API WITH AI RECOMMENDATIONS (Deep Translator)")
    print("="*60)
    print("Running at http://localhost:6100")
    app.run(debug=True, host='0.0.0.0', port=6100)
