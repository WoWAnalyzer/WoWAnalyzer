import { ReactNode } from 'react';
import styles from './TipBox.module.scss';

interface TipBoxProps {
  children: ReactNode;
  icon?: ReactNode;
  title?: string;
}

/**
 * A reusable box for displaying tips, warnings, or informational messages in guides.``
 */
export function TipBox({ children, icon, title }: TipBoxProps) {
  return (
    <div className={styles.container}>
      <div className={styles.contentWrapper}>
        {icon && <span className={styles.iconWrapper}>{icon}</span>}
        <div className={styles.content}>
          {title && <strong>{title}: </strong>}
          {children}
        </div>
      </div>
    </div>
  );
}

interface TipBoxWithTimestampsProps extends TipBoxProps {
  timestamps: number[];
  formatTimestamp: (timestamp: number) => string;
  maxTimestamps?: number;
}

/**
 * TipBox variant that includes affected timestamps
 */
export function TipBoxWithTimestamps({
  children,
  timestamps,
  formatTimestamp,
  maxTimestamps = 5,
  ...props
}: TipBoxWithTimestampsProps) {
  return (
    <TipBox {...props}>
      <div>
        {children}
        {timestamps && timestamps.length > 0 && (
          <div className={styles.timestampsList}>
            <strong>Affected casts:</strong>{' '}
            {timestamps
              .slice(0, maxTimestamps)
              .map((ts) => formatTimestamp(ts))
              .join(', ')}
            {timestamps.length > maxTimestamps && ` (+${timestamps.length - maxTimestamps} more)`}
          </div>
        )}
      </div>
    </TipBox>
  );
}
