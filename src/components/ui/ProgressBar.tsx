export default function ProgressBar({ current, target }: { current: number; target: number }) {
  const pct = Math.min(100, Math.round((current / target) * 100));
  return (
    <div>
      <div className="flex justify-between text-xs text-gray-500 mb-1">
        <span>{pct}% raised</span>
        <span>UGX {target.toLocaleString()}</span>
      </div>
      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
        <div
          className="h-full bg-primary-500 rounded-full transition-all duration-500"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
