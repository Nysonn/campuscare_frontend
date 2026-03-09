const sizes = {
  sm: 'h-8 w-8',
  md: 'h-12 w-12',
  lg: 'h-16 w-16',
};

export default function Spinner({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) {
  return (
    <div className="flex items-center justify-center">
      <img
        src="/logo.png"
        alt="Loading…"
        className={`${sizes[size]} object-contain animate-[logoPulse_1.2s_ease-in-out_infinite]`}
      />
    </div>
  );
}
