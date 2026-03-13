import streamlit as st
import plotly.graph_objects as go
import pandas as pd
import numpy as np

# Set page config
st.set_page_config(
    page_title="Fintrust - Financial Trust Analytics",
    page_icon="🛡️",
    layout="wide",
    initial_sidebar_state="expanded",
)

# Custom CSS for Premium Look
st.markdown("""
<style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap');
    
    html, body, [class*="css"] {
        font-family: 'Inter', sans-serif;
    }
    
    .stApp {
        background: radial-gradient(circle at top left, #0e1117, #1c1c1c);
        color: #e0e0e0;
    }
    
    [data-testid="stSidebar"] {
        background-color: rgba(255, 255, 255, 0.05);
        backdrop-filter: blur(10px);
        border-right: 1px solid rgba(255, 255, 255, 0.1);
    }
    
    .metric-card {
        background-color: rgba(255, 255, 255, 0.05);
        padding: 20px;
        border-radius: 15px;
        border: 1px solid rgba(255, 255, 255, 0.1);
        text-align: center;
        transition: transform 0.3s ease;
    }
    
    .metric-card:hover {
        transform: translateY(-5px);
        background-color: rgba(255, 255, 255, 0.08);
    }
    
    .trust-score {
        font-size: 3rem;
        font-weight: 700;
        color: #00ffcc;
    }
    
    .risk-low { color: #00ff88; }
    .risk-medium { color: #ffcc00; }
    .risk-high { color: #ff4d4d; }
    
    h1, h2, h3 {
        color: #ffffff !important;
    }
</style>
""", unsafe_allow_html=True)

# Sidebar Inputs
st.sidebar.title("🛡️ Fintrust Inputs")
st.sidebar.markdown("Adjust parameters to recalculate Trust Score.")

income = st.sidebar.number_input("Monthly Income ($)", min_value=0, value=5000, step=100)
transactions = st.sidebar.number_input("Monthly Transactions", min_value=0, value=50, step=1)
savings_ratio = st.sidebar.slider("Savings Ratio (%)", 0, 100, 20)
spending_ratio = st.sidebar.slider("Spending Ratio (%)", 0, 100, 70)
late_payments = st.sidebar.number_input("Late Payments (Last 12m)", min_value=0, value=0, step=1)

# Logic for Trust Score (Mock)
def calculate_trust_score(income, transactions, savings, spending, late):
    base_score = 600
    # Higher savings is better
    base_score += (savings * 2)
    # Higher spending is worse
    base_score -= (spending * 0.5)
    # Transactions reflect activity (slight bonus)
    base_score += min(transactions * 0.1, 50)
    # Late payments are very heavy
    base_score -= (late * 100)
    
    return max(300, min(900, base_score))

trust_score = calculate_trust_score(income, transactions, savings_ratio, spending_ratio, late_payments)

# Risk Level Determination
if trust_score > 750:
    risk_level = "LOW"
    risk_class = "risk-low"
elif trust_score > 600:
    risk_level = "MEDIUM"
    risk_class = "risk-medium"
else:
    risk_level = "HIGH"
    risk_class = "risk-high"

# Layout
st.title("Fintrust Dashboard")
st.markdown("### Real-time Financial Integrity & Risk Assessment")

col1, col2 = st.columns([1, 1])

with col1:
    st.markdown('<div class="metric-card">', unsafe_allow_html=True)
    st.markdown("### Trust Score Meter")
    
    fig = go.Figure(go.Indicator(
        mode = "gauge+number",
        value = trust_score,
        domain = {'x': [0, 1], 'y': [0, 1]},
        title = {'text': "Trust Score", 'font': {'size': 24, 'color': 'white'}},
        gauge = {
            'axis': {'range': [None, 900], 'tickwidth': 1, 'tickcolor': "white"},
            'bar': {'color': "#00ffcc"},
            'bgcolor': "rgba(0,0,0,0)",
            'borderwidth': 2,
            'bordercolor': "gray",
            'steps': [
                {'range': [0, 600], 'color': 'rgba(255, 77, 77, 0.3)'},
                {'range': [600, 750], 'color': 'rgba(255, 204, 0, 0.3)'},
                {'range': [750, 900], 'color': 'rgba(0, 255, 136, 0.3)'}
            ],
            'threshold': {
                'line': {'color': "white", 'width': 4},
                'thickness': 0.75,
                'value': trust_score
            }
        },
        number = {'font': {'color': 'white', 'size': 48}}
    ))
    fig.update_layout(
        paper_bgcolor='rgba(0,0,0,0)',
        plot_bgcolor='rgba(0,0,0,0)',
        font={'color': "white"},
        margin=dict(l=20, r=20, t=50, b=20),
        height=350
    )
    st.plotly_chart(fig, use_container_width=True)
    st.markdown('</div>', unsafe_allow_html=True)

with col2:
    st.markdown('<div class="metric-card">', unsafe_allow_html=True)
    st.markdown("### Risk Level Indicator")
    st.markdown(f'<div style="font-size: 5rem; margin: 40px 0;" class="{risk_class}">{risk_level}</div>', unsafe_allow_html=True)
    st.markdown(f"**Basis:** Analysis of {transactions} transactions and {savings_ratio}% savings ratio.", unsafe_allow_html=True)
    st.markdown('</div>', unsafe_allow_html=True)

st.markdown("---")

# Financial Behavior Chart
st.markdown("### Financial Behavior Chart")
# Mock data for trends
months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun"]
data = {
    "Month": months,
    "Spending": [spending_ratio + np.random.randint(-5, 5) for _ in range(6)],
    "Savings": [savings_ratio + np.random.randint(-3, 3) for _ in range(6)]
}
df = pd.DataFrame(data)

fig2 = go.Figure()
fig2.add_trace(go.Scatter(x=df["Month"], y=df["Spending"], name="Spending %", fill='tozeroy', line_color='#ff4d4d'))
fig2.add_trace(go.Scatter(x=df["Month"], y=df["Savings"], name="Savings %", fill='tozeroy', line_color='#00ff88'))

fig2.update_layout(
    paper_bgcolor='rgba(0,0,0,0)',
    plot_bgcolor='rgba(0,0,0,0)',
    font={'color': "white"},
    xaxis=dict(showgrid=False),
    yaxis=dict(showgrid=True, gridcolor='rgba(255,255,255,0.1)'),
    margin=dict(l=20, r=20, t=20, b=20),
    height=400,
    legend=dict(orientation="h", yanchor="bottom", y=1.02, xanchor="right", x=1)
)
st.plotly_chart(fig2, use_container_width=True)

st.sidebar.markdown("---")
st.sidebar.info("This is a UI Demo for Fintrust. Data shown is illustrative.")
