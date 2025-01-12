'use client';

import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';

export default function DarkModeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [isChecked, setIsChecked] = useState<boolean>(false);

  // Ensure the component is only rendered on the client
  useEffect(() => {
    setMounted(true);

    // Synchronize the initial checked state with the current theme
    if (theme === 'dark') {
      setIsChecked(true);
    }
  }, [theme]);

  // Defer rendering until after the component has mounted
  if (!mounted) {
    return null;
  }

  return (
    <div className="px-2 lg:px-3 py-1 lg:py-2 flex items-center gap-2 rounded-lg bg-gray-100 dark:bg-gray-700 shadow-sm">
      <label className="relative inline-flex items-center cursor-pointer">
        <input
          type="checkbox"
          checked={isChecked}
          onChange={() => {
            setIsChecked(!isChecked);
            setTheme(isChecked ? 'light' : 'dark');
          }}
          className="sr-only peer"
        />
        <div
          className={`w-11 h-6 rounded-full peer-focus:ring-4 
            ${isChecked ? 'bg-blue-500 ring-blue-300' : 'bg-gray-300 ring-gray-300'}`}
        ></div>
        <div
          className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow-md transform 
            transition ${isChecked ? 'translate-x-5' : ''}`}
        ></div>
      </label>
      <span className="mr-3 text-gray-800 dark:text-gray-200 hidden lg:block">
        {isChecked ? '☀️ Light Mode' : '🌙 Dark Mode'}
      </span>
      <span className="mr-3 text-gray-800 dark:text-gray-200 block lg:hidden">
        {isChecked ? '☀️' : '🌙'}
      </span>
    </div>
  );
}
