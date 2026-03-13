import React, { useState, useEffect, useMemo, useRef } from 'react';
import { motion } from 'framer-motion';
import { ShieldCheck, Wallet, Activity, CreditCard, Printer, ChevronRight } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

import AnimatedScore from './components/AnimatedScore';
import ScoreBreakdown from './components/ScoreBreakdown';
import ScoreHistory from './components/ScoreHistory';
import Recommendations from './components/Recommendations';
import CreditBand from './components/CreditBand';
import ThemeToggle from './components/ThemeToggle';
import { ThemeProvider } from './context/ThemeContext';

interface FinancialState {
  income: number;
  transactions: number;
  savingsRatio: number;
  spendingRatio: number;
  latePayments: number;
}

interface HistoryPoint { tick: number; score: number }

const generateTrendData = (spending: number, savings: number) =>
  ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'].map(name => ({
    name,
    spending: Math.max(0, spending + Math.floor(Math.random() * 12 - 6)),
    savings: Math.max(0, savings + Math.floor(Math.random() * 8 - 4)),
  }));

const FADE_UP = {
  hidden: { y: 20, opacity: 0 },
  visible: (i: number) => ({ y: 0, opacity: 1, transition: { delay: i * 0.08, duration: 0.5 } }),
};

const AppInner: React.FC = () => {
  const [state, setState] = useState<FinancialState>({
    income: 5000, transactions: 50, savingsRatio: 20, spendingRatio: 70, latePayments: 0,
  });

  const [trendData, setTrendData] = useState(generateTrendData(70, 20));
  const [history, setHistory] = useState<HistoryPoint[]>([]);
  const tickRef = useRef(0);
  const dashboardRef = useRef<HTMLDivElement>(null);

  const trustScore = useMemo(() => {
    let s = 600;
    s += state.savingsRatio * 2;
    s -= state.spendingRatio * 0.5;
    s += Math.min(state.transactions * 0.1, 50);
    s -= state.latePayments * 100;
    return Math.round(Math.max(300, Math.min(900, s)));
  }, [state]);

  const risk = useMemo(() => {
    // Critical Risk Condition: Low savings + High spending
    if (state.savingsRatio < 10 && state.spendingRatio > 85) {
      return { level: 'HIGH', color: '#ef4444', cls: 'neon-red', bgColor: 'rgba(239, 68, 68, 0.08)' };
    }
    if (trustScore > 750) return { level: 'LOW', color: '#10b981', cls: 'neon-green', bgColor: 'rgba(16, 185, 129, 0.08)' };
    if (trustScore > 600) return { level: 'MEDIUM', color: '#f59e0b', cls: 'neon-yellow', bgColor: 'rgba(245, 158, 11, 0.08)' };
    return { level: 'HIGH', color: '#ef4444', cls: 'neon-red', bgColor: 'rgba(239, 68, 68, 0.08)' };
  }, [trustScore, state.savingsRatio, state.spendingRatio]);

  useEffect(() => {
    setTrendData(generateTrendData(state.spendingRatio, state.savingsRatio));
    tickRef.current += 1;
    setHistory(prev => {
      const next = [...prev, { tick: tickRef.current, score: trustScore }];
      return next.slice(-20);
    });
  }, [trustScore]);

  const handle = (key: keyof FinancialState, value: number) => {
    setState(prev => ({ ...prev, [key]: value }));
  };

  const insights = useMemo(() => {
    if (state.savingsRatio < 10 && state.spendingRatio > 85) {
      return "CRITICAL RISK: Extremely low savings paired with high spending detected.";
    }
    if (state.latePayments > 0) return "Risk increased significantly due to recent late payments.";
    if (state.spendingRatio > 80) return "High spending-to-income ratio is capping your score potential.";
    if (state.savingsRatio < 10) return "Low savings rate detected; consider a 15% target for a 'Good' band.";
    return "Stable financial behavior. Maintain low spending for further score growth.";
  }, [state]);

  const handleExport = () => {
    window.print();
  };

  const gaugeData = [{ value: trustScore }, { value: 900 - trustScore }];

  return (
    <div className="dashboard-container" ref={dashboardRef}>
      {/* ========== SIDEBAR ========== */}
      <aside className="sidebar">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <ShieldCheck size={28} color="var(--accent-primary)" />
            <h2 className="text-gradient">Fintrust</h2>
          </div>
          <ThemeToggle />
        </div>

        <p className="text-muted-safe" style={{ fontSize: '0.75rem', margin: 0 }}>
          Adjust parameters to recalculate Integrity Score.
        </p>

        <div className="input-group">
          <label><Wallet size={13} /> Monthly Income ($)</label>
          <input type="number" value={state.income} onChange={e => handle('income', +e.target.value || 0)} />
        </div>

        <div className="input-group">
          <label><Activity size={13} /> Monthly Transactions</label>
          <input type="number" value={state.transactions} onChange={e => handle('transactions', +e.target.value || 0)} />
        </div>

        <div className="input-group">
          <label>Savings Ratio ({state.savingsRatio}%)</label>
          <input type="range" min="0" max="100" value={state.savingsRatio}
            onChange={e => handle('savingsRatio', +e.target.value)} />
        </div>

        <div className="input-group">
          <label>Spending Ratio ({state.spendingRatio}%)</label>
          <input type="range" min="0" max="100" value={state.spendingRatio}
            onChange={e => handle('spendingRatio', +e.target.value)} />
        </div>

        <div className="input-group">
          <label><CreditCard size={13} /> Late Payments (Last 12m)</label>
          <input type="number" min="0" value={state.latePayments}
            onChange={e => handle('latePayments', +e.target.value || 0)} />
        </div>

        {/* Credit Band */}
        <div>
          <p className="card-title">Credit Band</p>
          <CreditBand score={trustScore} />
        </div>

        {/* Actionable UI */}
        <div className="action-card">
          <span style={{ fontSize: '0.75rem', color: 'var(--accent-primary)', fontWeight: 700 }}>REFERRED ACTIONS</span>
          <p style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', margin: '4px 0 0.75rem', lineHeight: 1.4 }}>
            Based on your current {risk.level.toLowerCase()} risk profile.
          </p>
          <button className="action-btn" onClick={() => alert("Setting up automated savings...")}>Set Savings Goal</button>
          <button className="action-btn" style={{ background: 'transparent', border: '1px solid var(--accent-primary)', color: 'var(--accent-primary)', marginTop: '0.5rem' }} onClick={() => alert("Opening payment audit...")}>Audit Payments</button>
        </div>
      </aside>

      {/* ========== MAIN ========== */}
      <main className="main-content">
        {/* Header */}
        <motion.header
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}
        >
          <div>
            <h1 style={{ fontSize: '1.75rem' }}>Financial Dashboard</h1>
            <p style={{ color: 'var(--text-secondary)', margin: '0.25rem 0 0', fontSize: '0.85rem' }}>
              Real-time integrity &amp; risk assessment
            </p>
          </div>
          <button className="btn-primary" onClick={handleExport}>
            <Printer size={15} /> Export PDF
          </button>
        </motion.header>

        {/* Row 1: Trust Score + Risk + Score History */}
        <div className="grid-3">
          {/* Trust Score Meter */}
          <motion.div custom={0} initial="hidden" animate="visible" variants={FADE_UP} className="card" style={{ gridColumn: 'span 1', textAlign: 'center' }}>
            <p className="card-title">Trust Score</p>
            <div style={{ position: 'relative', height: 200 }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={gaugeData} cx="50%" cy="80%" startAngle={180} endAngle={0}
                    innerRadius={65} outerRadius={95} paddingAngle={0} dataKey="value">
                    <Cell fill={risk.color} />
                    <Cell fill="rgba(255,255,255,0.05)" />
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div style={{ position: 'absolute', bottom: '8%', left: '50%', transform: 'translateX(-50%)', textAlign: 'center' }}>
                <AnimatedScore value={trustScore} color={risk.color} />
                <span style={{ fontSize: '0.65rem', color: 'var(--text-secondary)', letterSpacing: '2px', textTransform: 'uppercase' }}>
                  Integrity Score
                </span>
              </div>
            </div>
          </motion.div>

          {/* Risk Level Indicator */}
          <motion.div custom={1} initial="hidden" animate="visible" variants={FADE_UP} className="card"
            style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', gap: '0.75rem', background: risk.bgColor }}>
            <p className="card-title">Risk Level</p>
            <motion.span
              key={risk.level}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className={risk.cls}
              style={{ fontSize: '3.5rem', fontWeight: 900, letterSpacing: '-1px' }}
            >
              {risk.level}
            </motion.span>
            <div style={{ display: 'flex', gap: 6 }}>
              {['HIGH', 'MEDIUM', 'LOW'].map(l => (
                <div key={l} style={{ width: 40, height: 3, borderRadius: 999, background: risk.level === l ? risk.color : 'rgba(255,255,255,0.1)', transition: 'background 0.4s' }} />
              ))}
            </div>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textAlign: 'center', maxWidth: 180, margin: '0 0 1rem' }}>
              {state.transactions} transactions &bull; {state.savingsRatio}% saved
            </p>
            <div style={{ padding: '0.75rem', background: 'rgba(255,255,255,0.03)', borderRadius: 8, width: '100%', border: '1px solid var(--border)' }}>
              <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', display: 'block', marginBottom: 4 }}>DATA INSIGHT</span>
              <p style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', margin: 0, lineHeight: 1.4 }}>{insights}</p>
            </div>
          </motion.div>

          {/* Score History */}
          <motion.div custom={2} initial="hidden" animate="visible" variants={FADE_UP} className="card">
            <p className="card-title">Score History</p>
            <ScoreHistory history={history} />
          </motion.div>
        </div>

        {/* Row 2: Financial Behavior Chart */}
        <motion.div custom={3} initial="hidden" animate="visible" variants={FADE_UP} className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <p className="card-title" style={{ margin: 0 }}>Financial Behavior Chart</p>
            <div style={{ display: 'flex', gap: '1.25rem', fontSize: '0.72rem', color: 'var(--text-secondary)' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#00ff88', display: 'inline-block' }} /> Savings %
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#ff4d4d', display: 'inline-block' }} /> Spending %
              </span>
            </div>
          </div>
          <div style={{ height: 240 }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trendData}>
                <defs>
                  <linearGradient id="gSavings" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--accent-success)" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="var(--accent-success)" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="gSpending" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--accent-danger)" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="var(--accent-danger)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: 'var(--text-muted)', fontSize: 11 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: 'var(--text-muted)', fontSize: 11 }} />
                <Tooltip 
                  contentStyle={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 8, fontSize: 12, boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }} 
                  itemStyle={{ fontSize: 11 }}
                />
                <Area type="monotone" dataKey="savings" stroke="var(--accent-success)" strokeWidth={2} fillOpacity={1} fill="url(#gSavings)" />
                <Area type="monotone" dataKey="spending" stroke="var(--accent-danger)" strokeWidth={2} fillOpacity={1} fill="url(#gSpending)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Row 3: Score Breakdown + Recommendations */}
        <div className="grid-2">
          <motion.div custom={4} initial="hidden" animate="visible" variants={FADE_UP} className="card">
            <p className="card-title">Score Breakdown</p>
            <ScoreBreakdown
              savingsRatio={state.savingsRatio}
              spendingRatio={state.spendingRatio}
              transactions={state.transactions}
              latePayments={state.latePayments}
            />
          </motion.div>

          <motion.div custom={5} initial="hidden" animate="visible" variants={FADE_UP} className="card">
            <p className="card-title">AI Recommendations</p>
            <Recommendations state={state} score={trustScore} />
          </motion.div>
        </div>

        {/* Footer */}
        <motion.div custom={6} initial="hidden" animate="visible" variants={FADE_UP} className="card"
          style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem 1.5rem' }}>
          <div style={{ display: 'flex', gap: '2.5rem' }}>
            <div>
              <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', display: 'block', textTransform: 'uppercase', letterSpacing: 1 }}>Monthly Inflow</span>
              <span style={{ fontSize: '1.2rem', fontWeight: 700 }}>${state.income.toLocaleString()}</span>
            </div>
            <div>
              <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', display: 'block', textTransform: 'uppercase', letterSpacing: 1 }}>Daily Avg</span>
              <span style={{ fontSize: '1.2rem', fontWeight: 700 }}>${(state.income / 30).toFixed(2)}</span>
            </div>
            <div>
              <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', display: 'block', textTransform: 'uppercase', letterSpacing: 1 }}>Integrity Score</span>
              <span style={{ fontSize: '1.2rem', fontWeight: 700, color: risk.color }}>{trustScore}</span>
            </div>
          </div>
          <button className="btn-primary" onClick={handleExport} style={{ gap: '0.5rem' }}>
            Generate Audit Report <ChevronRight size={14} />
          </button>
        </motion.div>
      </main>
    </div>
  );
};

const App: React.FC = () => (
  <ThemeProvider>
    <AppInner />
  </ThemeProvider>
);

export default App;
