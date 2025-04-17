import pandas as pd
import numpy as np
import torch
import torch.nn as nn
from torch.utils.data import Dataset, DataLoader
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import LabelEncoder
import os
import sys
import traceback
import json

print("Starting train.py...")

class EmotionTransformer(nn.Module):
    def __init__(self, input_dim, hidden_dim, n_layers, n_heads, dropout, n_classes):  # Corrected __init__
        super().__init__()  # Corrected initialization
        self.input_proj = nn.Linear(input_dim, hidden_dim)
        encoder_layer = nn.TransformerEncoderLayer(
            d_model=hidden_dim,
            nhead=n_heads,
            dim_feedforward=hidden_dim * 4,
            dropout=dropout,
            batch_first=True
        )
        self.transformer = nn.TransformerEncoder(encoder_layer, num_layers=n_layers)
        self.fc = nn.Linear(hidden_dim, n_classes)
        self.dropout = nn.Dropout(dropout)

    def forward(self, x):
        x = self.input_proj(x)
        x = x.unsqueeze(1)
        x = self.transformer(x)
        x = x.squeeze(1)
        x = self.dropout(x)
        x = self.fc(x)
        return x

class EmotionDataset(Dataset):
    def __init__(self, features, labels, augment=False):  # Corrected __init__
        self.features = torch.FloatTensor(features)
        self.labels = torch.LongTensor(labels)
        self.augment = augment

    def __len__(self):  # Corrected __len__
        return len(self.labels)

    def __getitem__(self, idx):  # Corrected __getitem__
        features = self.features[idx]
        if self.augment:
            noise = torch.normal(0, 0.01, features.shape)
            features = features + noise
        return features, self.labels[idx]

def load_data(file_path):
    print(f"Loading dataset from: {file_path}")
    try:
        df = pd.read_excel(file_path)
        print(f"Raw dataset shape: {df.shape}")
        
        # Remove rows with NaN or 'nan' (as string) in Expression
        df = df.dropna(subset=['Expression'])
        df = df[df['Expression'].astype(str).str.lower() != 'nan']
        print(f"Shape after removing invalid labels: {df.shape}")
        
        # Validate emotions to ensure only expected classes
        valid_emotions = ['Angry', 'Disgust', 'Fear', 'Happy', 'Neutral', 'Sad']
        df = df[df['Expression'].isin(valid_emotions)]
        if df.empty:
            raise ValueError("No valid emotions found in dataset after filtering.")
        print(f"Shape after filtering valid emotions: {df.shape}")
        
        # Check for nan/infinite in features
        feature_cols = [col for col in df.columns if col not in ['Expression', 'FileName']]
        features = df[feature_cols].values
        if np.any(np.isnan(features)) or np.any(np.isinf(features)):
            print("Warning: Found nan or infinite values in features. Imputing with zeros...")
            features = np.nan_to_num(features, nan=0.0, posinf=0.0, neginf=0.0)
        
        # Normalize features
        mean = features.mean(axis=0)
        std = features.std(axis=0) + 1e-8
        features = (features - mean) / std
        
        label_encoder = LabelEncoder()
        labels = label_encoder.fit_transform(df['Expression'])
        
        print(f"Unique emotions: {df['Expression'].unique()}")
        print(f"Label mapping: {dict(zip(label_encoder.classes_, range(len(label_encoder.classes_))))}")
        print(f"Feature columns count: {len(feature_cols)}")
        
        return features, labels, label_encoder, mean, std
    except Exception as e:
        print(f"Error in load_data: {e}")
        traceback.print_exc()
        sys.exit(1)

def train_model():
    print("Entering train_model...")
    # Hyperparameters
    input_dim = 468 * 3
    hidden_dim = 128  # Matches app.py
    n_layers = 1      # Matches app.py
    n_heads = 8
    dropout = 0.3
    batch_size = 32
    epochs = 50
    learning_rate = 0.0001

    # Load data
    dataset_path = 'JoyVerseDataSet_Filled.xlsx'
    print(f"Resolved dataset path: {os.path.abspath(dataset_path)}")
    features, labels, label_encoder, mean, std = load_data(dataset_path)

    n_classes = len(label_encoder.classes_)
    print(f"Number of classes: {n_classes}")
    if n_classes != 6:
        print(f"Warning: Expected 6 classes, got {n_classes}. Check dataset labels.")

    # Save mean, std, and hyperparameters
    np.save('mean.npy', mean)
    np.save('std.npy', std)
    hyperparams = {
        'input_dim': input_dim,
        'hidden_dim': hidden_dim,
        'n_layers': n_layers,
        'n_heads': n_heads,
        'dropout': dropout,
        'n_classes': n_classes
    }
    with open('model_hyperparams.json', 'w') as f:
        json.dump(hyperparams, f)
    print("Saved hyperparameters to model_hyperparams.json")

    # Split data
    print("Splitting data...")
    X_train, X_test, y_train, y_test = train_test_split(
        features, labels, test_size=0.2, random_state=42
    )

    # Create datasets with augmentation
    print("Creating datasets...")
    train_dataset = EmotionDataset(X_train, y_train, augment=True)
    test_dataset = EmotionDataset(X_test, y_test, augment=False)
    train_loader = DataLoader(train_dataset, batch_size=batch_size, shuffle=True)
    test_loader = DataLoader(test_dataset, batch_size=batch_size)

    # Initialize model
    print("Initializing model...")
    device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')
    print(f"Using device: {device}")
    model = EmotionTransformer(
        input_dim=input_dim,
        hidden_dim=hidden_dim,
        n_layers=n_layers,
        n_heads=n_heads,
        dropout=dropout,
        n_classes=n_classes
    ).to(device)

    # Training setup
    print("Setting up optimizer and loss...")
    criterion = nn.CrossEntropyLoss()
    optimizer = torch.optim.Adam(model.parameters(), lr=learning_rate, weight_decay=1e-4)

    # Training loop
    print("Starting training loop...")
    best_acc = 0
    for epoch in range(epochs):
        model.train()
        total_loss = 0
        for batch_features, batch_labels in train_loader:
            batch_features = batch_features.to(device)
            batch_labels = batch_labels.to(device)
            optimizer.zero_grad()
            outputs = model(batch_features)
            loss = criterion(outputs, batch_labels)
            if torch.isnan(loss):
                print(f"Warning: NaN loss at epoch {epoch+1}. Stopping training.")
                return
            loss.backward()
            torch.nn.utils.clip_grad_norm_(model.parameters(), max_norm=1.0)
            optimizer.step()
            total_loss += loss.item()

        # Validation
        model.eval()
        correct = 0
        total = 0
        with torch.no_grad():
            for batch_features, batch_labels in test_loader:
                batch_features = batch_features.to(device)
                batch_labels = batch_labels.to(device)
                outputs = model(batch_features)
                _, predicted = torch.max(outputs.data, 1)
                total += batch_labels.size(0)
                correct += (predicted == batch_labels).sum().item()
        acc = 100 * correct / total
        print(f'Epoch {epoch+1}/{epochs}, Loss: {total_loss/len(train_loader):.4f}, Accuracy: {acc:.2f}%')

        # Save best model
        if acc > best_acc:
            best_acc = acc
            torch.save(model.state_dict(), 'emotion_model.pth')
            print("Saved best model to emotion_model.pth")

    # Save label encoder
    print("Saving label encoder...")
    np.save('label_encoder.npy', label_encoder.classes_)

if __name__ == '__main__':
    try:
        print("Executing main block...")
        train_model()
    except Exception as e:
        print(f"Error in main: {e}")
        traceback.print_exc()
        sys.exit(1)
