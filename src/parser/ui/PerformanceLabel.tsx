import cssComponent from 'interface/utils/css-component';
import styles from './PerformanceLabel.module.scss';
import { QualitativePerformance } from 'parser/ui/QualitativePerformance';
import { ComponentProps, ReactNode } from 'react';
import { PerformanceMark, qualitativePerformanceToColor } from 'interface/guide';

const ColoredText = cssComponent('span', styles.ColoredText, ['color'] as const);

interface PerformanceProps extends ComponentProps<typeof ColoredText> {
  children: ReactNode;
  performance: QualitativePerformance;
}
export const PerformanceLabel = ({ performance, ...others }: PerformanceProps) => (
  <>
    <ColoredText color={qualitativePerformanceToColor(performance)} {...others} />
    <PerformanceMark perf={performance} />
  </>
);
