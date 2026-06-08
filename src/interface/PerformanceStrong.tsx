import cssComponent from 'interface/utils/css-component';
import styles from './PerformanceStrong.module.scss';
import { QualitativePerformance } from 'parser/ui/QualitativePerformance';
import { ComponentProps, ReactNode } from 'react';
import { PerformanceMark, qualitativePerformanceToColor } from 'interface/guide';

const ColoredStrong = cssComponent('strong', styles.ColoredStrong, ['color'] as const);

interface PerformanceStrongProps extends ComponentProps<typeof ColoredStrong> {
  children: ReactNode;
  performance: QualitativePerformance;
}
const PerformanceStrong = ({ performance, ...others }: PerformanceStrongProps) => (
  <>
    <PerformanceMark perf={performance} />{' '}
    <ColoredStrong color={qualitativePerformanceToColor(performance)} {...others} />
  </>
);

export default PerformanceStrong;
