import { clsx } from 'clsx';
import { QualitativePerformance } from 'parser/ui/QualitativePerformance';
import { ComponentProps, ReactNode } from 'react';
import { PerformanceMark, qualitativePerformanceToColor } from 'interface/guide';
import styles from './PerformanceLabel.module.scss';

interface PerformanceProps extends ComponentProps<'span'> {
  children: ReactNode;
  color?: string;
  performance: QualitativePerformance;
}
export const PerformanceLabel = ({
  className,
  color,
  performance,
  style,
  ...others
}: PerformanceProps) => (
  <>
    <span
      className={clsx(styles.coloredText, className)}
      style={{ color: color ?? qualitativePerformanceToColor(performance), ...style }}
      {...others}
    />
    <PerformanceMark perf={performance} />
  </>
);
