
# 🎮 JOYVERSE – Emotion-Adaptive Learning Platform for Dyslexic Children


JOYVERSE is a full-stack, AI-powered platform designed to help **dyslexic children learn through games**, while **continuously analyzing their emotions** in real time.
The platform adapts question difficulty dynamically based on the child’s emotional state and provides **deep analytical insights** to doctors and therapists for better treatment and monitoring.

---

## 🚀 Key Achievements

* 🧠 Built a **custom emotion recognition AI model trained from scratch**
* 🎯 Designed an **emotion-adaptive game engine**
* 👩‍⚕️ Enabled **doctors & therapists to monitor multiple patients simultaneously**
* 📊 Implemented **visual analytics (graphs & pie charts)** for decision making

---

## 🧠 Problem Statement

Dyslexic children often face:

* Cognitive overload during learning
* Emotional stress while solving tasks
* Lack of real-time emotional monitoring by therapists

Traditional systems do **not adapt dynamically** to a child’s emotional state.

---

## 💡 Our Solution

JOYVERSE creates a **safe, adaptive, and intelligent learning environment** where:

* Children **play games instead of answering static questions**
* Their **emotions are continuously detected**
* **Question difficulty adapts automatically**
* Therapists receive **data-driven insights**

---

## 🏗️ System Architecture

### 🔹 Frontend

* Interactive **game-based learning interface**
* Emotion-adaptive question flow
* Real-time feedback to the child
* Graphs and pie charts for analysis

### 🔹 Backend

* REST APIs for:

  * Authentication & Authorization
  * Emotion processing
  * Session & analytics management
* Secure communication using **JWT**

### 🔹 AI / ML Engine

* **Custom-trained Transformer model** (not pre-trained)
* Emotion detection using **MediaPipe facial landmarks**
* Emotion inference without storing raw images (privacy-friendly)

---

## 🔐 Security

* Authentication & Authorization using **JSON Web Tokens (JWT)**
* Role-based access for:

  * Admins
  * Doctors / Therapists
  * System services

---

## 🤖 Emotion Detection Model

### Model Highlights

* **Custom Transformer Architecture**
* **Trained from scratch** using facial emotion datasets sourced from the internet
* Input features:

  * MediaPipe facial landmarks (468 × x, y, z)
* Output:

  * Emotion probabilities (happy, sad, fear, neutral, etc.)
* High accuracy with fast inference

⚠️ **No pre-trained DeepFace or external emotion APIs used**

---

## 🎯 Emotion-Adaptive Gameplay Logic

* If child shows:

  * 😟 Stress / sadness / frustration → **Question difficulty is reduced**
  * 😊 Happiness / confidence → **Difficulty gradually increases**
* This ensures:

  * No cognitive overload
  * Better engagement
  * Stress-free learning experience

---

## 📊 Analytics & Monitoring

Doctors and therapists can:

* View **emotion trends over time**
* Analyze:

  * Emotional stability
  * Stress patterns
  * Engagement levels
* Use **graphs and pie charts** to:

  * Track progress
  * Adjust therapy plans
  * Manage **multiple patients simultaneously**

---

## 🩺 Impact for Doctors & Therapists

* Saves time by automating emotional assessment
* Provides objective emotional data
* Enables remote monitoring
* Improves treatment quality with evidence-based insights

---

## 🛠️ Tech Stack

### Frontend

* React
* Chart libraries for analytics
* Game-based UI components

### Backend

* Node.js / Flask (API services)
* JWT Authentication
* REST APIs

### AI / ML

* Python
* PyTorch
* MediaPipe (Facial Landmarks)
* Custom Transformer model

---

## 🧪 Future Enhancements

* Real-time video emotion tracking
* Long-term emotional pattern prediction
* Doctor recommendation engine
* Multilingual game support
* Cloud deployment & scalability

---

## 👥 Team Effort

This project involved **significant effort, research, and engineering** across:

* Frontend development
* Backend architecture
* AI model training
* Data processing
* UX design for special-needs children

---

## 📜 License

This project is developed for educational, research, and healthcare innovation purposes.

---

## 🙌 Final Note

JOYVERSE is not just a project —
it is a **technology-driven step towards inclusive education and better mental healthcare for children**.


<img width="1418" height="1092" alt="joyverse" src="https://github.com/user-attachments/assets/98311792-c69b-4190-8b81-da5ffc5654eb" />

