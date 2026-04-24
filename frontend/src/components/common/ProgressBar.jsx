export default function ProgressBar({ value = 0, showLabel = true, size = 'md', className = '' }) {
  const clamped = Math.min(100, Math.max(0, value));

  const heights = {
    sm: 'h-1.5',
    md: 'h-2.5',
    lg: 'h-4',
  };

  return (
    <div className={className}>
      {showLabel && (
        <div className="flex justify-between items-center mb-1.5">
          <span className="text-xs font-medium text-gray-500">Progress</span>
          <span className="text-xs font-semibold text-secondary">{clamped}%</span>
        </div>
      )}
      <div className={`w-full bg-accent rounded-full ${heights[size]}`}>
        <div
          className={`rounded-full transition-all duration-500 ${heights[size]}`}
          style={{ width: `${clamped}%`, background: 'linear-gradient(90deg, #A55850 0%, #C87B72 100%)' }}
        />
      </div>
    </div>
  );
}
