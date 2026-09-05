import './TierDisplay.css';

interface TierDisplayProps {
  tier: number;
}

const MAX_TIER = 3;
const CIRCLE_CIRCUMFERENCE = 2 * Math.PI * 40; // 2 * pi * radius

export default function TierDisplay({ tier }: TierDisplayProps) {
  const progress = tier / MAX_TIER;
  const strokeDashoffset = CIRCLE_CIRCUMFERENCE * (1 - progress);

  return (
    <div className="tier-display-container">
      <svg viewBox="0 0 100 100" className="tier-svg">
        {/* Background Circle */}
        <circle cx="50" cy="50" r="40" className="tier-circle-bg" />
        {/* Progress Circle */}
        <circle
          cx="50"
          cy="50"
          r="40"
          className="tier-circle-progress"
          style={{ strokeDashoffset }}
          strokeDasharray={CIRCLE_CIRCUMFERENCE}
        />
      </svg>      
      <span className="tier-number">{tier}</span>      
    </div>
  );
}

