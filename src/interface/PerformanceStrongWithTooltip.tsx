import { QualitativePerformance } from 'parser/ui/QualitativePerformance';
import { TooltipElement } from 'interface';
import PerformanceStrong from 'interface/PerformanceStrong';
import { ReactNode } from 'react';

interface Props {
  children: ReactNode;
  performance: QualitativePerformance;
  tooltip: ReactNode;
}
const PerformanceStrongWithTooltip = ({ children, performance, tooltip }: Props) => {
  return (
    <TooltipElement content={tooltip}>
      <PerformanceStrong performance={performance}>{children}</PerformanceStrong>
    </TooltipElement>
  );
};

export default PerformanceStrongWithTooltip;
