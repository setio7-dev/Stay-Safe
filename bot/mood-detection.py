import joblib
import re
import os
from flask import Flask, request, jsonify
from flask_cors import CORS
from googletrans import Translator

app = Flask(__name__)
CORS(app)

translator = Translator()

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
    print("="*60)
except Exception as e:
    print(f"\n❌ Error loading models: {e}")
    print("="*60)
    exit(1)

def predict_mood(text):
    original_text = text
    try:
        detection = translator.detect(text)
        if detection.lang == 'id':
            translated = translator.translate(text, src='id', dest='en')
            text = translated.text
            print(f"[Translated] '{original_text}' → '{text}'")
    except Exception as e:
        print(f"[Warning] Translation failed: {e}. Using original text.")
    text_clean = clean_text(text)
    if not text_clean.strip():
        return None, 0.0
    vectorized_text = VECTORIZER.transform([text_clean])
    if hasattr(MODEL, 'predict_proba'):
        probabilities = MODEL.predict_proba(vectorized_text)[0]
        predicted_index = int(probabilities.argmax())
        predicted_label = LABEL_ENCODER.inverse_transform([predicted_index])[0]
        confidence = float(probabilities[predicted_index])
        return predicted_label, confidence
    else:
        prediction = MODEL.predict(vectorized_text)
        predicted_label = LABEL_ENCODER.inverse_transform(prediction)[0]
        return predicted_label, None

@app.route('/', methods=['GET'])
def home():
    return jsonify({
        "status": "running",
        "service": "Emotion Detection API (with Indonesian support)",
        "version": "1.1",
        "available_emotions": LABEL_ENCODER.classes_.tolist(),
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
        text = data.get('text', '').strip()
        if not text:
            return jsonify({"error": "Text is required and cannot be empty"}), 400
        mood, confidence = predict_mood(text)
        if mood is None:
            return jsonify({
                "error": "Could not predict emotion. Text might be too short or invalid."
            }), 400
        response = {
            "text": {"user": text},
            "mood": mood,
            "confidence": confidence if confidence is not None else "N/A"
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
        results = []
        for text in texts:
            mood, confidence = predict_mood(text)
            results.append({
                "text": {"user": text},
                "mood": mood if mood else "unknown",
                "confidence": confidence if confidence is not None else "N/A"
            })
        return jsonify({"count": len(results), "results": results})
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
    print("🚀 EMOTION DETECTION API (WITH INDONESIAN SUPPORT)")
    print("="*60)
    print("\nAPI is running on:")
    print("  • http://localhost:6000")
    print("\nEndpoints:")
    print("  • GET  /          - Health check")
    print("  • POST /predict   - Predict single text (supports Indonesian)")
    print("  • POST /batch     - Predict multiple texts")
    print("\nExample (Indonesian):")
    print("""
  curl -X POST http://localhost:6000/predict \\
    -H "Content-Type: application/json" \\
    -d '{"text":"Aku sangat senang hari ini!"}'
    """)
    print("="*60 + "\n")
    app.run(debug=True, host='0.0.0.0', port=6000)
