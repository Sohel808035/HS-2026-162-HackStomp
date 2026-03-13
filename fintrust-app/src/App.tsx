import React, { useState, useEffect, useMemo } from 'react';
import { 
  ShieldCheck, 
  TrendingUp, 
  AlertTriangle, 
  Wallet, 
  Activity, 
  CreditCard,
  ChevronRight
} from 'lucide-react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { motion, AnimatePresence } from 'framer-motion';

// --- Types ---
interface FinancialState {
  income: number;
  transactions: number;
  savingsRatio: number;
  spendingRatio: number;
  latePayments: number;
}

// --- Mock Data Generator ---
const generateTrendData = (spending: number, savings: number) => {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
  return months.map(m => ({
    name: m,
    spending: spending + Math.floor(Math.random() * 10 - 5),
    savings: savings + Math.floor(Math.random() * 6 - 3),
  }));
};

const App: React.FC = () => {
  const [state, setState] = useState<FinancialState>({
    income: 5000,
    transactions: 50,
    savingsRatio: 20,
    spendingRatio: 70,
    latePayments: 0,
  });

  const [trendData, setTrendData] = useState(generateTrendData(70, 20));

  // --- Logic ---
  const trustScore = useMemo(() => {
    let score = 600;
    score += state.savingsRatio * 2;
    score -= state.spendingRatio * 0.5;
    score += Math.min(state.transactions * 0.1, 50);
    score -= state.latePayments * 100;
    return Math.max(300, Math.min(900, score));
  }, [state]);

  const risk = useMemo(() => {
    if (trustScore > 750) return { level: 'LOW', color: '#00ff88', class: 'risk-low' };
    if (trustScore > 600) return { level: 'MEDIUM', color: '#ffcc00', class: 'risk-medium' };
    return { level: 'HIGH', color: '#ff4d4d', class: 'risk-high' };
  }, [trustScore]);

  useEffect(() => {
    setTrendData(generateTrendData(state.spendingRatio, state.savingsRatio));
  }, [state.spendingRatio, state.savingsRatio]);

  const handleInputChange = (key: keyof FinancialState, value: number) => {
    setState(prev => ({ ...prev, [key]: value }));
  };

  // --- Render ---
  return (
    <div className="dashboard-container">
      {/* Sidebar */}
      <aside className="sidebar glass">
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
          <ShieldCheck size={32} color="#00ffcc" />
          <h2 className="text-gradient">Fintrust</h2>
        </div>
        <p style={{ fontSize: '0.8rem', color: '#888' }}>Adjust parameters to recalculate Integrity Score.</p>

        <div className="input-group">
          <label><Wallet size={14} style={{ marginRight: 4 }} /> Monthly Income ($)</label>
          <input 
            type="number" 
            value={state.income} 
            onChange={(e) => handleInputChange('income', parseInt(e.target.value) || 0)}
          />
        </div>

        <div className="input-group">
          <label><Activity size={14} style={{ marginRight: 4 }} /> Monthly Transactions</label>
          <input 
            type="number" 
            value={state.transactions} 
            onChange={(e) => handleInputChange('transactions', parseInt(e.target.value) || 0)}
          />
        </div>

        <div className="input-group">
          <label>Savings Ratio ({state.savingsRatio}%)</label>
          <input 
            type="range" 
            min="0" max="100" 
            value={state.savingsRatio} 
            onChange={(e) => handleInputChange('savingsRatio', parseInt(e.target.value))}
          />
        </div>

        <div className="input-group">
          <label>Spending Ratio ({state.spendingRatio}%)</label>
          <input 
            type="range" 
            min="0" max="100" 
            value={state.spendingRatio} 
            onChange={(e) => handleInputChange('spendingRatio', parseInt(e.target.value))}
          />
        </div>

        <div className="input-group">
          <label><CreditCard size={14} style={{ marginRight: 4 }} /> Late Payments</label>
          <input 
            type="number" 
            min="0" 
            value={state.latePayments} 
            onChange={(e) => handleInputChange('latePayments', parseInt(e.target.value) || 0)}
          />
        </div>

        <div style={{ marginTop: 'auto', padding: '1rem', background: 'rgba(0, 255, 204, 0.05)', borderRadius: '12px', border: '1px solid rgba(0, 255, 204, 0.1)' }}>
          <span style={{ fontSize: '0.75rem', color: '#00ffcc' }}>✨ Pro Tip</span>
          <p style={{ fontSize: '0.7rem', color: '#ccc', margin: '4px 0 0 0' }}>Keep late payments at zero to maintain a score above 700.</p>
        </div>
      </aside>

      {/* Main Content */}
      <main className="main-content">
        <header>
          <h1>Fintrust Dashboard</h1>
          <p style={{ color: '#888', margin: '0.5rem 0' }}>Real-time Financial Integrity & Risk Assessment</p>
        </header>

        <section className="grid-cols-2">
          {/* Trust Score Card */}
          <motion.div 
            layout
            className="glass-card" 
            style={{ padding: '2rem', textAlign: 'center' }}
          >
            <h3 style={{ marginBottom: '1.5rem', opacity: 0.8 }}>Trust Score Meter</h3>
            <div style={{ height: '250px', position: 'relative' }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={[
                      { value: trustScore },
                      { value: 900 - trustScore }
                    ]}
                    cx="50%"
                    cy="80%"
                    startAngle={180}
                    endAngle={0}
                    innerRadius={80}
                    outerRadius={120}
                    paddingAngle={0}
                    dataKey="value"
                  >
                    <Cell fill="#00ffcc" />
                    <Cell fill="rgba(255,255,255,0.05)" />
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div style={{ 
                position: 'absolute', 
                bottom: '15%', 
                left: '50%', 
                transform: 'translateX(-50%)',
                textAlign: 'center'
              }}>
                <motion.span 
                  initial={{ scale: 0.5, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  key={trustScore}
                  style={{ fontSize: '4rem', fontWeight: 800, display: 'block' }}
                >
                  {trustScore}
                </motion.span>
                <span style={{ fontSize: '1rem', color: '#aaa', textTransform: 'uppercase', letterSpacing: '2px' }}>
                  Integrity Score
                </span>
              </div>
            </div>
          </motion.div>

          {/* Risk Level Card */}
          <motion.div 
             layout
             className="glass-card" 
             style={{ padding: '2rem', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}
          >
            <h3 style={{ marginBottom: '1rem', opacity: 0.8 }}>Risk Level Indicator</h3>
            <motion.div 
              key={risk.level}
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              style={{ 
                fontSize: '5rem', 
                fontWeight: 900, 
                color: risk.color,
                textShadow: `0 0 30px ${risk.color}44`
              }}
            >
              {risk.level}
            </motion.div>
            <div style={{ padding: '1rem', textAlign: 'center', maxWidth: '300px' }}>
              <p style={{ color: '#aaa', fontSize: '0.9rem' }}>
                Based on analysis of <strong>{state.transactions}</strong> transactions and <strong>{state.savingsRatio}%</strong> savings ratio.
              </p>
            </div>
            <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem' }}>
              {['LOW', 'MEDIUM', 'HIGH'].map(l => (
                <div key={l} style={{ 
                  width: '60px', 
                  height: '4px', 
                  backgroundColor: risk.level === l ? risk.color : 'rgba(255,255,255,0.1)',
                  borderRadius: '2px'
                }} />
              ))}
            </div>
          </motion.div>
        </section>

        {/* Behavior Chart */}
        <section className="glass-card" style={{ padding: '2rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <h3 style={{ opacity: 0.8 }}>Financial Behavior Chart</h3>
            <div style={{ display: 'flex', gap: '1.5rem', fontSize: '0.75rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <div style={{ width: 12, height: 12, borderRadius: '50%', backgroundColor: '#00ff88' }} />
                <span>Savings %</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <div style={{ width: 12, height: 12, borderRadius: '50%', backgroundColor: '#ff4d4d' }} />
                <span>Spending %</span>
              </div>
            </div>
          </div>
          <div style={{ height: '300px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trendData}>
                <defs>
                  <linearGradient id="colorSavings" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#00ff88" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#00ff88" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorSpending" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ff4d4d" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#ff4d4d" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#666', fontSize: 12 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#666', fontSize: 12 }} />
                <Tooltip 
                  contentStyle={{ 
                    background: 'rgba(20, 20, 25, 0.95)', 
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '8px',
                    fontSize: '12px'
                  }} 
                />
                <Area 
                  type="monotone" 
                  dataKey="savings" 
                  stroke="#00ff88" 
                  strokeWidth={3}
                  fillOpacity={1} 
                  fill="url(#colorSavings)" 
                />
                <Area 
                  type="monotone" 
                  dataKey="spending" 
                  stroke="#ff4d4d" 
                  strokeWidth={3}
                  fillOpacity={1} 
                  fill="url(#colorSpending)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </section>

        <footer>
          <div className="glass-card" style={{ padding: '1rem 2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', gap: '2rem' }}>
              <div>
                <span style={{ fontSize: '0.7rem', color: '#666', display: 'block' }}>Monthly Inflow</span>
                <span style={{ fontSize: '1.25rem', fontWeight: 600 }}>${state.income.toLocaleString()}</span>
              </div>
              <div>
                <span style={{ fontSize: '0.7rem', color: '#666', display: 'block' }}>Daily Avg</span>
                <span style={{ fontSize: '1.25rem', fontWeight: 600 }}>${(state.income / 30).toFixed(2)}</span>
              </div>
            </div>
            <button className="glass" style={{ 
              padding: '0.75rem 1.5rem', 
              color: '#00ffcc', 
              fontWeight: 600, 
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}>
              Generate Audit Report <ChevronRight size={16} />
            </button>
          </div>
        </footer>
      </main>
    </div>
  );
};

export default App;
