import { useLayoutEffect, useState } from 'react';

export default function useMediaQueryMatch(query: string): boolean {
  const [matches, setMatches] = useState(false);
  useLayoutEffect(() => {
    const watcher = window.matchMedia(query);

    function update() {
      setMatches(watcher.matches);
    }

    update();
    watcher.addEventListener('change', update);

    return () => watcher.removeEventListener('change', update);
  }, [query]);
  return matches;
}
