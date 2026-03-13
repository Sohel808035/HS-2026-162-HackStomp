import React from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, ReferenceLine } from 'recharts';

interface Props {
  savingsRatio: number;
  spendingRatio: number;
  transactions: number;
  latePayments: number;
}

const ScoreBreakdown: React.FC<Props> = ({ savingsRatio, spendingRatio, transactions, latePayments }) => {
  const data = [
    { name: 'Savings', value: +(savingsRatio * 2).toFixed(1) },
    { name: 'Spending', value: -(spendingRatio * 0.5).toFixed(1) },
    { name: 'Activity', value: +Math.min(transactions * 0.1, 50).toFixed(1) },
    { name: 'Late Pay.', value: -(latePayments * 100) },
  ];

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const v = payload[0].value;
      return (
        <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 8, padding: '8px 12px', fontSize: 12, boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}>
          <p style={{ margin: 0, color: 'var(--text-muted)' }}>{label}</p>
          <p style={{ margin: 0, color: v >= 0 ? 'var(--accent-success)' : 'var(--accent-danger)', fontWeight: 700 }}>{v > 0 ? `+${v}` : v} pts</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div style={{ height: 220 }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} layout="vertical" barCategoryGap="30%">
          <XAxis type="number" axisLine={false} tickLine={false} tick={{ fill: 'var(--text-muted)', fontSize: 11 }} />
          <YAxis type="category" dataKey="name" axisLine={false} tickLine={false} tick={{ fill: 'var(--text-secondary)', fontSize: 12 }} width={65} />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.02)' }} />
          <ReferenceLine x={0} stroke="var(--border)" strokeOpacity={0.5} />
          <Bar dataKey="value" radius={[0, 4, 4, 0]}>
            {data.map((entry, index) => (
              <Cell key={index} fill={entry.value >= 0 ? 'var(--accent-success)' : 'var(--accent-danger)'} fillOpacity={0.8} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default ScoreBreakdown;
