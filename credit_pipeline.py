import pandas as pd
import numpy as np
import os
import joblib
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
from sklearn.linear_model import LogisticRegression
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import accuracy_score, confusion_matrix, classification_report
import matplotlib.pyplot as plt

# ==========================================
# 0. DATA AUGMENTATION (Ensuring Training Density)
# ==========================================
def augment_data_if_needed(df, target_users=100):
    current_users = df['username'].nunique()
    if current_users >= target_users:
        return df
    
    print(f"Dataset has only {current_users} users. Augmenting to {target_users} for robust training...")
    augmented_list = [df]
    base_users = df['username'].unique()
    
    for i in range(target_users - current_users):
        template_user = np.random.choice(base_users)
        template_data = df[df['username'] == template_user].copy()
        
        # Add SIGNIFICANT variance
        multiplier = np.random.uniform(0.3, 3.0) 
        template_data['username'] = f"synth_user_{i}"
        template_data['income_credit'] *= multiplier
        template_data['spending'] *= np.random.uniform(0.5, 2.5)
        # Randomize late payments to ensure variety
        template_data['bill_due_paid_late_days'] = np.random.choice([0, 1, 3, 7], len(template_data), p=[0.75, 0.15, 0.07, 0.03])
        
        template_data['balance'] = 15000 + template_data['income_credit'].cumsum() - template_data['spending'].cumsum()
        augmented_list.append(template_data)
    
    return pd.concat(augmented_list, ignore_index=True)

# ==========================================
# 1. DATA LOADING & PREPROCESSING
# ==========================================
def load_and_preprocess(filepaths):
    print("Step 1: Data Loading & Preprocessing...")
    dataframes = []
    for f in filepaths:
        try:
            dataframes.append(pd.read_csv(f))
        except: continue
    df = pd.concat(dataframes, ignore_index=True)
    df['date'] = pd.to_datetime(df['date'])
    return df

# ==========================================
# 2. FEATURE ENGINEERING
# ==========================================
def engineer_features(df):
    print("Step 2: Feature Engineering...")
    user_groups = df.groupby('username')
    features_list = []
    for name, group in user_groups:
        total_inc = group['income_credit'].sum()
        total_exp = group['spending'].sum()
        user_feats = {
            'username': name,
            'total_income': total_inc,
            'avg_daily_spending': group['spending'].mean(),
            'txn_frequency': group['upi_txn_count'].mean(),
            'late_payment_rate': (group['bill_due_paid_late_days'] > 0).mean(),
            'balance_volatility': group['balance'].std(),
            'savings_ratio': (total_inc - total_exp) / total_inc if total_inc > 0 else -0.5,
            'avg_transaction_value': group['avg_txn_value'].mean()
        }
        features_list.append(user_feats)
    return pd.DataFrame(features_list)

# ==========================================
# 3. SYNTHETIC TARGET CREATION
# ==========================================
def create_targets(features_df):
    print("Step 3: Creating Synthetic Targets...")
    # Dynamic thresholds to force balance
    vol_median = features_df['balance_volatility'].median()
    savings_median = features_df['savings_ratio'].median()
    
    def check_eligibility(row):
        # A mix of factors for eligibility
        score = 0
        if row['savings_ratio'] > savings_median: score += 1
        if row['late_payment_rate'] < 0.2: score += 1
        if row['balance_volatility'] < vol_median: score += 1
        return 1 if score >= 2 else 0
    
    features_df['loan_eligible'] = features_df.apply(check_eligibility, axis=1)
    print(f"Target Distribution: {features_df['loan_eligible'].value_counts().to_dict()}")
    return features_df

# ==========================================
# 4. DATASET PREPARATION
# ==========================================
def prepare_dataset(features_df):
    print("Step 4: Dataset Preparation & Scaling...")
    # Drop username for training
    X = features_df.drop(['username', 'loan_eligible'], axis=1)
    y = features_df['loan_eligible']
    
    # Handle missing values (if any)
    X = X.fillna(X.mean())
    
    # Standardize features
    scaler = StandardScaler()
    X_scaled = scaler.fit_transform(X)
    X_scaled_df = pd.DataFrame(X_scaled, columns=X.columns)
    
    return X_scaled_df, y, scaler

# ==========================================
# 5. MODEL TRAINING
# ==========================================
def train_models(X, y):
    print("Step 5: Training Logistic Regression & Random Forest...")
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
    
    # Logistic Regression
    lr = LogisticRegression()
    lr.fit(X_train, y_train)
    
    # Random Forest
    rf = RandomForestClassifier(n_estimators=100, random_state=42)
    rf.fit(X_train, y_train)
    
    return lr, rf, X_test, y_test

# ==========================================
# 6. EVALUATION
# ==========================================
def evaluate_models(lr, rf, X_test, y_test):
    print("\nStep 6: Model Evaluation...")
    
    for name, model in [("Logistic Regression", lr), ("Random Forest", rf)]:
        y_pred = model.predict(X_test)
        print(f"\n--- {name} ---")
        print(f"Accuracy: {accuracy_score(y_test, y_pred):.4f}")
        print("Confusion Matrix:")
        print(confusion_matrix(y_test, y_pred))
        print("Classification Report:")
        print(classification_report(y_test, y_pred, zero_division=0))
        
    # Feature Importance (Random Forest)
    importances = rf.feature_importances_
    features = X_test.columns
    indices = np.argsort(importances)
    
    print("\nFeature Importance (Random Forest):")
    for i in range(len(features)):
        print(f"{features[i]}: {importances[i]:.4f}")

# ==========================================
# 7. PREDICTION FUNCTION
# ==========================================
def predict_user_eligibility(model, scaler, user_feature_vector):
    # Scale the input
    user_feature_scaled = scaler.transform([user_feature_vector])
    
    eligibility_class = model.predict(user_feature_scaled)[0]
    probability_score = model.predict_proba(user_feature_scaled)[0][1]
    
    return eligibility_class, probability_score

# ==========================================
# 8. MAIN EXECUTION & EXPORT
# ==========================================
if __name__ == "__main__":
    # Check for all generated behavioural CSVs
    csv_files = [f for f in os.listdir('.') if f.endswith('_financial_behaviour.csv') or f == 'daily_financial_behaviour.csv']
    
    if not csv_files:
        print("No CSV files found. Please generate experimental data first.")
    else:
        raw_df = load_and_preprocess(csv_files)
        
        # Step 0: Augmentation
        raw_df = augment_data_if_needed(raw_df, target_users=100)
        
        # Feature Engineering
        features_df = engineer_features(raw_df)
        
        # Target Creation
        labeled_df = create_targets(features_df)
        
        # Dataset Prep
        X, y, scaler = prepare_dataset(labeled_df)
        
        # Training
        lr_model, rf_model, X_test, y_test = train_models(X, y)
        
        # Evaluation
        evaluate_models(lr_model, rf_model, X_test, y_test)
        
        # EXPORT
        print("\nStep 8: Exporting Model...")
        
        # Save the augmented dataset for Dashboard Viewing
        labeled_df.to_csv('augmented_training_data.csv', index=False)
        print("Saved training dataset as 'augmented_training_data.csv'")
        
        pipeline_export = {
            'model': rf_model,
            'scaler': scaler,
            'feature_names': X.columns.tolist()
        }
        joblib.dump(pipeline_export, 'credit_trust_model.pkl')
        print("Saved as 'credit_trust_model.pkl'")
        
        # Demo Prediction
        print("\n--- Project Demo: Prediction ---")
        sample_user_idx = 0
        sample_user_name = labeled_df.iloc[sample_user_idx]['username']
        sample_vector = X.iloc[sample_user_idx].values
        
        elig, prob = predict_user_eligibility(rf_model, scaler, sample_vector)
        print(f"Sample User: {sample_user_name}")
        print(f"Predicted Class: {'Eligible' if elig == 1 else 'Not Eligible'}")
        print(f"Propensity Score: {prob*100:.2f}%")
