import { useEffect } from 'react';

const Hotkeys = () => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (document.activeElement && document.activeElement !== document.body) {
        return;
      }

      if (
        e.key === 'l' &&
        // eslint-disable-next-line no-restricted-globals
        confirm(
          'Open this page in your development environment?\n\n' +
            'See https://github.com/WoWAnalyzer/WoWAnalyzer#getting-started for information on how to set this up.',
        )
      ) {
        const newUrl = `http://localhost:3000${window.location.pathname}`;
        window.location.href = newUrl;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  return null;
};

export default Hotkeys;
