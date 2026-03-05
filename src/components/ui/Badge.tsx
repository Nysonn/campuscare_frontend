type Variant = 'green' | 'red' | 'yellow' | 'blue' | 'gray';

const styles: Record<Variant, string> = {
  green: 'bg-primary-100 text-primary-700',
  red: 'bg-red-100 text-red-700',
  yellow: 'bg-yellow-100 text-yellow-700',
  blue: 'bg-blue-50 text-blue-600',
  gray: 'bg-gray-100 text-gray-600',
};

export default function Badge({
  children,
  variant = 'gray',
}: {
  children: React.ReactNode;
  variant?: Variant;
}) {
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${styles[variant]}`}>
      {children}
    </span>
  );
}
