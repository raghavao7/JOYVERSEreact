# train_model.py
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import accuracy_score
import pickle
import os

# Number of facial landmarks (from MediaPipe Face Mesh)
NUM_LANDMARKS = 468
COORDS_PER_LANDMARK = 3
LANDMARK_DIM = NUM_LANDMARKS * COORDS_PER_LANDMARK

def generate_synthetic_landmarks(expression="neutral"):
    """Generates a synthetic landmark array for a given expression."""
    landmarks = np.random.rand(NUM_LANDMARKS, COORDS_PER_LANDMARK) * 0.5 + 0.25 # Center around 0.25-0.75

    if expression == "happy":
        # Example: Slightly widen mouth (landmarks around index 308, 78)
        mouth_width_scale = 1.1
        center_mouth_x = np.mean([landmarks[308, 0], landmarks[78, 0]])
        landmarks[308, 0] = (landmarks[308, 0] - center_mouth_x) * mouth_width_scale + center_mouth_x
        landmarks[78, 0] = (landmarks[78, 0] - center_mouth_x) * mouth_width_scale + center_mouth_x
        # Example: Slight upward curve of the mouth (y-coordinates)
        mouth_curve = 0.02
        landmarks[range(49, 60), 1] -= mouth_curve
        landmarks[range(175, 186), 1] -= mouth_curve
    elif expression == "sad":
        # Example: Slightly downturned mouth
        mouth_down_curve = 0.03
        landmarks[range(49, 60), 1] += mouth_down_curve
        landmarks[range(175, 186), 1] += mouth_down_curve
        # Example: Inner eyebrows slightly raised (landmarks around index 22, 23)
        eyebrow_lift = 0.02
        landmarks[22, 1] -= eyebrow_lift
        landmarks[23, 1] -= eyebrow_lift
    elif expression == "surprise":
        # Example: Widened eyes (landmarks around 159, 386)
        eye_open_scale = 1.05
        center_left_eye_y = np.mean([landmarks[159, 1], landmarks[145, 1]])
        landmarks[159, 1] = (landmarks[159, 1] - center_left_eye_y) * eye_open_scale + center_left_eye_y
        landmarks[145, 1] = (landmarks[145, 1] - center_left_eye_y) * eye_open_scale + center_left_eye_y
        center_right_eye_y = np.mean([landmarks[386, 1], landmarks[374, 1]])
        landmarks[386, 1] = (landmarks[386, 1] - center_right_eye_y) * eye_open_scale + center_right_eye_y
        landmarks[374, 1] = (landmarks[374, 1] - center_right_eye_y) * eye_open_scale + center_right_eye_y
        # Example: Slightly open mouth
        mouth_open = 0.01
        landmarks[range(61, 68), 1] += mouth_open
        landmarks[range(291, 298), 1] += mouth_open

    return landmarks.flatten().tolist()

class ExpressionModel:
    def __init__(self):
        self.model = LogisticRegression(random_state=42,max_iter=1000)

    def train(self, landmark_data, labels):
        X = np.array(landmark_data)
        y = np.array(labels)
        self.model.fit(X, y)

    def predict(self, landmark):
        landmark_array = np.array([landmark])
        prediction = self.model.predict(landmark_array)
        return prediction[0]

if __name__ == "__main__":
    # 1. Generate Structured Synthetic Data
    num_samples_per_expression = 50
    expressions = ["neutral", "happy", "sad", "surprise"]
    synthetic_landmark_data = []
    synthetic_labels = []

    for expression in expressions:
        for _ in range(num_samples_per_expression):
            synthetic_landmark_data.append(generate_synthetic_landmarks(expression))
            synthetic_labels.append(expression)

    # Split data
    X_train, X_test, y_train, y_test = train_test_split(synthetic_landmark_data, synthetic_labels, test_size=0.2, random_state=42)

    # 2. Initialize and Train the Model
    expression_model = ExpressionModel()
    expression_model.train(X_train, y_train)

    # 3. Save the Trained Model
    project_root = os.path.dirname(os.path.abspath(__file__))
    model_dir = os.path.join(os.path.dirname(project_root), 'models')
    os.makedirs(model_dir, exist_ok=True)
    model_path = os.path.join(model_dir, 'expression_model.pkl')

    with open(model_path, 'wb') as file:
        pickle.dump(expression_model, file)

    print(f"Trained model saved to: {model_path}")

    # --- Basic Evaluation on Synthetic Data ---
    y_pred = [expression_model.predict(landmark) for landmark in X_test]
    accuracy = accuracy_score(y_test, y_pred)
    print(f"\nAccuracy on Synthetic Test Data: {accuracy:.2f}")