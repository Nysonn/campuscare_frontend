import { Moon, Sun } from 'lucide-react';
import { useDarkMode } from '../../context/DarkModeContext';

interface Props {
  className?: string;
}

export default function DarkModeToggle({ className = '' }: Props) {
  const { isDark, toggle } = useDarkMode();

  return (
    <button
      onClick={toggle}
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      className={`flex items-center justify-center w-9 h-9 rounded-xl transition-all duration-200 cursor-pointer
        ${isDark
          ? 'bg-gray-700 text-yellow-400 hover:bg-gray-600'
          : 'bg-gray-100 text-gray-500 hover:bg-gray-200 hover:text-gray-700'}
        ${className}`}
    >
      {isDark ? <Sun size={16} /> : <Moon size={16} />}
    </button>
  );
}
