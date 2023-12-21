import { useEffect, useState } from 'react';
import * as React from 'react';

export interface Props {
  delay: number;
  children: React.ReactNode;
  fallback?: React.ReactNode;
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
