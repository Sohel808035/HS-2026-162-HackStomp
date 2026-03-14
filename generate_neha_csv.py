import pandas as pd

data = {
    "name": ["Neha"],
    "username": ["neha_kapoor"],
    "monthly_income": [85000],
    "income_variance": [0.12],
    "upi_transaction_count": [145],
    "avg_transaction_value": [320],
    "late_bill_payment_days": [0],
    "savings_ratio": [0.38],
    "pending_payment_ratio": [0.02],
    "balance_volatility": [0.15],
    "essential_spending_ratio": [0.45]
}

df = pd.DataFrame(data)

df.to_csv("neha_financial_profile.csv", index=False)

print("Neha's CSV Created Successfully")
