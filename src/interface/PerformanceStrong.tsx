import { QualitativePerformance } from 'parser/ui/QualitativePerformance';
import { ComponentProps, CSSProperties, ReactNode } from 'react';
import { PerformanceMark, qualitativePerformanceToColor } from 'interface/guide';

import styles from './PerformanceStrong.module.scss';

interface PerformanceStrongProps extends ComponentProps<'strong'> {
  children: ReactNode;
  color?: string;
  performance: QualitativePerformance;
}
const PerformanceStrong = ({
  className,
  color,
  performance,
  style,
  ...others
}: PerformanceStrongProps) => {
  const strongStyle = {
    ...style,
    '--performance-strong-color': color ?? qualitativePerformanceToColor(performance),
  } as CSSProperties;

  return (
    <>
      <PerformanceMark perf={performance} />{' '}
      <strong
        className={[styles.coloredStrong, className].filter(Boolean).join(' ')}
        style={strongStyle}
        {...others}
      />
    </>
  );
};

export default PerformanceStrong;
