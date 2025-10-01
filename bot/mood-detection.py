import joblib
import re
import os
from flask import Flask, request, jsonify
from flask_cors import CORS
from googletrans import Translator
import google.generativeai as genai

app = Flask(__name__)
CORS(app)

translator = Translator()

# Configure Gemini
GEMINI_API_KEY = "AIzaSyD64u_CJq5n5N_twIqjlsMH8bo6tx_jy34"
genai.configure(api_key=GEMINI_API_KEY)
gemini_model = genai.GenerativeModel('gemini-2.0-flash-exp')

def clean_text(text):
    text = str(text).lower()
    text = re.sub(r'[^a-zA-Z\s]', '', text)
    text = ' '.join(text.split())
    return text

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
    print("\nMissing files:")
    for name in missing_files:
        print(f"  • {model_files[name]}")
    print("\n⚠ Please run the training script first:")
    print("   python train_model.py")
    print("="*60)
    exit(1)

try:
    MODEL = joblib.load("mood-training/model.pkl")
    VECTORIZER = joblib.load("mood-training/vectorizer.pkl")
    LABEL_ENCODER = joblib.load("mood-training/label_encoder.pkl")
    print("✓ Models loaded successfully!")
    print(f"✓ Available emotions: {', '.join(LABEL_ENCODER.classes_)}")
    print("✓ Gemini API configured!")
    print("="*60)
except Exception as e:
    print(f"\n❌ Error loading models: {e}")
    print("="*60)
    exit(1)

# Mood recommendations mapping
MOOD_RECOMMENDATIONS = {
    'happy': {
        'emoji': '😊',
        'color': '#FFD700',
        'activities': ['berbagi kebahagiaan', 'bertemu teman', 'olahraga ringan']
    },
    'sad': {
        'emoji': '😢',
        'color': '#4682B4',
        'activities': ['istirahat', 'curhat dengan orang terdekat', 'menulis jurnal']
    },
    'angry': {
        'emoji': '😠',
        'color': '#DC143C',
        'activities': ['bernafas dalam', 'olahraga', 'meditasi']
    },
    'fear': {
        'emoji': '😰',
        'color': '#800080',
        'activities': ['relaksasi', 'berbicara dengan orang terpercaya', 'mindfulness']
    },
    'love': {
        'emoji': '❤️',
        'color': '#FF69B4',
        'activities': ['mengekspresikan perasaan', 'quality time', 'memberikan perhatian']
    },
    'surprise': {
        'emoji': '😲',
        'color': '#FFA500',
        'activities': ['menikmati momen', 'berbagi pengalaman', 'refleksi']
    }
}

def generate_mood_recommendation(mood, text, confidence):
    """Generate personalized recommendation using Gemini AI"""
    try:
        mood_info = MOOD_RECOMMENDATIONS.get(mood, {})
        
        prompt = f"""Kamu adalah psikolog AI yang memberikan rekomendasi personal berdasarkan emosi seseorang.

User sedang merasakan emosi: **{mood.upper()}** (confidence: {confidence*100:.1f}%)
Teks yang disampaikan: "{text}"

Buatkan rekomendasi personal yang hangat dan supportif dalam **TEPAT 7 KALIMAT**. Format:
1. Kalimat pembuka yang empati (1 kalimat)
2. Validasi perasaan mereka (1 kalimat)
3. Penjelasan singkat tentang emosi ini (1 kalimat)
4. Rekomendasi aktivitas konkret #1 (1 kalimat)
5. Rekomendasi aktivitas konkret #2 (1 kalimat)
6. Tips tambahan atau mindset positif (1 kalimat)
7. Penutup yang encouraging (1 kalimat)

PENTING:
- Gunakan bahasa Indonesia yang hangat dan personal
- HANYA gunakan bold markdown (**text**) untuk penekanan penting
- JANGAN gunakan markdown lain (italic, code, bullet points, numbering)
- Tulis dalam paragraf mengalir
- Fokus pada solusi praktis dan actionable
- Buat personal sesuai konteks teks user"""

        response = gemini_model.generate_content(prompt)
        text = response.text.strip()
        
        # Clean up unwanted markdown
        text = re.sub(r'_([^_]+)_', r'\1', text)  # Remove _italic_
        text = re.sub(r'\*([^\*]+)\*(?!\*)', r'\1', text)  # Remove single *italic*
        text = re.sub(r'~~([^~]+)~~', r'\1', text)  # Remove ~~strikethrough~~
        text = re.sub(r'`([^`]+)`', r'\1', text)  # Remove `code`
        text = re.sub(r'```[^`]*```', '', text)  # Remove ```code blocks```
        text = re.sub(r'^\d+\.\s+', '', text, flags=re.MULTILINE)  # Remove numbering
        text = re.sub(r'^[-•]\s+', '', text, flags=re.MULTILINE)  # Remove bullet points
        
        return text
    
    except Exception as e:
        print(f"⚠️ Gemini API Error: {e}")
        # Fallback recommendation
        return f"Terima kasih telah berbagi perasaanmu. Sepertinya kamu sedang merasakan **{mood}**. Ini adalah emosi yang wajar dan valid. Cobalah untuk menerima perasaan ini tanpa menghakimi diri sendiri. Kamu bisa melakukan aktivitas yang membuatmu lebih nyaman. Jangan ragu untuk berbicara dengan orang terdekat jika membutuhkan dukungan. Ingat, setiap emosi adalah bagian dari perjalanan hidupmu. Tetap semangat dan jaga diri baik-baik ya!"

def predict_mood(text, include_recommendation=True):
    original_text = text
    try:
        detection = translator.detect(text)
        if detection.lang == 'id':
            translated = translator.translate(text, src='id', dest='en')
            text = translated.text
            print(f"[Translated] '{original_text[:50]}...' → '{text[:50]}...'")
    except Exception as e:
        print(f"[Warning] Translation failed: {e}. Using original text.")
    
    text_clean = clean_text(text)
    if not text_clean.strip():
        return None, None, None
    
    vectorized_text = VECTORIZER.transform([text_clean])
    
    if hasattr(MODEL, 'predict_proba'):
        probabilities = MODEL.predict_proba(vectorized_text)[0]
        
        # Get all mood probabilities
        all_moods = []
        for i, prob in enumerate(probabilities):
            mood_label = LABEL_ENCODER.inverse_transform([i])[0]
            all_moods.append({
                "mood": mood_label,
                "confidence": round(float(prob), 4),
                "percentage": round(float(prob) * 100, 2)
            })
        
        # Sort by confidence descending
        all_moods.sort(key=lambda x: x['confidence'], reverse=True)
        
        # Get top prediction
        top_mood = all_moods[0]['mood']
        top_confidence = all_moods[0]['confidence']
        
        # Generate recommendation
        recommendation = None
        if include_recommendation:
            recommendation = generate_mood_recommendation(top_mood, original_text, top_confidence)
        
        return top_mood, all_moods, recommendation
    else:
        prediction = MODEL.predict(vectorized_text)
        predicted_label = LABEL_ENCODER.inverse_transform(prediction)[0]
        return predicted_label, None, None

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

@app.route('/predict', methods=['POST'])
def predict():
    try:
        data = request.get_json()
        if not data:
            return jsonify({"error": "No JSON data provided"}), 400
        
        # Support array format - AGGREGATE ALL TEXTS INTO ONE ANALYSIS
        if isinstance(data, list):
            # Collect all texts
            all_texts = []
            for idx, item in enumerate(data):
                if not isinstance(item, dict):
                    continue
                text = item.get('text', '').strip()
                if text:
                    all_texts.append(text)
            
            if not all_texts:
                return jsonify({
                    "status": "error",
                    "error": "No valid texts found in array"
                }), 400
            
            # Combine all texts with space separator
            combined_text = " ".join(all_texts)
            
            # Single prediction for combined text
            include_recommendation = data[0].get('include_recommendation', True) if len(data) > 0 else True
            if isinstance(include_recommendation, str):
                include_recommendation = include_recommendation.lower() in ['true', '1', 'yes']
            
            top_mood, all_moods, recommendation = predict_mood(combined_text, include_recommendation)
            
            if top_mood is None:
                return jsonify({
                    "status": "error",
                    "error": "Could not predict emotion. Text might be too short or invalid."
                }), 400
            
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
        
        # Single object format (original behavior)
        else:
            text = data.get('text', '').strip()
            if not text:
                return jsonify({"error": "Text is required and cannot be empty"}), 400
            
            include_recommendation = data.get('include_recommendation', True)
            if isinstance(include_recommendation, str):
                include_recommendation = include_recommendation.lower() in ['true', '1', 'yes']
            
            top_mood, all_moods, recommendation = predict_mood(text, include_recommendation)
            
            if top_mood is None:
                return jsonify({
                    "error": "Could not predict emotion. Text might be too short or invalid."
                }), 400
            
            response = {
                "status": "success",
                "text": text,
                "primary_mood": top_mood,
                "confidence": all_moods[0]['confidence'],
                "percentage": all_moods[0]['percentage'],
                "all_moods": all_moods,
                "mood_info": MOOD_RECOMMENDATIONS.get(top_mood, {}),
                "recommendation": recommendation
            }
            
            return jsonify(response)
    
    except Exception as e:
        return jsonify({"error": f"Internal server error: {str(e)}"}), 500

@app.route('/batch', methods=['POST'])
def batch_predict():
    try:
        data = request.get_json()
        if not data or 'texts' not in data:
            return jsonify({"error": "Texts array is required"}), 400
        
        texts = data.get('texts', [])
        if not isinstance(texts, list):
            return jsonify({"error": "Texts must be an array"}), 400
        
        if len(texts) > 100:
            return jsonify({"error": "Maximum 100 texts per request"}), 400
        
        include_recommendation = data.get('include_recommendation', False)
        
        results = []
        for text in texts:
            top_mood, all_moods, recommendation = predict_mood(text, include_recommendation)
            
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
                results.append({
                    "text": text,
                    "error": "Could not predict emotion"
                })
        
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
    print("🚀 EMOTION DETECTION API WITH AI RECOMMENDATIONS")
    print("="*60)
    print("\nAPI is running on:")
    print("  • http://localhost:6000")
    print("\nEndpoints:")
    print("  • GET  /          - Health check")
    print("  • POST /predict   - Predict single text with recommendations")
    print("  • POST /batch     - Predict multiple texts")
    print("\nExample Request (Single):")
    print("""
  curl -X POST http://localhost:6000/predict \\
    -H "Content-Type: application/json" \\
    -d '{
      "text": "Aku sangat senang hari ini!",
      "include_recommendation": true
    }'
    """)
    print("\nExample Request (Array):")
    print("""
  curl -X POST http://localhost:6000/predict \\
    -H "Content-Type: application/json" \\
    -d '[
      {"text": "Aku sangat senang hari ini!"},
      {"text": "Aku sedih sekali"}
    ]'
    """)
    print("\nResponse includes:")
    print("  • Primary mood (highest confidence)")
    print("  • All mood probabilities (complete array)")
    print("  • AI-generated recommendations (7 sentences)")
    print("="*60 + "\n")
    app.run(debug=True, host='0.0.0.0', port=6000)