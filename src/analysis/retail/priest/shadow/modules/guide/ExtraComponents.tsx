import cssComponent from "interface/utils/css-component";
import styles from "./ExtraComponents.module.scss";
import { QualitativePerformance } from 'parser/ui/QualitativePerformance';
import { ComponentProps, ReactNode } from 'react';
import { PerformanceMark, qualitativePerformanceToColor } from 'interface/guide';

const ColoredStrong = cssComponent("strong", styles.ColoredStrong, ["color"] as const);

interface PerformanceStrongProps extends ComponentProps<typeof ColoredStrong> {
  children: ReactNode;
  performance: QualitativePerformance;
}
export const PerformanceStrong = ({ performance, ...others }: PerformanceStrongProps) => (
  <>
    <ColoredStrong color={qualitativePerformanceToColor(performance)} {...others} />
    &nbsp;
    <PerformanceMark perf={performance} />
  </>
);
