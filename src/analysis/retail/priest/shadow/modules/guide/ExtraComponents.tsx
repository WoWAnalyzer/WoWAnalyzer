import { QualitativePerformance } from 'parser/ui/QualitativePerformance';
import { ComponentProps, CSSProperties, ReactNode } from 'react';
import { PerformanceMark, qualitativePerformanceToColor } from 'interface/guide';

import styles from './ExtraComponents.module.scss';

interface PerformanceStrongProps extends ComponentProps<'strong'> {
  children: ReactNode;
  color?: string;
  performance: QualitativePerformance;
}
export const PerformanceStrong = ({
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
      <strong
        className={[styles.coloredStrong, className].filter(Boolean).join(' ')}
        style={strongStyle}
        {...others}
      />
      &nbsp;
      <PerformanceMark perf={performance} />
    </>
  );
};
