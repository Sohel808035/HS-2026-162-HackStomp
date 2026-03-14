import pandas as pd

data = {
    "name": ["Sahil"],
    "username": ["sahil_shaikh"],
    "monthly_income": [45000],
    "income_variance": [0.28],
    "upi_transaction_count": [62],
    "avg_transaction_value": [540],
    "late_bill_payment_days": [3],
    "savings_ratio": [0.22],
    "pending_payment_ratio": [0.08],
    "balance_volatility": [0.31],
    "essential_spending_ratio": [0.64]
}

df = pd.DataFrame(data)

df.to_csv("financial_profile.csv", index=False)

print("CSV Created Successfully")
