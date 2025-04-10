from flask import Flask, request, jsonify
from flask_cors import CORS
import numpy as np
import torch
import torch.nn as nn
from train import EmotionTransformer  # Ensure this module exists

app = Flask(__name__)
CORS(app)

# Load the trained model
device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')
model = EmotionTransformer(
    input_dim=468 * 3,  # 468 landmarks * 3 coordinates (x, y, z)
    hidden_dim=256,
    n_layers=2,
    n_heads=8,
    dropout=0.1,
    n_classes=7  # Matches 7 emotions: e.g., happy, sad, angry, etc.
)

try:
    # Use forward slashes or raw string to fix path issues
    model.load_state_dict(torch.load('backend/emotion_model.pth', map_location=device))
    model.eval()
    model.to(device)
    print("Model loaded successfully!")
except Exception as e:
    print(f"Error loading model: {e}")

try:
    # Load label encoder as a list/array, not dict
    label_encoder = np.load('backend/label_encoder.npy', allow_pickle=True)
    print(f"Label encoder loaded successfully! Classes: {list(label_encoder)}")
except Exception as e:
    print(f"Error loading label encoder: {e}")
    label_encoder = None

@app.route('/detect_emotion', methods=['POST'])  # Match the frontend endpoint
def predict_emotion():
    data = request.get_json()
    landmarks = data.get('landmarks', [])
    print(f"Received landmarks data length: {len(landmarks)}")
    print(f"Received landmarks data (first 10): {landmarks[:10]}")

    if not landmarks or len(landmarks) != 468 * 3:
        return jsonify({'error': f'Invalid landmarks data: expected {468*3}, got {len(landmarks)}'}), 400

    try:
        features = np.array(landmarks, dtype=np.float32)
        features_tensor = torch.FloatTensor(features).unsqueeze(0).to(device)
    except Exception as e:
        print(f"Error converting landmarks to tensor: {e}")
        return jsonify({'error': 'Error processing landmarks data'}), 400

    try:
        with torch.no_grad():
            output = model(features_tensor)
            print(f"Model output: {output}")
            _, predicted = torch.max(output, 1)
            print(f"Predicted index: {predicted.item()}")
            if label_encoder is not None:
                emotion = label_encoder[predicted.item()]  # Map index to emotion string
                print(f"Predicted emotion: {emotion}")
                return jsonify({'emotion': emotion})
            else:
                return jsonify({'error': 'Label encoder not loaded'}), 500
    except Exception as e:
        print(f"Error during prediction: {e}")
        return jsonify({'error': 'Prediction failed'}), 500

if __name__ == '__main__':
    app.run(debug=True, port=5000)  # Ensure it runs on port 5000