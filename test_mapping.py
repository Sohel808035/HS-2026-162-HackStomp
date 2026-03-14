import pandas as pd
from model import feature_extraction
import joblib
import os

# 1. Load the generated CSV
df = pd.read_csv("daily_financial_behaviour.csv")
print("Input CSV Columns:", df.columns.tolist())

# 2. Extract features using the UPDATED logic
features = feature_extraction(df)
print("\nExtracted Features (Preview):")
print(features[['upi_tx_freq', 'bill_payment_delay', 'savings_ratio']].iloc[0])

# 3. Test if it can be passed to our model
if os.path.exists('model_data/trust_model.pkl'):
    model = joblib.load('model_data/trust_model.pkl')
    # Filter only the base 8 features the model expects
    base_features = ['upi_tx_freq', 'bill_payment_delay', 'salary_consistency', 
                   'savings_ratio', 'expense_volatility', 'night_risky_spending', 
                   'rent_payment_discipline', 'payee_diversity']
    model_input = features[base_features]
    score = model.predict(model_input)[0]
    print(f"\nFinal TrustScore: {score:.2f}")
else:
    print("\nModel file not found. Run model.py first to train.")
