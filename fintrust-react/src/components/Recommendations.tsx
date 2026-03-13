import React from 'react';
import { Lightbulb, TrendingUp, TrendingDown, AlertCircle, CheckCircle2 } from 'lucide-react';

interface FinancialState {
  income: number;
  transactions: number;
  savingsRatio: number;
  spendingRatio: number;
  latePayments: number;
}

interface Rec { icon: React.ReactNode; text: string; impact: string; type: 'positive' | 'warning' | 'danger' }

const Recommendations: React.FC<{ state: FinancialState; score: number }> = ({ state, score }) => {
  const recs: Rec[] = [];

  if (state.latePayments > 0) {
    const gain = state.latePayments * 100;
    recs.push({
      icon: <AlertCircle size={16} />,
      text: `Eliminate ${state.latePayments} late payment(s) to gain`,
      impact: `+${gain} pts`,
      type: 'danger',
    });
  }

  if (state.spendingRatio > 60) {
    const gain = Math.round((state.spendingRatio - 60) * 0.5);
    recs.push({
      icon: <TrendingDown size={16} />,
      text: `Reduce spending ratio to 60% to gain`,
      impact: `+${gain} pts`,
      type: 'warning',
    });
  }

  if (state.savingsRatio < 30) {
    const gain = (30 - state.savingsRatio) * 2;
    recs.push({
      icon: <TrendingUp size={16} />,
      text: `Increase savings ratio to 30% to gain`,
      impact: `+${gain} pts`,
      type: 'warning',
    });
  }

  if (score > 750) {
    recs.push({
      icon: <CheckCircle2 size={16} />,
      text: 'Excellent score! Maintain current habits.',
      impact: 'Keep it up',
      type: 'positive',
    });
  }

  if (recs.length === 0) {
    recs.push({
      icon: <Lightbulb size={16} />,
      text: 'Increase transaction activity slightly to gain',
      impact: '+5 pts',
      type: 'positive',
    });
  }

  const colors: Record<string, string> = {
    positive: 'var(--accent-success)',
    warning: 'var(--accent-warning)',
    danger: 'var(--accent-danger)',
  };

  const bgColors: Record<string, string> = {
    positive: 'rgba(16, 185, 129, 0.05)',
    warning: 'rgba(245, 158, 11, 0.05)',
    danger: 'rgba(239, 68, 68, 0.05)',
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
      {recs.map((r, i) => (
        <div key={i} style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '0.75rem 1rem',
          background: bgColors[r.type],
          border: `1px solid ${bgColors[r.type].replace('0.05', '0.1')}`,
          borderRadius: 8,
          gap: '1rem',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: colors[r.type] }}>
            {r.icon}
            <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>{r.text}</span>
          </div>
          <span style={{ fontSize: '0.78rem', fontWeight: 700, color: colors[r.type], whiteSpace: 'nowrap' }}>
            {r.impact}
          </span>
        </div>
      ))}
    </div>
  );
};

export default Recommendations;
