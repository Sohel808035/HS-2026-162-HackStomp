import React, { useEffect, useRef } from 'react';
import { motion, useMotionValue, useTransform, animate } from 'framer-motion';

interface Props {
  value: number;
  color: string;
}

const AnimatedScore: React.FC<Props> = ({ value, color }) => {
  const count = useMotionValue(value);
  const rounded = useTransform(count, (v) => Math.round(v));
  const displayValue = useRef(value);

  useEffect(() => {
    const controls = animate(count, value, {
      duration: 0.8,
      ease: 'easeOut',
    });
    displayValue.current = value;
    return controls.stop;
  }, [value]);

  return (
    <motion.span
      style={{ 
        fontSize: '4rem', 
        fontWeight: 800, 
        color, 
        display: 'block', 
        lineHeight: 1, 
        letterSpacing: '-0.02em',
        textShadow: `0 10px 30px ${color}22` 
      }}
    >
      {rounded}
    </motion.span>
  );
};

export default AnimatedScore;
