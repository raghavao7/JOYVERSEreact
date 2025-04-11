import sys
import os
import numpy as np
import torch
import torch.nn as nn
from flask import Flask, request, jsonify
from flask_cors import CORS

# 🔧 Add project root to Python path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

# 🐍 Debug print for working directory
print("[DEBUG] Current working directory:", os.getcwd())

# ✅ Import the EmotionTransformer class
from models.train import EmotionTransformer

# 🚀 Initialize Flask app
app = Flask(__name__)
CORS(app)

# 📦 Load the trained model
device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')
model = EmotionTransformer(
    input_dim=468 * 3,
    hidden_dim=256,
    n_layers=2,
    n_heads=8,
    dropout=0.1,
    n_classes=7
)

# 🛣 Get absolute path to model and label encoder
project_root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
model_path = os.path.join(project_root, 'models', 'emotion_model.pth')
encoder_path = os.path.join(project_root, 'backend', 'label_encoder.npy')

# ✅ Load model weights
try:
    model.load_state_dict(torch.load(model_path, map_location=device))
    model.eval()
    model.to(device)
    print(f"✅ Model loaded successfully from: {model_path}")
except Exception as e:
    print(f"❌ Error loading model: {e}")

# ✅ Load label encoder
try:
    label_encoder = np.load(encoder_path, allow_pickle=True)
    print(f"✅ Label encoder loaded successfully: {list(label_encoder)}")
except Exception as e:
    print(f"❌ Error loading label encoder: {e}")
    label_encoder = None

# 🔍 Emotion detection endpoint
@app.route('/detect_emotion', methods=['POST'])
def detect_emotion():
    data = request.get_json()
    landmarks = data.get('landmarks', [])

    print(f"📥 Received landmarks length: {len(landmarks)}")
    print(f"🔍 Sample landmarks: {landmarks[:10]}")

    if not landmarks or len(landmarks) != 468 * 3:
        return jsonify({'error': f'Invalid landmarks data: expected {468 * 3}, got {len(landmarks)}'}), 400

    try:
        features = np.array(landmarks, dtype=np.float32)
        features_tensor = torch.FloatTensor(features).unsqueeze(0).to(device)
    except Exception as e:
        print(f"🔥 Error converting landmarks to tensor: {e}")
        return jsonify({'error': 'Error processing landmarks data'}), 400

    try:
        with torch.no_grad():
            output = model(features_tensor)
            _, predicted = torch.max(output, 1)
            print(f"🎯 Model output: {output}")
            print(f"📊 Predicted index: {predicted.item()}")

            if label_encoder is not None:
                emotion = label_encoder[predicted.item()]
                print(f"😊 Predicted emotion: {emotion}")
                return jsonify({'emotion': emotion})
            else:
                return jsonify({'error': 'Label encoder not loaded'}), 500
    except Exception as e:
        print(f"🔥 Error during prediction: {e}")
        return jsonify({'error': 'Prediction failed'}), 500

# 🟢 Run server
if __name__ == '__main__':
    app.run(debug=True, port=5000)
