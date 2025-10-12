import pandas as pd
import numpy as np
import pickle
import os
import matplotlib.pyplot as plt
import seaborn as sns
from sklearn.model_selection import train_test_split
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import classification_report, confusion_matrix, accuracy_score
import re

os.makedirs('fact-training', exist_ok=True)
os.makedirs('result', exist_ok=True)

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
cm = confusion_matrix(y_test, y_pred)
print(cm)

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

top_features = []
top_importances = []
for idx in reversed(indices):
    print(f"  {feature_names[idx]}: {importances[idx]:.4f}")
    top_features.append(feature_names[idx])
    top_importances.append(importances[idx])

sns.set_style("whitegrid")

fig = plt.figure(figsize=(16, 12))

ax1 = plt.subplot(2, 3, 1)
class_dist = df['flag_binary'].value_counts()
colors = ['#FF6B6B', '#4ECDC4']
ax1.bar(class_dist.index, class_dist.values, color=colors, edgecolor='black', linewidth=1.5)
ax1.set_title('Data Distribution', fontsize=12, fontweight='bold')
ax1.set_ylabel('Count', fontsize=10)
for i, v in enumerate(class_dist.values):
    ax1.text(i, v + 5, str(v), ha='center', va='bottom', fontweight='bold')

ax2 = plt.subplot(2, 3, 2)
sizes = [len(X_train), len(X_test)]
labels = [f'Training\n({len(X_train)})', f'Testing\n({len(X_test)})']
colors_pie = ['#95E1D3', '#F38181']
ax2.pie(sizes, labels=labels, autopct='%1.1f%%', colors=colors_pie, startangle=90, 
        textprops={'fontsize': 10, 'fontweight': 'bold'})
ax2.set_title('Train-Test Split', fontsize=12, fontweight='bold')

ax3 = plt.subplot(2, 3, 3)
cm_display = cm
sns.heatmap(cm_display, annot=True, fmt='d', cmap='Blues', cbar=False, 
            xticklabels=rf_model.classes_, yticklabels=rf_model.classes_,
            annot_kws={'fontsize': 11, 'fontweight': 'bold'}, ax=ax3)
ax3.set_title('Confusion Matrix', fontsize=12, fontweight='bold')
ax3.set_ylabel('Actual', fontsize=10)
ax3.set_xlabel('Predicted', fontsize=10)

ax4 = plt.subplot(2, 3, 4)
report = classification_report(y_test, y_pred, output_dict=True)
metrics_labels = ['Precision', 'Recall', 'F1-Score']
hoax_metrics = [report['HOAX']['precision'], report['HOAX']['recall'], report['HOAX']['f1-score']]
fakta_metrics = [report['FAKTA']['precision'], report['FAKTA']['recall'], report['FAKTA']['f1-score']]

x = np.arange(len(metrics_labels))
width = 0.35
ax4.bar(x - width/2, hoax_metrics, width, label='HOAX', color='#FF6B6B', edgecolor='black', linewidth=1.5)
ax4.bar(x + width/2, fakta_metrics, width, label='FAKTA', color='#4ECDC4', edgecolor='black', linewidth=1.5)
ax4.set_ylabel('Score', fontsize=10)
ax4.set_title('Classification Metrics', fontsize=12, fontweight='bold')
ax4.set_xticks(x)
ax4.set_xticklabels(metrics_labels, fontsize=9)
ax4.legend(fontsize=9)
ax4.set_ylim([0, 1.1])
for i, v in enumerate(hoax_metrics):
    ax4.text(i - width/2, v + 0.02, f'{v:.3f}', ha='center', va='bottom', fontsize=8, fontweight='bold')
for i, v in enumerate(fakta_metrics):
    ax4.text(i + width/2, v + 0.02, f'{v:.3f}', ha='center', va='bottom', fontsize=8, fontweight='bold')

ax5 = plt.subplot(2, 3, 5)
ax5.barh(top_features, top_importances, color='#A8E6CF', edgecolor='black', linewidth=1.5)
ax5.set_xlabel('Importance', fontsize=10)
ax5.set_title('Top 20 Important Features', fontsize=12, fontweight='bold')
ax5.invert_yaxis()
for i, v in enumerate(top_importances):
    ax5.text(v + 0.0005, i, f'{v:.4f}', va='center', fontsize=8, fontweight='bold')

ax6 = plt.subplot(2, 3, 6)
ax6.axis('off')
summary_text = f"""
MODEL PERFORMANCE SUMMARY

Overall Accuracy: {accuracy:.4f} ({accuracy*100:.2f}%)

Dataset Statistics:
  Total Data: {len(df)}
  Training Data: {len(X_train)}
  Testing Data: {len(X_test)}
  Test Size: 20%

Data Distribution:
  HOAX: {class_dist.get('HOAX', 0)}
  FAKTA: {class_dist.get('FAKTA', 0)}

TF-IDF Configuration:
  Max Features: 5000
  N-gram Range: (1, 3)
  Min DF: 2
  Max DF: 0.8

Random Forest Configuration:
  N Estimators: 200
  Max Depth: 50
  Min Samples Split: 5
  Min Samples Leaf: 2
"""
ax6.text(0.1, 0.9, summary_text, transform=ax6.transAxes, fontsize=10,
        verticalalignment='top', fontfamily='monospace',
        bbox=dict(boxstyle='round', facecolor='wheat', alpha=0.5))

plt.tight_layout()
plt.savefig('result/fact_model_performance.jpg', dpi=300, bbox_inches='tight')
print("\n✓ Visualization saved: result/fact_model_performance.jpg")
plt.close()

print("\nAll process completed!")