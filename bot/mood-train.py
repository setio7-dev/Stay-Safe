import pandas as pd
import numpy as np
import re
import os
from sklearn.model_selection import train_test_split, cross_val_score
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.preprocessing import LabelEncoder
from sklearn.naive_bayes import MultinomialNB
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import accuracy_score, classification_report
import joblib
import warnings
warnings.filterwarnings('ignore')

def clean_text(text):
    text = str(text).lower()
    text = re.sub(r'[^a-zA-Z\s]', '', text)
    text = ' '.join(text.split())
    return text

print("Loading data...")
df = pd.read_csv("./emotion_final.csv")
df.columns = df.columns.str.strip()
print(f"\nDataset shape: {df.shape}")
print(f"Missing values:\n{df.isnull().sum()}")
df = df.dropna()
print("\nCleaning text...")
df['Text_Clean'] = df['Text'].apply(clean_text)
df = df[df['Text_Clean'].str.len() > 0]
print("\nEmotion distribution:")
print(df['Emotion'].value_counts())

X_train, X_test, y_train, y_test = train_test_split(
    df['Text_Clean'], 
    df['Emotion'],
    test_size=0.2,
    random_state=42,
    stratify=df['Emotion']
)

print(f"\nTrain size: {len(X_train)}, Test size: {len(X_test)}")

print("\nExtracting features with TF-IDF...")
vectorizer = TfidfVectorizer(
    max_features=3000,
    ngram_range=(1, 2),
    min_df=2,
    max_df=0.8,
    stop_words='english'
)

X_train_vec = vectorizer.fit_transform(X_train)
X_test_vec = vectorizer.transform(X_test)
label_encoder = LabelEncoder()
y_train_enc = label_encoder.fit_transform(y_train)
y_test_enc = label_encoder.transform(y_test)

print(f"Feature matrix shape: {X_train_vec.shape}")
print(f"Number of emotions: {len(label_encoder.classes_)}")

print("\n" + "="*50)
print("TRAINING MODELS (only those with predict_proba)")
print("="*50)

models = {
    'Naive Bayes': MultinomialNB(),
    'Logistic Regression': LogisticRegression(max_iter=1000, random_state=42)
}

results = {}

for name, model in models.items():
    print(f"\n{name}:")
    print("-" * 40)
    model.fit(X_train_vec, y_train_enc)
    y_train_pred = model.predict(X_train_vec)
    y_test_pred = model.predict(X_test_vec)
    train_acc = accuracy_score(y_train_enc, y_train_pred)
    test_acc = accuracy_score(y_test_enc, y_test_pred)
    print(f"Train Accuracy: {train_acc:.4f}")
    print(f"Test Accuracy:  {test_acc:.4f}")
    cv_scores = cross_val_score(model, X_train_vec, y_train_enc, cv=5)
    print(f"CV Accuracy:    {cv_scores.mean():.4f} (+/- {cv_scores.std():.4f})")
    results[name] = {
        'model': model,
        'train_acc': train_acc,
        'test_acc': test_acc,
        'cv_acc': cv_scores.mean()
    }

best_model_name = max(results, key=lambda x: results[x]['test_acc'])
best_model = results[best_model_name]['model']

print("\n" + "="*50)
print(f"BEST MODEL: {best_model_name}")
print("="*50)
print(f"Test Accuracy: {results[best_model_name]['test_acc']:.4f}")

y_test_pred = best_model.predict(X_test_vec)
print("\n" + "="*50)
print("CLASSIFICATION REPORT")
print("="*50)
print(classification_report(
    y_test_enc, 
    y_test_pred,
    target_names=label_encoder.classes_
))

print("\nSaving models to mood-training/ folder...")
os.makedirs('mood-training', exist_ok=True)
joblib.dump(best_model, 'mood-training/model.pkl')
joblib.dump(vectorizer, 'mood-training/vectorizer.pkl')
joblib.dump(label_encoder, 'mood-training/label_encoder.pkl')

with open('mood-training/model_info.txt', 'w') as f:
    f.write(f"Best Model: {best_model_name}\n")
    f.write(f"Test Accuracy: {results[best_model_name]['test_acc']:.4f}\n")
    f.write(f"Emotions: {', '.join(label_encoder.classes_)}\n")
    f.write(f"Number of features: {X_train_vec.shape[1]}\n")

print("\nModels saved successfully!")
print("Files created in mood-training/ folder:")
print("  - mood-training/model.pkl")
print("  - mood-training/vectorizer.pkl")
print("  - mood-training/label_encoder.pkl")
print("  - mood-training/model_info.txt")

def predict_emotion(text):
    text_clean = clean_text(text)
    text_vec = vectorizer.transform([text_clean])
    pred = best_model.predict(text_vec)
    emotion = label_encoder.inverse_transform(pred)[0]
    proba = best_model.predict_proba(text_vec)[0]
    confidence = proba.max()
    return emotion, confidence

print("\n" + "="*50)
print("TESTING PREDICTIONS")
print("="*50)

test_texts = [
    "I am so happy and excited about this!",
    "This makes me really angry and frustrated",
    "I'm scared and worried about what might happen",
    "This is so sad, I feel terrible",
    "I love this so much!",
    "I hate when this happens"
]

for text in test_texts:
    emotion, confidence = predict_emotion(text)
    print(f"\nText: {text}")
    print(f"Emotion: {emotion} (confidence: {confidence:.2%})")

print("\n" + "="*50)
print("DONE! You can now run your Flask API:")
print("  python mood-detection.py")
print("="*50)
