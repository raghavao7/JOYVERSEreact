import os
import torch
import torch.nn as nn
from flask import Flask, request, jsonify
from flask_cors import CORS
from transformers import GPT2LMHeadModel, GPT2Tokenizer, CLIPProcessor, CLIPModel
from PIL import Image
from io import BytesIO
from collections import Counter
import time
import threading
import queue

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": ["http://localhost:*", "http://127.0.0.1:*"]}})

UPLOAD_FOLDER = "uploads"
os.makedirs(UPLOAD_FOLDER, exist_ok=True)
app.config["UPLOAD_FOLDER"] = UPLOAD_FOLDER

# Add a request queue and worker thread
request_queue = queue.Queue(maxsize=10)  # Limit queue size to prevent memory issues
processing_lock = threading.Lock()
models_loaded = False
model_loading_lock = threading.Lock()

# DecisionTransformer Model with GPT-2
class DecisionTransformer(nn.Module):
    def __init__(self, model_name="gpt2", action_space=3):
        super(DecisionTransformer, self).__init__()
        self.tokenizer = GPT2Tokenizer.from_pretrained(model_name)
        self.tokenizer.pad_token = self.tokenizer.eos_token
        self.model = GPT2LMHeadModel.from_pretrained(model_name)
        self.device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
        self.model.to(self.device)
        self.action_space = action_space
        self.cache = {}  # Simple cache for previously processed inputs

    def forward(self, input_sequence):
        # Check cache first
        if input_sequence in self.cache:
            print(f"[DecisionTransformer] Cache hit for: {input_sequence}")
            return self.cache[input_sequence]
            
        print(f"[DecisionTransformer] Input Sequence in Forward: {input_sequence}")
        inputs = self.tokenizer(input_sequence, return_tensors="pt", truncation=True, padding=True, max_length=512)
        inputs = {key: val.to(self.device) for key, val in inputs.items()}
        
        try:
            outputs = self.model(**inputs)
            logits = outputs.logits
            action = torch.argmax(logits[:, -1, :], dim=-1)
            print(f"[DecisionTransformer] Predicted Action Tensor: {action}")
            
            # Cache the result
            self.cache[input_sequence] = action
            
            if len(self.cache) > 100:  # Limit cache size
                # Remove the oldest entry
                self.cache.pop(next(iter(self.cache)))
                
            return action
        except Exception as e:
            print(f"[DecisionTransformer] Error in forward pass: {str(e)}")
            # Return a default action (maintain difficulty) if model fails
            return torch.tensor([2]).to(self.device)

    def predict_action(self, emotional_state, previous_actions):
        input_sequence = f"Emotion: {emotional_state} | Previous actions: {previous_actions}"
        
        try:
            action = self.forward(input_sequence)
            action = action.item()
        except Exception as e:
            print(f"[DecisionTransformer] Error predicting action: {str(e)}")
            action = 2  # Default to maintain difficulty
            
        action_map = {0: "Reduce Difficulty", 1: "Increase Difficulty", 2: "Maintain Difficulty"}
        predicted_action = action_map.get(action, "Maintain Difficulty")
        print(f"[DecisionTransformer] Input Sequence: {input_sequence} | Predicted Action: {predicted_action}")
        return predicted_action

# Emotion Detection with CLIP
# Replace the EmotionDetection class in app.py with this improved version

class EmotionDetection:
    def __init__(self):
        self.model_name = "openai/clip-vit-base-patch32"
        print(f"[EmotionDetection] Loading CLIP model: {self.model_name}")
        self.processor = CLIPProcessor.from_pretrained(self.model_name)
        self.model = CLIPModel.from_pretrained(self.model_name)
        self.device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
        print(f"[EmotionDetection] Using device: {self.device}")
        self.model.to(self.device)
        self.emotions = ["happy", "sad", "angry", "surprised", "neutral", "confused", "bored"]
        
        # More distinctive emotion descriptions for better differentiation
        self.text_inputs = [
            "A close-up photo of a person with a wide smile, clearly happy and joyful",
            "A close-up photo of a person with downturned mouth and sad eyes, looking depressed",
            "A close-up photo of a person with furrowed brows and tight jaw, looking angry and frustrated",
            "A close-up photo of a person with raised eyebrows and wide open eyes, looking surprised",
            "A close-up photo of a person with relaxed facial features, looking calm and neutral",
            "A close-up photo of a person with a furrowed brow and tilted head, looking confused or perplexed",
            "A close-up photo of a person with droopy eyelids and blank expression, looking bored and disinterested"
        ]
        
        # Add more emotional states for better differentiation
        self.emotions_extra = ["focused", "excited", "tired", "anxious", "distracted"]
        self.text_inputs_extra = [
            "A close-up photo of a person concentrating with intense focus, staring attentively",
            "A close-up photo of a person looking excited and enthusiastic with bright eyes",
            "A close-up photo of a person with heavy eyelids and exhausted expression, looking tired",
            "A close-up photo of a person with tense expression and worried eyes, looking anxious",
            "A close-up photo of a person with wandering gaze, looking distracted and unfocused"
        ]
        
        # Combine all emotions and inputs
        self.all_emotions = self.emotions + self.emotions_extra
        self.all_text_inputs = self.text_inputs + self.text_inputs_extra
        
        # Debug identifiers to ensure each frame is processed uniquely
        self.frame_count = 0
        
        # Pre-encode text inputs
        self.text_features = self._encode_text_inputs()
        print("[EmotionDetection] Model initialized successfully")

    def _encode_text_inputs(self):
        # Pre-encode text inputs for faster inference
        print("[EmotionDetection] Pre-encoding text descriptions")
        text_inputs = self.processor(text=self.all_text_inputs, return_tensors="pt", padding=True)
        text_inputs = {key: val.to(self.device) for key, val in text_inputs.items()}
        with torch.no_grad():
            text_features = self.model.get_text_features(**text_inputs)
        print("[EmotionDetection] Text encoding complete")
        return text_features

    def detect_emotion(self, image):
        try:
            # Keep track of frame uniqueness
            self.frame_count += 1
            frame_id = f"frame_{self.frame_count}"
            
            # Apply preprocessing to enhance facial features
            # Convert to RGB if not already
            if image.mode != "RGB":
                image = image.convert("RGB")
            
            # Process image
            image_inputs = self.processor(images=image, return_tensors="pt")
            image_inputs = {key: val.to(self.device) for key, val in image_inputs.items()}
            
            with torch.no_grad():
                # Get image features
                image_features = self.model.get_image_features(**image_inputs)
                
                # Normalize features
                image_features = image_features / image_features.norm(dim=-1, keepdim=True)
                text_features = self.text_features / self.text_features.norm(dim=-1, keepdim=True)
                
                # Calculate similarity scores (dot product)
                similarity = (100.0 * image_features @ text_features.T).softmax(dim=-1)
                probs = similarity[0].cpu().numpy()
                
            # Map probabilities to all emotions (including extra ones)
            emotion_probs_full = dict(zip(self.all_emotions, probs))
            
            # Get original emotions subset for compatibility
            emotion_probs = {k: emotion_probs_full[k] for k in self.emotions}
            
            # Find top 3 emotions for better analysis
            top_emotions = sorted(emotion_probs_full.items(), key=lambda x: x[1], reverse=True)[:3]
            top_emotions_str = ', '.join([f"{e}:{p:.4f}" for e, p in top_emotions])
            
            # Get the dominant emotion
            predicted_class_idx = probs.argmax()
            dominant_emotion = self.all_emotions[predicted_class_idx]
            
            # Map back to original emotions if needed
            if dominant_emotion in self.emotions_extra:
                # Map the extra emotions to the closest core emotion
                mapping = {
                    "focused": "neutral",
                    "excited": "happy", 
                    "tired": "sad",
                    "anxious": "angry",
                    "distracted": "bored"
                }
                mapped_emotion = mapping.get(dominant_emotion, "neutral")
                print(f"[EmotionDetection] {frame_id}: Mapped extra emotion {dominant_emotion} to {mapped_emotion}")
                dominant_emotion = mapped_emotion
                
            print(f"[EmotionDetection] {frame_id}: Top emotions: {top_emotions_str} → {dominant_emotion}")
            return dominant_emotion, emotion_probs
        except Exception as e:
            print(f"[EmotionDetection] Error processing image: {str(e)}")
            return "neutral", {emotion: 0.0 for emotion in self.emotions}

def load_models():
    global emotion_detector, decision_transformer, models_loaded
    
    if models_loaded:
        return
    
    with model_loading_lock:
        if not models_loaded:
            print("[Backend] Loading models...")
            emotion_detector = EmotionDetection()
            decision_transformer = DecisionTransformer(action_space=3)
            models_loaded = True
            print("[Backend] Models loaded successfully")

def process_request(frames, previous_actions):
    # Ensure models are loaded
    if not models_loaded:
        load_models()
    
    try:
        global emotion_detector, decision_transformer
        
        # Convert frames to PIL images
        images = []
        for i, frame in enumerate(frames):
            try:
                img = Image.open(BytesIO(frame))
                # Print image information to debug
                print(f"[Backend] Frame {i}: Size {img.size}, Mode {img.mode}")
                images.append(img)
            except Exception as e:
                print(f"[Backend] Error opening image {i}: {str(e)}")
                continue
                
        if not images:
            return {"error": "No valid images found"}, 400
            
        # Detect emotions for all images
        detected_emotions_and_probs = []
        for i, image in enumerate(images):
            try:
                emotion_data = emotion_detector.detect_emotion(image)
                detected_emotions_and_probs.append(emotion_data)
                print(f"[Backend] Processed frame {i}: {emotion_data[0]}")
            except Exception as e:
                print(f"[Backend] Error detecting emotion in frame {i}: {str(e)}")
                continue
                
        if not detected_emotions_and_probs:
            return {"error": "Failed to detect emotions"}, 500
            
        # Extract emotions and probabilities
        detected_emotions = [item[0] for item in detected_emotions_and_probs]
        emotion_probs_list = [item[1] for item in detected_emotions_and_probs]
        
        # Average emotion probabilities across frames
        avg_emotion_probs = {
            emotion: sum(prob[emotion] for prob in emotion_probs_list) / len(emotion_probs_list)
            for emotion in emotion_detector.emotions
        }
        
        # Get the dominant emotion using majority vote with fallback to highest probability
        counter = Counter(detected_emotions)
        if len(counter) > 0:
            dominant_emotion = counter.most_common(1)[0][0]
        else:
            # Fallback to highest average probability
            dominant_emotion = max(avg_emotion_probs.items(), key=lambda x: x[1])[0]
        
        # Force clear the cache if getting the same emotion repeatedly
        if hasattr(decision_transformer, 'cache'):
            cache_key = f"Emotion: {dominant_emotion} | Previous actions: {previous_actions}"
            if cache_key in decision_transformer.cache:
                print(f"[Backend] Clearing cache entry for {cache_key}")
                decision_transformer.cache.pop(cache_key, None)
        
        # Predict action using DecisionTransformer
        predicted_action = decision_transformer.predict_action(dominant_emotion, previous_actions)
        
        print(f"[Backend] Processed request. Emotion: {dominant_emotion}, Action: {predicted_action}")
        
        return {
            "emotion": dominant_emotion,
            "emotion_probs": avg_emotion_probs,
            "action": predicted_action
        }, 200
    except Exception as e:
        print(f"[Backend] Error processing request: {str(e)}")
        return {"error": "Processing failed", "details": str(e)}, 500

@app.route("/analyze-frames", methods=["POST"])
def analyze_frames():
    print("[Backend] Received request to /analyze-frames")
    
    # Start model loading in background if not already loaded
    if not models_loaded:
        threading.Thread(target=load_models).start()
    
    # Parse request
    frames_data = []
    for i in range(4):
        frame = request.files.get(f"frame{i}")
        if frame:
            frames_data.append(frame.read())
        
    if not frames_data:
        print("[Backend] Missing frames")
        return jsonify({"error": "Missing frames"}), 400
        
    previous_actions = request.form.get("previous_actions", "neutral,question1")
    print(f"[Backend] Previous actions received: {previous_actions}")
    
    # Check if we're still loading models
    if not models_loaded:
        # Wait for models to load - add timeout
        wait_start = time.time()
        while not models_loaded and time.time() - wait_start < 30:  # 30 second timeout
            time.sleep(0.5)
            
        if not models_loaded:
            return jsonify({"error": "Models still loading, please try again"}), 503
    
    # Process the request with a timeout
    try:
        with processing_lock:  # Ensure only one request is processed at a time
            result, status_code = process_request(frames_data, previous_actions)
        return jsonify(result), status_code
    except Exception as e:
        print(f"[Backend] Unhandled exception: {str(e)}")
        return jsonify({"error": "Server error", "details": str(e)}), 500

if __name__ == "__main__":
    # Start model loading in background
    threading.Thread(target=load_models).start()
    print("[Backend] Starting Flask app in debug mode")
    app.run(debug=True, port=5000)
