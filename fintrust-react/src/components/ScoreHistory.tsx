import React from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine
} from 'recharts';

interface HistoryPoint { tick: number; score: number }

interface Props { history: HistoryPoint[] }

const ScoreHistory: React.FC<Props> = ({ history }) => {
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 8, padding: '8px 12px', fontSize: 12, boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}>
          <p style={{ margin: 0, color: 'var(--accent-primary)', fontWeight: 700 }}>{payload[0].value}</p>
          <p style={{ margin: 0, color: 'var(--text-muted)' }}>score</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div style={{ height: 200 }}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={history}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
          <XAxis dataKey="tick" hide />
          <YAxis domain={[300, 900]} axisLine={false} tickLine={false} tick={{ fill: 'var(--text-muted)', fontSize: 11 }} />
          <Tooltip content={<CustomTooltip />} />
          <ReferenceLine y={750} stroke="var(--accent-success)" strokeOpacity={0.2} strokeDasharray="4 4" label={{ value: 'LOW', fill: 'var(--accent-success)', fontSize: 10, opacity: 0.6 }} />
          <ReferenceLine y={600} stroke="var(--accent-warning)" strokeOpacity={0.2} strokeDasharray="4 4" label={{ value: 'MED', fill: 'var(--accent-warning)', fontSize: 10, opacity: 0.6 }} />
          <Line
            type="monotone"
            dataKey="score"
            stroke="var(--accent-primary)"
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 4, fill: 'var(--accent-primary)', strokeWidth: 0 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default ScoreHistory;
