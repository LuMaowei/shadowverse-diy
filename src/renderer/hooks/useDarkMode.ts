import { useEffect, useState } from 'react';

export default function useDarkMode() {
  const [darkMode, setDarkMode] = useState(
    window.matchMedia('(prefers-color-scheme: dark)').matches,
  );

  useEffect(() => {
    const matcher = window.matchMedia('(prefers-color-scheme: dark)');
    matcher.onchange = (e) => setDarkMode(e.matches);
  }, []);

  return darkMode;
}
