import pandas as pd
import numpy as np
from sklearn.ensemble import RandomForestRegressor, VotingRegressor
from xgboost import XGBRegressor
from sklearn.model_selection import train_test_split
from sklearn.metrics import r2_score
import joblib
import os
import re

def generate_indian_synthetic_data(n_samples=3000):
    np.random.seed(42)
    # Generate 1000+ synthetic Indian transaction data
    
    # 1. upi_tx_freq (tx/day) [0.1 to 10]
    upi_tx_freq = np.random.lognormal(mean=0.5, sigma=0.8, size=n_samples)
    upi_tx_freq = np.clip(upi_tx_freq, 0.1, 10)
    
    # 2. bill_payment_delay (% late) [0 to 1]
    bill_payment_delay = np.random.beta(a=1, b=5, size=n_samples)
    
    # 3. salary_consistency (monthly pattern) [0 to 1]
    salary_consistency = np.random.beta(a=6, b=2, size=n_samples)
    
    # 4. savings_ratio (income-expense/credits) [-0.5 to 0.8]
    savings_ratio = np.random.normal(loc=0.2, scale=0.3, size=n_samples)
    savings_ratio = np.clip(savings_ratio, -0.5, 0.8)
    
    # 5. expense_volatility (std/mean amount) [0.1 to 3.0]
    expense_volatility = np.random.uniform(0.1, 3.0, n_samples)
    
    # 6. night_risky_spending (02:00-05:00 shopping) [0 to 10 tx]
    night_risky_spending = np.random.poisson(lam=0.5, size=n_samples)
    
    # 7. rent_payment_discipline (% on-time) [0 to 1]
    rent_payment_discipline = np.random.beta(a=7, b=2, size=n_samples)
    
    # 8. payee_diversity (unique vendors / total tx) [0.1 to 0.9]
    payee_diversity = np.random.uniform(0.1, 0.9, n_samples)
    
    # Calculate synthetic target (Trust Score 0-100)
    # Base starts at 40
    score = 40.0
    score += (upi_tx_freq * 1.5)             # Highly active UPI usage
    score -= (bill_payment_delay * 25)       # Penalize late bills
    score += (salary_consistency * 15)       # Reward steady income
    score += (savings_ratio * 30)            # Reward positive savings ratio (up to ~24 pts)
    score -= (expense_volatility * 5)        # Penalize volatile spenders
    score -= (night_risky_spending * 3)      # Red flag behavior
    score += (rent_payment_discipline * 20)  # On-time rent is strong trust marker
    score += (payee_diversity * 10)          # Broad market interaction footprint
    
    # Add noise & clip target
    score += np.random.normal(0, 4, n_samples)
    score = np.clip(score, 0, 100)
    
    df = pd.DataFrame({
        'upi_tx_freq': upi_tx_freq,
        'bill_payment_delay': bill_payment_delay,
        'salary_consistency': salary_consistency,
        'savings_ratio': savings_ratio,
        'expense_volatility': expense_volatility,
        'night_risky_spending': night_risky_spending,
        'rent_payment_discipline': rent_payment_discipline,
        'payee_diversity': payee_diversity,
        'trust_score': score
    })
    
    return df

def train_model():
    print("Generating Indian synthetic financial data (8 factors)...")
    df = generate_indian_synthetic_data(3000)
    
    X = df.drop('trust_score', axis=1)
    y = df['trust_score']
    
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
    
    print("Training RandomForest + XGBoost ensemble...")
    rf = RandomForestRegressor(n_estimators=100, max_depth=8, random_state=42)
    xgb = XGBRegressor(n_estimators=100, learning_rate=0.1, max_depth=5, random_state=42)
    
    model = VotingRegressor(estimators=[('rf', rf), ('xgb', xgb)])
    model.fit(X_train, y_train)
    
    y_pred = model.predict(X_test)
    score = r2_score(y_test, y_pred)
    print(f"Ensemble Model Accuracy (R^2 Score): {score:.4f}")
    assert score > 0.80, f"Model accuracy too low ({score:.4f}), check feature distribution!"
    
    os.makedirs('model_data', exist_ok=True)
    joblib.dump(model, 'model_data/trust_model.pkl')
    joblib.dump(X_train, 'model_data/x_train.pkl')
    print("Trust Model saved successfully.")

def feature_extraction(df):
    """
    Extract AI features from any CSV upload.
    Maps exactly to the 8 required factors.
    """
    df.columns = [str(c).lower().strip() for c in df.columns]
    
    # --- DIRECT MAPPING FOR PRE-SUMMARIZED DATA ---
    # Check if the user has provided columns as direct indicators
    direct_mapping = {}
    
    # 1. UPI Mapping
    upi_col = next((c for c in df.columns if 'upi_txn_count' in c or 'upi_transaction_count' in c), None)
    if upi_col: direct_mapping['upi_tx_freq'] = df[upi_col].mean() # Use mean as representative if daily rows
    
    # 2. Bill Delay Mapping
    bill_col = next((c for c in df.columns if 'bill_due_paid_late_days' in c or 'late_bill_payment_days' in c), None)
    if bill_col: direct_mapping['bill_payment_delay'] = np.clip(df[bill_col].mean() / 10.0, 0, 1) # Normalizing max 10 days
    
    # 3. Income/Variance Mapping
    inc_col = next((c for c in df.columns if 'monthly_income' in c or 'income_credit' in c), None)
    var_col = next((c for c in df.columns if 'income_variance' in c or 'income_consistency' in c), None)
    if var_col: direct_mapping['salary_consistency'] = 1.0 - np.clip(df[var_col].mean(), 0, 1)
    
    # 4. Savings Mapping
    sav_col = next((c for c in df.columns if 'savings_ratio' in c), None)
    if sav_col: direct_mapping['savings_ratio'] = np.clip(df[sav_col].mean(), -1, 1)

    # 5. Volatility / Avg Value
    vol_col = next((c for c in df.columns if 'balance_volatility' in c or 'expense_volatility' in c), None)
    if vol_col: direct_mapping['expense_volatility'] = df[vol_col].mean()
    
    avg_txn_col = next((c for c in df.columns if 'avg_txn_value' in c or 'avg_transaction_value' in c), None)
    # ----------------------------------------------

    # Find critical columns for transactional parsing (fallback)
    time_col = next((c for c in df.columns if 'time' in c or 'date' in c), None)
    if time_col:
        df['parsed_date'] = pd.to_datetime(df[time_col], errors='coerce')
        df = df.dropna(subset=['parsed_date']).sort_values('parsed_date')
    
    amount_col = next((c for c in df.columns if 'amount' in c or 'rs' in c or 'inr' in c or 'spending' in c), None)
    if not amount_col and not direct_mapping:
        raise ValueError("Could not dynamically identify 'amount' or 'summaized metrics' in the CSV.")
    
    df[amount_col] = pd.to_numeric(df[amount_col].astype(str).str.replace(',', ''), errors='coerce').fillna(0)
    
    desc_col = next((c for c in df.columns if 'desc' in c or 'category' in c or 'narration' in c or 'party' in c or 'payee' in c), None)
    df['desc_lower'] = df[desc_col].astype(str).str.lower() if desc_col else ""
    
    type_col = next((c for c in df.columns if 'type' in c or 'dr/cr' in c), None)
    if type_col:
        df['is_credit'] = df[type_col].astype(str).str.lower().str.contains('cr|credit|deposit', na=False)
        df['is_debit'] = df[type_col].astype(str).str.lower().str.contains('dr|debit|withdrawal', na=False)
    else:
        df['is_credit'] = df[amount_col] > 0
        df['is_debit'] = df[amount_col] < 0
    
    df['amount_abs'] = df[amount_col].abs()
    
    debits = df[df['is_debit']].copy()
    credits = df[df['is_credit']].copy()

    # Calculate Data range
    if 'parsed_date' in df.columns and len(df) > 1:
        days = (df['parsed_date'].max() - df['parsed_date'].min()).days
        months = max(1, days / 30.0)
    else:
        days = 30
        months = 1

    # 1. UPI transaction frequency (tx/day)
    # Filter descriptions containing 'upi' or assume all small debits are UPI if not explicitly stated
    upi_txs = debits[debits['desc_lower'].str.contains('upi', na=False)]
    if len(upi_txs) == 0:
        upi_txs = debits[debits['amount_abs'] < 5000] # Fallback heuristic
    upi_tx_freq = len(upi_txs) / max(1, days)
    
    # 2. Bill payment delay days (% late)
    bill_keywords = 'bill|utility|recharge|electricity|water|wifi|broadband|mobile'
    late_keywords = 'late|penalty|bounce|overdue|fine'
    total_bills = debits[debits['desc_lower'].str.contains(bill_keywords, na=False)]
    late_bills = debits[debits['desc_lower'].str.contains(late_keywords, na=False)]
    
    if len(total_bills) + len(late_bills) > 0:
        bill_payment_delay = len(late_bills) / (len(total_bills) + len(late_bills))
    else:
        bill_payment_delay = 0.0
        
    # 3. Salary inflow consistency (monthly pattern)
    salary_inflows = credits[credits['desc_lower'].str.contains('salary|payroll|inc|ltd|pvt', na=False)]
    if len(salary_inflows) >= 2:
        # Standard deviation of salary amounts
        sal_mean = salary_inflows['amount_abs'].mean()
        sal_std = salary_inflows['amount_abs'].std()
        salary_consistency = 1.0 - np.clip((sal_std / sal_mean), 0, 1) if sal_mean > 0 else 0.5
    else:
        # Penalize if not enough salary data
        salary_consistency = 0.3
        
    # 4. Savings ratio (income-expense/credits)
    total_income = credits['amount_abs'].sum()
    total_spend = debits['amount_abs'].sum()
    if total_income > 0:
        savings_ratio = (total_income - total_spend) / total_income
    else:
        savings_ratio = -0.5
    savings_ratio = np.clip(savings_ratio, -1.0, 1.0)
    
    # 5. Expense volatility (std/mean amount)
    if len(debits) > 1:
        exp_mean = debits['amount_abs'].mean()
        if exp_mean > 0:
            expense_volatility = debits['amount_abs'].std() / exp_mean
        else:
            expense_volatility = 0.5
    else:
        expense_volatility = 0.0
    expense_volatility = np.clip(expense_volatility, 0, 5)
    
    # 6. Night risky spending (02:00-05:00 shopping)
    night_risky_spending = 0
    if 'parsed_date' in debits.columns:
        night_txs = debits[(debits['parsed_date'].dt.hour >= 2) & (debits['parsed_date'].dt.hour < 5)]
        night_risky_spending = len(night_txs)
        
    # 7. Rent payment discipline (% on-time)
    rent_txs = debits[debits['desc_lower'].str.contains('rent|lease|pg|hostel', na=False)]
    if len(rent_txs) > 0:
        # Check if they are paid consistently (e.g. standard deviation of day-of-month)
        if 'parsed_date' in rent_txs.columns and len(rent_txs) > 1:
            dom_std = rent_txs['parsed_date'].dt.day.std()
            # If standard dev of date is low (< 5 days), high discipline
            rent_payment_discipline = np.clip(1.0 - (dom_std / 15.0), 0, 1)
        else:
            rent_payment_discipline = 0.8 # paid, but single data point
    else:
        rent_payment_discipline = 0.5 # Unknown neutrality
        
    # 8. Payee diversity (multiple vendors = trust)
    if desc_col and len(debits) > 0:
        # Extract unique words / rough payee identifiers
        unique_payees = debits['desc_lower'].nunique()
        payee_diversity = unique_payees / len(debits)
    else:
        payee_diversity = 0.2
        
    # NEW EXPERIMENTAL FEATURES: Safe Extension
    new_features_log = []
    
    # 1. avg_running_balance -> mean(balance column)
    balance_col = next((c for c in df.columns if 'balance' in c or 'bal' in c), None)
    if balance_col:
        bal_series = pd.to_numeric(df[balance_col].astype(str).str.replace(',', ''), errors='coerce').fillna(0)
        avg_running_balance = np.clip(bal_series.mean() / 100000.0, 0, 1)  # Normalized around 1 Lakh
        new_features_log.append('avg_running_balance')
    else:
        avg_running_balance = 0.5
        
    # 2. income_gap_days -> max gap in days between primary income credits
    if 'parsed_date' in salary_inflows.columns and len(salary_inflows) >= 2:
        gaps = salary_inflows['parsed_date'].sort_values().diff().dt.days.dropna()
        max_gap = gaps.max() if not gaps.empty else 30
        income_gap_days = np.clip((max_gap - 15) / 45.0, 0, 1) # Normalized (15-60 days)
        new_features_log.append('income_gap_days')
    else:
        income_gap_days = 0.5
        
    # 3. overdraft_days -> count of days where balance < 0
    if balance_col and 'parsed_date' in df.columns:
        bal_series = pd.to_numeric(df[balance_col].astype(str).str.replace(',', ''), errors='coerce').fillna(0)
        daily_min_bal = bal_series.groupby(df['parsed_date'].dt.date).min()
        od_days = (daily_min_bal < 0).sum()
        overdraft_days = np.clip(od_days / 10.0, 0, 1) # Normalized max 10 days
        new_features_log.append('overdraft_days')
    else:
        overdraft_days = 0.0
        
    # 4. high_spike_frequency -> count of debit transactions where amount > (mean_debit + 2*std_debit)
    if len(debits) > 2:
        spike_thresh = debits['amount_abs'].mean() + 2 * debits['amount_abs'].std()
        spikes = debits[debits['amount_abs'] > spike_thresh]
        high_spike_frequency = np.clip(len(spikes) / 5.0, 0, 1) # Normalized max 5 spikes
        new_features_log.append('high_spike_frequency')
    else:
        high_spike_frequency = 0.0
        
    # 5. cash_withdrawal_ratio -> total ATM / cash withdrawals divided by total debit
    cash_debits = debits[debits['desc_lower'].str.contains('atm|cash|withdraw', na=False)]
    if total_spend > 0:
        cash_withdrawal_ratio = np.clip(cash_debits['amount_abs'].sum() / total_spend, 0, 1)
        new_features_log.append('cash_withdrawal_ratio')
    else:
        cash_withdrawal_ratio = 0.0
        
    # 6. txn_frequency_stability -> std deviation of daily transaction counts
    if 'parsed_date' in df.columns:
        daily_counts = df.groupby(df['parsed_date'].dt.date).size()
        if len(daily_counts) > 1:
            txn_frequency_stability = np.clip(daily_counts.std() / 10.0, 0, 1) # Normalized
            new_features_log.append('txn_frequency_stability')
        else:
            txn_frequency_stability = 0.0
    else:
        txn_frequency_stability = 0.0
        
    if new_features_log:
        print(f"[Model Enhancement] Computed {len(new_features_log)} new behavioural features successfully: {', '.join(new_features_log)}")

    feature_dict = {
        'upi_tx_freq': upi_tx_freq,
        'bill_payment_delay': bill_payment_delay,
        'salary_consistency': salary_consistency,
        'savings_ratio': savings_ratio,
        'expense_volatility': expense_volatility,
        'night_risky_spending': night_risky_spending,
        'rent_payment_discipline': rent_payment_discipline,
        'payee_diversity': payee_diversity,
        'avg_running_balance': avg_running_balance,
        'income_gap_days': income_gap_days,
        'overdraft_days': overdraft_days,
        'high_spike_frequency': high_spike_frequency,
        'cash_withdrawal_ratio': cash_withdrawal_ratio,
        'txn_frequency_stability': txn_frequency_stability
    }
    
    # --- OVERRIDE WITH DIRECT MAPPING ---
    if direct_mapping:
        print(f"[Direct Mapping] Detected pre-summarized columns: {', '.join(direct_mapping.keys())}")
        for k, v in direct_mapping.items():
            feature_dict[k] = v

    features = pd.DataFrame([feature_dict])
    
    return features.fillna(0)

if __name__ == "__main__":
    train_model()
