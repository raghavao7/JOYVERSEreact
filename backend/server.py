import sys
import os
import pickle
import numpy as np
from flask import Flask, request, jsonify
from flask_cors import CORS

# 🔧 Add the parent directory (JOYVERSE_REACT/) to Python path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

# 🐍 Debug print for working directory
print("[DEBUG] Current working directory:", os.getcwd())

# ✅ Import the ExpressionModel class
from models.train import ExpressionModel

# 🚀 Initialize Flask app
app = Flask(__name__)
CORS(app)

# 📦 Load the trained expression model
project_root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
model_path = os.path.join(project_root, 'models', 'expression_model.pkl')
loaded_model = None

try:
    with open(model_path, 'rb') as file:
        loaded_model = pickle.load(file)
    print(f"✅ Model loaded successfully from: {model_path}")
except FileNotFoundError:
    print(f"❌ Error: Model file not found at: {model_path}")
except Exception as e:
    print(f"❌ Error loading model: {e}")

# 🔍 Emotion detection endpoint
@app.route('/detect_emotion', methods=['POST'])
def detect_emotion():
    if loaded_model is None:
        return jsonify({'error': 'Model not loaded'}), 500

    try:
        data = request.get_json()
        landmarks = data.get('landmarks')

        if not landmarks:
            print("⚠️ No landmarks data received")
            return jsonify({'error': 'No landmarks data received'}), 400

        print(f"📥 Received landmarks (sample): {landmarks[:3]}... total length: {len(landmarks)}")

        # Convert to numpy
        landmarks_np = np.array(landmarks)
        print(f"🔍 landmarks_np.shape before flattening: {landmarks_np.shape}")

        # Flatten only if needed
        if landmarks_np.ndim > 1:
            landmarks_np = landmarks_np.flatten()
            print(f"📉 Flattened landmarks_np.shape: {landmarks_np.shape}")

        # Reshape for prediction
        processed_landmarks = landmarks_np.reshape(1, -1)
        print(f"📐 Shape for prediction: {processed_landmarks.shape}")

        prediction = loaded_model.predict(processed_landmarks)
        print(f"🎯 Predicted emotion: {prediction[0]}")
        return jsonify({'emotion': prediction[0]})

    except Exception as e:
        print(f"🔥 Error occurred during prediction: {e}")
        return jsonify({'error': str(e)}), 500


# 🟢 Run server
if __name__ == '__main__':
    app.run(debug=True, port=5000)
