import pandas as pd
import numpy as np
import re
import os
import matplotlib.pyplot as plt
import seaborn as sns
from sklearn.model_selection import train_test_split, cross_val_score
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.preprocessing import LabelEncoder
from sklearn.naive_bayes import MultinomialNB
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import accuracy_score, classification_report, confusion_matrix
import joblib
import warnings
warnings.filterwarnings('ignore')

def clean_text(text):
    text = str(text).lower()
    text = re.sub(r'[^a-zA-Z\s]', '', text)
    text = ' '.join(text.split())
    return text

print("="*60)
print("LOADING DATA...")
print("="*60)
df = pd.read_csv("./emotion_final.csv")
df.columns = df.columns.str.strip()
print(f"\nDataset shape: {df.shape}")
print(f"Missing values:\n{df.isnull().sum()}")
df = df.dropna()

print("\n" + "="*60)
print("EMOTION DISTRIBUTION SEBELUM PENGURANGAN")
print("="*60)
print(df['Emotion'].value_counts())
print(df['Emotion'].value_counts(normalize=True).round(4))

print("\n" + "="*60)
print("MENGURANGI DATA 'HAPPY' & 'SADNESS' (50% sampling)...")
print("="*60)

# Separate happy, sadness, dan yang lain
happy_df = df[df['Emotion'].str.lower() == 'happy']
sadness_df = df[df['Emotion'].str.lower() == 'sadness']
other_df = df[~df['Emotion'].str.lower().isin(['happy', 'sadness'])]

print(f"\nJumlah 'happy' sebelum: {len(happy_df)}")
print(f"Jumlah 'sadness' sebelum: {len(sadness_df)}")
print(f"Jumlah emotion lainnya: {len(other_df)}")

# Kurangi happy dan sadness jadi 50%
happy_reduced = happy_df.sample(frac=0.5, random_state=42)
sadness_reduced = sadness_df.sample(frac=0.5, random_state=42)

print(f"\nJumlah 'happy' setelah dikurangi 50%: {len(happy_reduced)}")
print(f"Jumlah 'sadness' setelah dikurangi 50%: {len(sadness_reduced)}")

# Gabung semua
df = pd.concat([happy_reduced, sadness_reduced, other_df], ignore_index=True)
df = df.sample(frac=1, random_state=42).reset_index(drop=True)

print("\n" + "="*60)
print("EMOTION DISTRIBUTION SETELAH PENGURANGAN")
print("="*60)
print(df['Emotion'].value_counts())
print(df['Emotion'].value_counts(normalize=True).round(4))

print("\nCleaning text...")
df['Text_Clean'] = df['Text'].apply(clean_text)
df = df[df['Text_Clean'].str.len() > 0]

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
print(f"Emotions: {label_encoder.classes_}")

print("\n" + "="*60)
print("TRAINING MODELS (dengan class_weight='balanced')")
print("="*60)

models = {
    'Naive Bayes': MultinomialNB(),
    'Logistic Regression': LogisticRegression(
        max_iter=1000, 
        random_state=42,
        class_weight='balanced'
    )
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
        'cv_acc': cv_scores.mean(),
        'y_test_pred': y_test_pred
    }

best_model_name = max(results, key=lambda x: results[x]['test_acc'])
best_model = results[best_model_name]['model']

print("\n" + "="*60)
print(f"BEST MODEL: {best_model_name}")
print("="*60)
print(f"Test Accuracy: {results[best_model_name]['test_acc']:.4f}")

y_test_pred = best_model.predict(X_test_vec)
print("\n" + "="*60)
print("CLASSIFICATION REPORT")
print("="*60)
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
    f.write(f"Training notes: Happy & Sadness data reduced by 50%, class_weight='balanced' applied\n")

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

print("\n" + "="*60)
print("TESTING PREDICTIONS")
print("="*60)

test_texts = [
    "I am so happy and excited about this!",
    "This makes me really angry and frustrated",
    "I'm scared and worried about what might happen",
    "This is so sad, I feel terrible",
    "I love this so much!",
    "I hate when this happens",
    "aku sedih sekali",
    "saya sangat marah",
    "aku takut",
]

for text in test_texts:
    emotion, confidence = predict_emotion(text)
    print(f"\nText: {text}")
    print(f"Emotion: {emotion} (confidence: {confidence:.2%})")

os.makedirs('result', exist_ok=True)

sns.set_style("whitegrid")

fig = plt.figure(figsize=(16, 12))

ax1 = plt.subplot(2, 3, 1)
emotion_dist = df['Emotion'].value_counts()
colors_dist = plt.cm.Set3(np.linspace(0, 1, len(emotion_dist)))
ax1.bar(emotion_dist.index, emotion_dist.values, color=colors_dist, edgecolor='black', linewidth=1.5)
ax1.set_title('Emotion Distribution (After Reduction)', fontsize=12, fontweight='bold')
ax1.set_ylabel('Count', fontsize=10)
ax1.set_xlabel('Emotion', fontsize=10)
plt.setp(ax1.xaxis.get_majorticklabels(), rotation=45, ha='right')
for i, v in enumerate(emotion_dist.values):
    ax1.text(i, v + 5, str(v), ha='center', va='bottom', fontweight='bold', fontsize=9)

ax2 = plt.subplot(2, 3, 2)
sizes = [len(X_train), len(X_test)]
labels = [f'Training\n({len(X_train)})', f'Testing\n({len(X_test)})']
colors_pie = ['#FF9999', '#66B2FF']
ax2.pie(sizes, labels=labels, autopct='%1.1f%%', colors=colors_pie, startangle=90,
        textprops={'fontsize': 10, 'fontweight': 'bold'})
ax2.set_title('Train-Test Split', fontsize=12, fontweight='bold')

ax3 = plt.subplot(2, 3, 3)
cm = confusion_matrix(y_test_enc, y_test_pred)
sns.heatmap(cm, annot=True, fmt='d', cmap='YlOrRd', cbar=False,
            xticklabels=label_encoder.classes_, yticklabels=label_encoder.classes_,
            annot_kws={'fontsize': 10, 'fontweight': 'bold'}, ax=ax3)
ax3.set_title(f'Confusion Matrix ({best_model_name})', fontsize=12, fontweight='bold')
ax3.set_ylabel('Actual', fontsize=10)
ax3.set_xlabel('Predicted', fontsize=10)

ax4 = plt.subplot(2, 3, 4)
model_names = list(results.keys())
train_accs = [results[m]['train_acc'] for m in model_names]
test_accs = [results[m]['test_acc'] for m in model_names]
cv_accs = [results[m]['cv_acc'] for m in model_names]

x = np.arange(len(model_names))
width = 0.25
ax4.bar(x - width, train_accs, width, label='Train', color='#90EE90', edgecolor='black', linewidth=1.5)
ax4.bar(x, test_accs, width, label='Test', color='#FFB6C1', edgecolor='black', linewidth=1.5)
ax4.bar(x + width, cv_accs, width, label='CV', color='#87CEEB', edgecolor='black', linewidth=1.5)
ax4.set_ylabel('Accuracy', fontsize=10)
ax4.set_title('Model Comparison', fontsize=12, fontweight='bold')
ax4.set_xticks(x)
ax4.set_xticklabels(model_names, fontsize=9)
ax4.legend(fontsize=9)
ax4.set_ylim([0, 1.1])
for i, (tr, te, cv) in enumerate(zip(train_accs, test_accs, cv_accs)):
    ax4.text(i - width, tr + 0.02, f'{tr:.3f}', ha='center', va='bottom', fontsize=8, fontweight='bold')
    ax4.text(i, te + 0.02, f'{te:.3f}', ha='center', va='bottom', fontsize=8, fontweight='bold')
    ax4.text(i + width, cv + 0.02, f'{cv:.3f}', ha='center', va='bottom', fontsize=8, fontweight='bold')

ax5 = plt.subplot(2, 3, 5)
report_dict = classification_report(y_test_enc, y_test_pred, target_names=label_encoder.classes_, output_dict=True)
emotions = label_encoder.classes_
precision = [report_dict[e]['precision'] for e in emotions]
recall = [report_dict[e]['recall'] for e in emotions]
f1 = [report_dict[e]['f1-score'] for e in emotions]

x_pos = np.arange(len(emotions))
ax5.plot(x_pos, precision, marker='o', linewidth=2, markersize=8, label='Precision', color='#FF6B6B')
ax5.plot(x_pos, recall, marker='s', linewidth=2, markersize=8, label='Recall', color='#4ECDC4')
ax5.plot(x_pos, f1, marker='^', linewidth=2, markersize=8, label='F1-Score', color='#FFD93D')
ax5.set_ylabel('Score', fontsize=10)
ax5.set_xlabel('Emotion', fontsize=10)
ax5.set_title('Classification Metrics by Emotion', fontsize=12, fontweight='bold')
ax5.set_xticks(x_pos)
ax5.set_xticklabels(emotions, rotation=45, ha='right', fontsize=9)
ax5.legend(fontsize=9)
ax5.grid(True, alpha=0.3)
ax5.set_ylim([0, 1.1])

ax6 = plt.subplot(2, 3, 6)
ax6.axis('off')
summary_text = f"""
MODEL PERFORMANCE SUMMARY

Best Model: {best_model_name}
Test Accuracy: {results[best_model_name]['test_acc']:.4f} ({results[best_model_name]['test_acc']*100:.2f}%)

Dataset Statistics:
  Total Data: {len(df)}
  Training Data: {len(X_train)}
  Testing Data: {len(X_test)}
  Test Size: 20%

Emotion Classes: {', '.join(label_encoder.classes_)}

Optimization:
  Happy data reduced: 50%
  Sadness data reduced: 50%
  Class weight: balanced
  
TF-IDF Configuration:
  Max Features: 3000
  N-gram Range: (1, 2)
  Min DF: 2
  Max DF: 0.8
  Stop Words: English

Model Comparison:
  Naive Bayes - Test: {results['Naive Bayes']['test_acc']:.4f}
  Logistic Regression - Test: {results['Logistic Regression']['test_acc']:.4f}
"""
ax6.text(0.1, 0.9, summary_text, transform=ax6.transAxes, fontsize=9,
        verticalalignment='top', fontfamily='monospace',
        bbox=dict(boxstyle='round', facecolor='#F0F0F0', alpha=0.8))

plt.tight_layout()
plt.savefig('result/emotion_model_performance.jpg', dpi=300, bbox_inches='tight')
print("\n✓ Visualization saved: result/emotion_model_performance.jpg")
plt.close()

print("\n" + "="*60)
print("✅ TRAINING COMPLETE!")
print("="*60)
print("\nYou can now run your Flask API:")
print("  python mood-detection.py")
print("\nSekarang model sudah di-retrain dengan:")
print("  ✓ Happy data dikurangi 50%")
print("  ✓ Sadness data dikurangi 50%")
print("  ✓ class_weight='balanced' diterapkan")
print("  ✓ Semua file model sudah disimpan")
print("="*60)