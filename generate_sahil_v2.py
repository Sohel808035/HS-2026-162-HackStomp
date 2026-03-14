import pandas as pd
import numpy as np

dates = pd.date_range("2025-01-01","2025-12-31")

df = pd.DataFrame({
    "date":dates,
    "username":"sahil",
    "income_credit":np.where(dates.day==1,30000,0),
    "spending":np.random.randint(200,1500,len(dates)),
    "upi_txn_count":np.random.randint(1,10,len(dates)),
    "avg_txn_value":np.random.randint(120,300,len(dates)),
    "bill_due_paid_late_days":np.random.choice([0,0,0,1,2,3],len(dates)),
})

df["balance"] = 30000 + df["income_credit"].cumsum() - df["spending"].cumsum()

df.to_csv("daily_financial_behaviour.csv",index=False)
print("File 'daily_financial_behaviour.csv' generated successfully.")
