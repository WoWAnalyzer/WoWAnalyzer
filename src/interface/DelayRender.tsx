import type { ReactNode } from 'react';
import { useEffect, useState } from 'react';

interface Props {
  delay: number;
  children: ReactNode;
  fallback?: ReactNode;
}

const DelayRender = ({ delay, children, fallback }: Props) => {
  const [timerExpired, setTimerExpired] = useState(false);

  useEffect(() => {
    const timeout = setTimeout(() => {
      setTimerExpired(true);
    }, delay);

    return () => clearTimeout(timeout);
  }, [delay]);

  if (!timerExpired) {
    return fallback ? fallback : null;
  }

  return <>{children}</>;
};

export default DelayRender;
