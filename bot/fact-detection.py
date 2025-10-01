from flask import Flask, request, jsonify
from flask_cors import CORS
import pickle
import re
import pandas as pd
import google.generativeai as genai
import os

app = Flask(__name__)
CORS(app)

GEMINI_API_KEY = "AIzaSyD64u_CJq5n5N_twIqjlsMH8bo6tx_jy34"
genai.configure(api_key=GEMINI_API_KEY)
gemini_model = genai.GenerativeModel('gemini-2.0-flash-exp')

print("🚀 Loading ML models...")
try:
    with open('fact-training/tfidf_vectorizer.pkl', 'rb') as f:
        tfidf = pickle.load(f)
    with open('fact-training/rf_model.pkl', 'rb') as f:
        rf_model = pickle.load(f)
    with open('fact-training/label_classes.pkl', 'rb') as f:
        label_classes = pickle.load(f)
    dataset = pd.read_csv('fact_detection.csv', delimiter=';')
    print(f"✓ Dataset loaded: {len(dataset)} records")
    print(f"✓ Models loaded successfully!")
    print(f"✓ Available classes: {label_classes}")
    print(f"✓ Gemini API configured!")
except FileNotFoundError as e:
    print(f"❌ Error: Model files not found!")
    print(f"   Please run 'python train_model.py' first")
    exit(1)

def preprocess_text(text):
    if not text or text.strip() == "":
        return ""
    text = str(text).lower()
    text = re.sub(r'http\S+|www.\S+', '', text)
    text = re.sub(r'@\w+|#\w+', '', text)
    text = re.sub(r'[^a-z\s]', ' ', text)
    text = re.sub(r'\s+', ' ', text).strip()
    return text

def generate_ai_description(flag, title, description, confidence):
    try:
        if flag == "HOAX":
            prompt = f"""Kamu adalah fact-checker profesional. Berdasarkan analisis ML, berita berikut terdeteksi sebagai HOAX dengan confidence {confidence}%.
Judul: {title}
Deskripsi: {description[:500]}
Buatkan penjelasan singkat dan jelas (maksimal 3-4 kalimat) mengapa berita ini kemungkinan HOAX. Fokus pada:
- Indikator clickbait atau sensasional
- Pola bahasa yang mencurigakan
- Kurangnya sumber kredibel
- Red flags umum pada hoax
PENTING: 
- Gunakan bahasa Indonesia yang mudah dipahami
- HANYA gunakan bold markdown (**text**) untuk penekanan
- JANGAN gunakan markdown lain seperti italic, strikethrough, code block, atau bullet points
- Tulis dalam paragraf mengalir, bukan list"""
        else:
            prompt = f"""Kamu adalah fact-checker profesional. Berdasarkan analisis ML, berita berikut terdeteksi sebagai FAKTA dengan confidence {confidence}%.
Judul: {title}
Deskripsi: {description[:500]}
Buatkan penjelasan singkat dan jelas (maksimal 3-4 kalimat) mengapa berita ini kemungkinan berisi fakta. Fokus pada:
- Bahasa yang objektif dan berimbang
- Tidak mengandung clickbait
- Pola penulisan jurnalistik
- Indikator kredibilitas
PENTING:
- Gunakan bahasa Indonesia yang mudah dipahami
- HANYA gunakan bold markdown (**text**) untuk penekanan
- JANGAN gunakan markdown lain seperti italic, strikethrough, code block, atau bullet points
- Tulis dalam paragraf mengalir, bukan list"""
        response = gemini_model.generate_content(prompt)
        text = response.text.strip()
        text = re.sub(r'_([^_]+)_', r'\1', text)
        text = re.sub(r'\*([^\*]+)\*(?!\*)', r'\1', text)
        text = re.sub(r'~~([^~]+)~~', r'\1', text)
        text = re.sub(r'`([^`]+)`', r'\1', text)
        text = re.sub(r'```[^`]*```', '', text)
        return text
    except Exception as e:
        print(f"⚠️ Gemini API Error: {e}")
        if flag == "HOAX":
            return f"Berita ini terdeteksi sebagai HOAX dengan tingkat keyakinan {confidence}%. Terdapat indikator bahasa yang tidak kredibel atau sensasional. Sebaiknya verifikasi dari sumber terpercaya."
        else:
            return f"Berita ini terdeteksi sebagai FAKTA dengan tingkat keyakinan {confidence}%. Pola bahasa menunjukkan karakteristik berita yang kredibel dan objektif."

def find_similar_in_dataset(title, description, threshold=0.5):
    try:
        from sklearn.metrics.pairwise import cosine_similarity
        query_text = f"{title} {description}"
        query_processed = preprocess_text(query_text)
        query_tfidf = tfidf.transform([query_processed])
        dataset_texts = (dataset['blog_title'].fillna('') + ' ' + 
                        dataset['post_text'].fillna('')).apply(preprocess_text)
        dataset_tfidf = tfidf.transform(dataset_texts)
        similarities = cosine_similarity(query_tfidf, dataset_tfidf)[0]
        matches = []
        for idx, sim in enumerate(similarities):
            if sim >= threshold:
                row = dataset.iloc[idx]
                matches.append({
                    'similarity': round(float(sim), 4),
                    'blog_title': str(row.get('blog_title', '')),
                    'post_text': str(row.get('post_text', ''))[:500],
                    'flag': str(row.get('flag', '')),
                    'blog_url': str(row.get('blog_url', '')),
                    'post_share': int(row['post_share']) if pd.notna(row.get('post_share')) else 0,
                    'post_view': int(row['post_view']) if pd.notna(row.get('post_view')) else 0,
                    'post_likes': int(row['post_likes']) if pd.notna(row.get('post_likes')) else 0,
                    'blog_date': str(row.get('blog_date', '')),
                    'thumbnail': str(row.get('thumbnail', ''))
                })
        matches.sort(key=lambda x: x['similarity'], reverse=True)
        return matches[:5]
    except Exception as e:
        print(f"Error finding similar: {e}")
        return []

def predict_hoax(title, description, image_url="", news_url="", include_ai_desc=True, confidence_threshold=0.75):
    combined = f"{title} {description}"
    processed = preprocess_text(combined)
    if len(processed) < 5:
        return {
            'status': 'error',
            'message': 'Text terlalu pendek untuk diprediksi (minimum 5 karakter)',
            'prediction': None,
            'confidence': 0
        }
    text_tfidf = tfidf.transform([processed])
    prediction = rf_model.predict(text_tfidf)[0]
    proba = rf_model.predict_proba(text_tfidf)[0]
    confidence = max(proba) * 100
    class_proba = {}
    for i, cls in enumerate(label_classes):
        class_proba[cls] = round(proba[i] * 100, 2)
    similar_news = find_similar_in_dataset(title, description, threshold=0.4)
    if len(similar_news) == 0 and prediction == 'HOAX':
        prediction = 'FAKTA'
        temp_hoax = class_proba.get('HOAX', 0)
        temp_fakta = class_proba.get('FAKTA', 0)
        class_proba = {
            'FAKTA': temp_hoax,
            'HOAX': temp_fakta
        }
        confidence = temp_hoax
    elif prediction == 'HOAX' and confidence < confidence_threshold * 100:
        prediction = 'FAKTA'
        temp_hoax = class_proba.get('HOAX', 0)
        temp_fakta = class_proba.get('FAKTA', 0)
        class_proba = {
            'FAKTA': temp_hoax,
            'HOAX': temp_fakta
        }
        confidence = temp_hoax
    elif len(similar_news) > 0:
        similar_flags = [news['flag'] for news in similar_news[:3]]
        fakta_count = sum(1 for flag in similar_flags if flag == 'FAKTA')
        if fakta_count >= 2 and prediction == 'HOAX':
            prediction = 'FAKTA'
            temp_hoax = class_proba.get('HOAX', 0)
            temp_fakta = class_proba.get('FAKTA', 0)
            class_proba = {
                'FAKTA': temp_hoax,
                'HOAX': temp_fakta
            }
            confidence = temp_hoax
    ai_description = None
    if include_ai_desc:
        ai_description = generate_ai_description(prediction, title, description, round(confidence, 2))
    result = {
        'status': 'success',
        'prediction': prediction,
        'confidence': round(confidence, 2),
        'probabilities': class_proba,
        'is_hoax': prediction == 'HOAX',
        'ai_description': ai_description,
        'similar_news': similar_news,
        'total_matches': len(similar_news),
        'input_data': {
            'title': title,
            'description': description[:100] + '...' if len(description) > 100 else description,
            'image_url': image_url if image_url else None,
            'news_url': news_url if news_url else None
        }
    }
    return result

@app.route('/', methods=['GET'])
def index():
    return jsonify({
        'service': 'Hoax Detector ML API with AI Description',
        'version': '2.0',
        'model': 'Random Forest + TF-IDF + Gemini 2.0 Flash',
        'endpoints': {
            'POST /api/predict': 'Predict news authenticity with AI explanation',
            'POST /api/batch-predict': 'Batch prediction',
            'GET /api/health': 'Health check'
        },
        'required_body': {
            'title': 'Judul berita (required)',
            'description': 'Deskripsi berita (required)',
            'image_url': 'URL gambar berita (optional)',
            'news_url': 'URL sumber berita (optional)',
            'include_ai_desc': 'Generate AI description (optional, default: true)'
        }
    })

@app.route('/api/health', methods=['GET'])
def health():
    return jsonify({
        'status': 'healthy',
        'model_loaded': True,
        'gemini_configured': True,
        'available_classes': list(label_classes)
    })

@app.route('/api/predict', methods=['POST'])
def predict():
    try:
        if request.is_json:
            data = request.get_json()
        else:
            data = request.form.to_dict()
        if 'title' not in data or 'description' not in data:
            return jsonify({
                'status': 'error',
                'message': 'Missing required fields: title, description',
                'example': {
                    'title': 'Video Guru Melakukan Pelecehan',
                    'description': 'Guru harusnya digugu dan ditiru...',
                    'image_url': 'https://example.com/image.jpg (optional)',
                    'news_url': 'https://twitter.com/example (optional)',
                    'include_ai_desc': 'true/false (optional)'
                }
            }), 400
        title = data.get('title', '')
        description = data.get('description', '')
        image_url = data.get('image_url', '')
        news_url = data.get('news_url', '')
        include_ai_desc = data.get('include_ai_desc', True)
        if isinstance(include_ai_desc, str):
            include_ai_desc = include_ai_desc.lower() in ['true', '1', 'yes']
        if 'image' in request.files:
            image_file = request.files['image']
            image_url = f"uploaded:{image_file.filename}"
        result = predict_hoax(title, description, image_url, news_url, include_ai_desc)
        return jsonify(result), 200
    except Exception as e:
        return jsonify({
            'status': 'error',
            'message': str(e)
        }), 500

@app.route('/api/batch-predict', methods=['POST'])
def batch_predict():
    try:
        if not request.is_json:
            return jsonify({
                'status': 'error',
                'message': 'Content-Type must be application/json'
            }), 400
        data = request.get_json()
        if 'items' not in data or not isinstance(data['items'], list):
            return jsonify({
                'status': 'error',
                'message': 'Missing or invalid "items" array'
            }), 400
        include_ai_desc = data.get('include_ai_desc', True)
        results = []
        for idx, item in enumerate(data['items']):
            if 'title' not in item or 'description' not in item:
                results.append({
                    'index': idx,
                    'status': 'error',
                    'message': 'Missing required fields'
                })
                continue
            result = predict_hoax(
                item.get('title', ''),
                item.get('description', ''),
                item.get('image_url', ''),
                item.get('news_url', ''),
                include_ai_desc
            )
            result['index'] = idx
            results.append(result)
        return jsonify({
            'status': 'success',
            'total': len(results),
            'results': results
        }), 200
    except Exception as e:
        return jsonify({
            'status': 'error',
            'message': str(e)
        }), 500

@app.errorhandler(404)
def not_found(e):
    return jsonify({
        'status': 'error',
        'message': 'Endpoint not found'
    }), 404

@app.errorhandler(500)
def internal_error(e):
    return jsonify({
        'status': 'error',
        'message': 'Internal server error'
    }), 500

if __name__ == '__main__':
    print("\n" + "="*60)
    print("🚀 Hoax Detector ML API Server with AI Description")
    print("="*60)
    print(f"📊 Model classes: {label_classes}")
    print(f"🤖 AI Model: Gemini 2.0 Flash")
    print(f"🌐 Server: http://127.0.0.1:5000")
    print(f"📝 Docs: http://127.0.0.1:5000/")
    print("="*60)
    print("\n📌 Available Endpoints:")
    print("   GET  /")
    print("   GET  /api/health")
    print("   POST /api/predict (with AI description)")
    print("   POST /api/batch-predict")
    print("="*60 + "\n")
    app.run(debug=True, host='0.0.0.0', port=5000)
