interface StatsCardProps {
  title: string;
  value: string | number;
  comparison: {
    value: number;
    text: string;
  };
}

export default function StatsCard({ title, value, comparison }: StatsCardProps) {
  const isPositive = comparison.value > 0;
  
  return (
    <div className="stats-card">
      <h3 className="stats-title">{title}</h3>
      <div className="stats-value">{value}</div>
      <div className={`stats-comparison ${isPositive ? 'stats-trend-up' : 'stats-trend-down'}`}>
        {isPositive ? (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
            className="w-5 h-5"
          >
            <path
              fillRule="evenodd"
              d="M10 17a.75.75 0 01-.75-.75V5.612L5.29 9.77a.75.75 0 01-1.08-1.04l5.25-5.5a.75.75 0 011.08 0l5.25 5.5a.75.75 0 11-1.08 1.04l-3.96-4.158V16.25A.75.75 0 0110 17z"
              clipRule="evenodd"
            />
          </svg>
        ) : (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
            className="w-5 h-5"
          >
            <path
              fillRule="evenodd"
              d="M10 3a.75.75 0 01.75.75v10.638l3.96-4.158a.75.75 0 111.08 1.04l-5.25 5.5a.75.75 0 01-1.08 0l-5.25-5.5a.75.75 0 111.08-1.04l3.96 4.158V3.75A.75.75 0 0110 3z"
              clipRule="evenodd"
            />
          </svg>
        )}
        <span>
          {Math.abs(comparison.value)}% {comparison.text}
        </span>
      </div>
    </div>
  );
}