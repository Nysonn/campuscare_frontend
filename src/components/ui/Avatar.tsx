export default function Avatar({
  src,
  name,
  size = 'md',
}: {
  src?: string;
  name?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}) {
  const sizes = { sm: 'h-8 w-8 text-xs', md: 'h-10 w-10 text-sm', lg: 'h-14 w-14 text-base', xl: 'h-20 w-20 text-xl' };
  const initials = name
    ? name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)
    : '?';

  if (src) {
    return (
      <img
        src={src}
        alt={name || 'avatar'}
        className={`${sizes[size]} rounded-full object-cover ring-2 ring-primary-100`}
      />
    );
  }

  return (
    <div
      className={`${sizes[size]} rounded-full bg-primary-100 text-primary-700 flex items-center justify-center font-semibold ring-2 ring-primary-100`}
    >
      {initials}
    </div>
  );
}
