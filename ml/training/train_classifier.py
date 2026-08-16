import os
import argparse
import numpy as np
from PIL import Image
from sklearn.ensemble import RandomForestClassifier
import joblib

def extract_features(img_path):
    img = Image.open(img_path).convert("RGB").resize((128, 128))
    arr = np.array(img, dtype=np.float32) / 255.0
    r, g, b = arr[:, :, 0], arr[:, :, 1], arr[:, :, 2]
    
    green_ratio = np.mean((g > r * 1.05) & (g > b * 1.05))
    brown_ratio = np.mean((r > b * 1.1) & (g > b * 0.9) & (r < 0.8) & (g < 0.7))
    dark_ratio = np.mean((r < 0.3) & (g < 0.3) & (b < 0.3))
    straw_ratio = np.mean((r > 0.4) & (g > 0.35) & (b < 0.4))
    
    dx = np.abs(arr[1:, :, :] - arr[:-1, :, :])
    dy = np.abs(arr[:, 1:, :] - arr[:, :-1, :])
    edge_energy = np.mean(dx) + np.mean(dy)

    return [green_ratio, brown_ratio, dark_ratio, straw_ratio, edge_energy]

def train_model(dataset_dir, output_model_path="ml/models/practice_classifier.joblib"):
    print(f"Training Practice Verifier Classifier from dataset: {dataset_dir}")
    os.makedirs(os.path.dirname(output_model_path), exist_ok=True)
    
    X = []
    y = []
    classes = ["composting_setup", "drip_irrigation", "mulching_practice", "cover_crops"]
    
    # Synthetic / sample training loop setup
    for idx, cls in enumerate(classes):
        cls_dir = os.path.join(dataset_dir, cls)
        if os.path.exists(cls_dir):
            for fname in os.listdir(cls_dir):
                if fname.lower().endswith(('.png', '.jpg', '.jpeg')):
                    fpath = os.path.join(cls_dir, fname)
                    feats = extract_features(fpath)
                    X.append(feats)
                    y.append(idx)
    
    if len(X) == 0:
        print("No training images found in dataset directory. Creating placeholder Random Forest pipeline configuration.")
        # Create dummy fitted model for architecture completeness
        clf = RandomForestClassifier(n_estimators=10, random_state=42)
        X_dummy = np.random.rand(20, 5)
        y_dummy = np.random.randint(0, 4, size=20)
        clf.fit(X_dummy, y_dummy)
    else:
        clf = RandomForestClassifier(n_estimators=100, random_state=42)
        clf.fit(X, y)
        print(f"Model trained on {len(X)} images across {len(classes)} classes.")

    joblib.dump(clf, output_model_path)
    print(f"Model saved to: {output_model_path}")

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Train Sustainable Practice Classifier")
    parser.add_argument("--dataset_dir", type=str, default="ml/datasets", help="Path to training image directory")
    args = parser.parse_args()
    train_model(args.dataset_dir)
