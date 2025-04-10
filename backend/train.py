import pandas as pd
import numpy as np
import torch
import torch.nn as nn
from torch.utils.data import Dataset, DataLoader
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import LabelEncoder
import os  # Added for directory handling

class EmotionTransformer(nn.Module):
    def __init__(self, input_dim, hidden_dim, n_layers, n_heads, dropout, n_classes):
        super().__init__()
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
    def __init__(self, features, labels):
        self.features = torch.FloatTensor(features)
        self.labels = torch.LongTensor(labels)

    def __len__(self):
        return len(self.labels)

    def __getitem__(self, idx):
        return self.features[idx], self.labels[idx]

def load_data(file_path):
    df = pd.read_excel(file_path)

    # Debug: Print unique emotions
    unique_emotions = df['Expression'].unique()
    print(f"Unique emotions found: {unique_emotions}")
    print(f"Number of unique emotions: {len(unique_emotions)}")

    label_encoder = LabelEncoder()
    labels = label_encoder.fit_transform(df['Expression'])

    # Debug: Print label mapping
    print(f"Label mapping: {dict(zip(label_encoder.classes_, range(len(label_encoder.classes_))))}")
    print(f"Encoded labels range: {labels.min()} to {labels.max()}")

    feature_cols = [col for col in df.columns if col not in ['Expression', 'FileName']]
    features = df[feature_cols].values

    return features, labels, label_encoder

def train_model():
    # Hyperparameters
    input_dim = 468 * 3  # 468 landmarks with x, y, z coordinates
    hidden_dim = 256
    n_layers = 2
    n_heads = 8
    dropout = 0.1
    batch_size = 32
    epochs = 50
    learning_rate = 0.001

    # Load data
    features, labels, label_encoder = load_data('backend\JoyVerseDataSet_Filled.xlsx')

    # Verify number of classes
    n_classes = len(label_encoder.classes_)
    print(f"Number of classes for model: {n_classes}")

    # Split data
    X_train, X_test, y_train, y_test = train_test_split(
        features, labels, test_size=0.2, random_state=42
    )

    # Create datasets and dataloaders
    train_dataset = EmotionDataset(X_train, y_train)
    test_dataset = EmotionDataset(X_test, y_test)
    train_loader = DataLoader(train_dataset, batch_size=batch_size, shuffle=True)
    test_loader = DataLoader(test_dataset, batch_size=batch_size)

    # Initialize model
    device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')
    model = EmotionTransformer(
        input_dim=input_dim,
        hidden_dim=hidden_dim,
        n_layers=n_layers,
        n_heads=n_heads,
        dropout=dropout,
        n_classes=n_classes
    ).to(device)

    # Training setup
    criterion = nn.CrossEntropyLoss()
    optimizer = torch.optim.Adam(model.parameters(), lr=learning_rate)

    # Ensure backend directory exists
    os.makedirs('backend', exist_ok=True)

    # Training loop
    for epoch in range(epochs):
        model.train()
        total_loss = 0
        for batch_features, batch_labels in train_loader:
            batch_features = batch_features.to(device)
            batch_labels = batch_labels.to(device)

            optimizer.zero_grad()
            outputs = model(batch_features)
            loss = criterion(outputs, batch_labels)
            loss.backward()
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

        print(f'Epoch {epoch+1}/{epochs}, Loss: {total_loss/len(train_loader):.4f}, '
              f'Accuracy: {100 * correct/total:.2f}%')

    # Save the model and label encoder in the backend directory
    torch.save(model.state_dict(), 'backend/emotion_model.pth')
    np.save('backend/label_encoder.npy', label_encoder.classes_)

if __name__ == '__main__':
    train_model()