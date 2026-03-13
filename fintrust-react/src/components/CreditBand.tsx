import React from 'react';

interface Props { score: number }

const bands = [
  { label: 'Poor', min: 300, max: 549, color: 'var(--accent-danger)' },
  { label: 'Fair', min: 550, max: 649, color: 'var(--accent-warning)' },
  { label: 'Good', min: 650, max: 749, color: 'var(--accent-primary)' },
  { label: 'Excellent', min: 750, max: 900, color: 'var(--accent-success)' },
];

const CreditBand: React.FC<Props> = ({ score }) => {
  const current = bands.find(b => score >= b.min && score <= b.max) || bands[0];
  const pct = ((score - 300) / 600) * 100;

  return (
    <div>
      <div style={{ display: 'flex', height: 8, borderRadius: 999, overflow: 'hidden', gap: 2, background: 'var(--bg-surface-hover)' }}>
        {bands.map((b) => (
          <div
            key={b.label}
            style={{ flex: 1, background: b.color, opacity: b.label === current.label ? 1 : 0.15, transition: 'opacity 0.3s' }}
          />
        ))}
      </div>

      {/* Pointer */}
      <div style={{ position: 'relative', height: 16, marginTop: 4 }}>
        <div style={{
          position: 'absolute',
          left: `calc(${Math.min(pct, 97)}% - 5px)`,
          top: 0,
          width: 10,
          height: 4,
          background: current.color,
          borderRadius: 2,
          transition: 'left 0.4s ease, background 0.4s',
        }} />
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 2 }}>
        {bands.map((b) => (
          <span key={b.label} style={{
            fontSize: '0.65rem',
            color: b.label === current.label ? b.color : 'var(--text-muted)',
            fontWeight: b.label === current.label ? 700 : 500,
            textTransform: 'uppercase',
            letterSpacing: '0.02em',
            transition: 'all 0.3s',
          }}>
            {b.label}
          </span>
        ))}
      </div>
    </div>
  );
};

export default CreditBand;
