import { useNavigation } from 'react-router-dom';
import { useSpinDelay } from 'spin-delay';
import { useEffect, useRef, useState } from 'react';
import { clsx } from 'clsx';

import styles from './ProgressBar.module.scss';

export function ProgressBar() {
  const transition = useNavigation();
  const busy = transition.state !== 'idle';
  const delayedPending = useSpinDelay(busy, {
    delay: 600,
    minDuration: 400,
  });
  const ref = useRef<HTMLDivElement>(null);
  const [animationComplete, setAnimationComplete] = useState(true);

  useEffect(() => {
    if (!ref.current) {
      return;
    }
    if (delayedPending) {
      setAnimationComplete(false);
    }

    const animationPromises = ref.current.getAnimations().map(({ finished }) => finished);

    void Promise.allSettled(animationPromises).then(() => {
      if (!delayedPending) {
        setAnimationComplete(true);
      }
    });
  }, [delayedPending]);

  return (
    <div
      role="progressbar"
      aria-hidden={delayedPending ? undefined : true}
      aria-valuetext={delayedPending ? 'Loading' : undefined}
      className={styles['progress-bar-container']}
    >
      <div
        ref={ref}
        className={clsx(styles['progress-bar'], {
          [`${styles['progress-bar-idle-animation-complete']}`]:
            transition.state === 'idle' && animationComplete,
          [`${styles['progress-bar-idle-animation-incomplete']}`]:
            transition.state === 'idle' && !animationComplete,
          [`${styles['progress-bar-submitting']}`]: transition.state === 'submitting',
          [`${styles['progress-bar-loading']}`]: transition.state === 'loading',
        })}
      />
      {delayedPending && (
        <div className={styles['spinner-container']}>
          <div className={styles['spinner']} />
        </div>
      )}
    </div>
  );
}
