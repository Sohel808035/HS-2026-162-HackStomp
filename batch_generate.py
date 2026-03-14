import pandas as pd
import numpy as np
import os

def generate_profile(name, income_base, spend_range, upi_range, late_days_probs, filename):
    dates = pd.date_range("2025-01-01", "2025-12-31")
    
    # Randomly vary income a bit each month
    income_credit = np.where(dates.day == 1, income_base + np.random.randint(-2000, 5001, len(dates)), 0)
    
    spending = np.random.randint(spend_range[0], spend_range[1], len(dates))
    upi_txn_count = np.random.randint(upi_range[0], upi_range[1], len(dates))
    avg_txn_value = np.random.randint(100, 500, len(dates))
    bill_late_days = np.random.choice([0, 1, 2, 3, 4, 5], len(dates), p=np.array(late_days_probs)/sum(late_days_probs))
    
    df = pd.DataFrame({
        "date": dates,
        "username": name,
        "income_credit": income_credit,
        "spending": spending,
        "upi_txn_count": upi_txn_count,
        "avg_txn_value": avg_txn_value,
        "bill_due_paid_late_days": bill_late_days,
    })
    
    # Start balance with a month's salary
    df["balance"] = income_base + df["income_credit"].cumsum() - df["spending"].cumsum()
    # Ensure balance doesn't stay negative for too long in demo
    df["balance"] = df["balance"].apply(lambda x: max(x, -500)) 
    
    df.to_csv(filename, index=False)
    # Also copy to static for easy download
    static_path = os.path.join("static", filename)
    df.to_csv(static_path, index=False)
    return filename

profiles = [
    ("riya", 45000, (300, 1000), (5, 12), [0.8, 0.1, 0.05, 0.02, 0.02, 0.01]),      # High Trust
    ("pratiksha", 30000, (500, 1200), (2, 8), [0.6, 0.2, 0.1, 0.05, 0.03, 0.01]),   # Mid Trust
    ("sohel", 18000, (800, 1500), (1, 5), [0.3, 0.2, 0.2, 0.15, 0.1, 0.05]),       # Low Trust
    ("nityanand", 35000, (400, 1800), (4, 10), [0.7, 0.1, 0.1, 0.05, 0.03, 0.02])   # Variable
]

print("Generating batch CSV files...")
for p in profiles:
    fname = generate_profile(p[0], p[1], p[2], p[3], p[4], f"{p[0]}_financial_behaviour.csv")
    print(f"Generated: {fname}")
