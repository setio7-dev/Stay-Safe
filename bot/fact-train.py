import pandas as pd
import numpy as np
import pickle
import os
from sklearn.model_selection import train_test_split
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import classification_report, confusion_matrix, accuracy_score
import re

os.makedirs('fact-training', exist_ok=True)

print("Loading dataset...")
df = pd.read_csv('fact_detection.csv', delimiter=';')

print(f"Total data: {len(df)}")
print(f"Distribusi flag:\n{df['flag'].value_counts()}\n")

def preprocess_text(text):
    if pd.isna(text):
        return ""
    text = str(text).lower()
    text = re.sub(r'http\S+|www.\S+', '', text)
    text = re.sub(r'@\w+|#\w+', '', text)
    text = re.sub(r'[^a-z\s]', ' ', text)
    text = re.sub(r'\s+', ' ', text).strip()
    return text

print("Preprocessing text...")
df['combined_text'] = (
    df['blog_title'].fillna('') + ' ' + 
    df['post_text'].fillna('') + ' ' + 
    df['blog_conclusion'].fillna('')
)

df['processed_text'] = df['combined_text'].apply(preprocess_text)

df = df[df['processed_text'].str.len() > 10]
df = df[df['flag'].notna()]
df = df[df['flag'].str.strip() != '']

print(f"Data setelah preprocessing: {len(df)}")
print(f"Distribusi flag original:\n{df['flag'].value_counts()}\n")

hoax_labels = ['SALAH', 'PENIPUAN', 'SATIRE', 'SATIR', 'PARODI']
df['flag_binary'] = df['flag'].apply(lambda x: 'HOAX' if x in hoax_labels else 'FAKTA')

print(f"Distribusi flag binary:\n{df['flag_binary'].value_counts()}\n")

X = df['processed_text']
y = df['flag_binary']

X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42, stratify=y
)

print(f"\nTraining set: {len(X_train)}")
print(f"Testing set: {len(X_test)}")

print("\nCreating TF-IDF features...")
tfidf = TfidfVectorizer(
    max_features=5000,
    ngram_range=(1, 3),
    min_df=2,
    max_df=0.8
)

X_train_tfidf = tfidf.fit_transform(X_train)
X_test_tfidf = tfidf.transform(X_test)

print(f"TF-IDF features shape: {X_train_tfidf.shape}")

print("\nTraining Random Forest model...")
rf_model = RandomForestClassifier(
    n_estimators=200,
    max_depth=50,
    min_samples_split=5,
    min_samples_leaf=2,
    random_state=42,
    n_jobs=-1,
    class_weight='balanced'
)

rf_model.fit(X_train_tfidf, y_train)

print("\nEvaluating model...")
y_pred = rf_model.predict(X_test_tfidf)

accuracy = accuracy_score(y_test, y_pred)
print(f"\n{'='*50}")
print(f"ACCURACY: {accuracy:.4f} ({accuracy*100:.2f}%)")
print(f"{'='*50}\n")

print("Classification Report:")
print(classification_report(y_test, y_pred))

print("\nConfusion Matrix:")
print(confusion_matrix(y_test, y_pred))

print("\nSaving model...")
with open('fact-training/tfidf_vectorizer.pkl', 'wb') as f:
    pickle.dump(tfidf, f)

with open('fact-training/rf_model.pkl', 'wb') as f:
    pickle.dump(rf_model, f)

with open('fact-training/label_classes.pkl', 'wb') as f:
    pickle.dump(rf_model.classes_, f)

df_reference = df[['blog_title', 'post_text', 'blog_url', 'flag_binary']].copy()
with open('fact-training/reference_data.pkl', 'wb') as f:
    pickle.dump(df_reference, f)

print("\n✓ Model saved successfully!")
print("Files saved:")
print("  - fact-training/tfidf_vectorizer.pkl")
print("  - fact-training/rf_model.pkl")
print("  - fact-training/label_classes.pkl")
print("  - fact-training/reference_data.pkl")

print("\nTop 20 most important features:")
feature_names = tfidf.get_feature_names_out()
importances = rf_model.feature_importances_
indices = np.argsort(importances)[-20:]

for idx in reversed(indices):
    print(f"  {feature_names[idx]}: {importances[idx]:.4f}")
