import { PerformanceMark } from 'interface/guide';
import { QualitativePerformance } from 'parser/ui/QualitativePerformance';
import { PerformanceStrong } from 'analysis/retail/demonhunter/shared/guide/ExtraComponents';
import { TooltipElement } from 'interface';
import { formatPercentage } from 'common/format';

interface Props {
  performance: QualitativePerformance;
  perfectPercentage: number;
  goodPercentage: number;
  okPercentage: number;
  value: number;
}
const PerformancePercentage = ({
  performance,
  value,
  perfectPercentage,
  goodPercentage,
  okPercentage,
}: Props) => {
  const perfectSign = perfectPercentage > 0 ? '<=' : '=';

  return (
    <TooltipElement
      content={
        <>
          <PerformanceMark perf={QualitativePerformance.Perfect} /> Perfect usage {perfectSign}{' '}
          {formatPercentage(perfectPercentage, 0)}%
          <br />
          <PerformanceMark perf={QualitativePerformance.Good} /> Good usage &lt;={' '}
          {formatPercentage(goodPercentage, 0)}%
          <br />
          <PerformanceMark perf={QualitativePerformance.Ok} /> OK usage &lt;={' '}
          {formatPercentage(okPercentage, 0)}%
        </>
      }
    >
      <PerformanceStrong performance={performance}>{formatPercentage(value)}%</PerformanceStrong>
    </TooltipElement>
  );
};

export default PerformancePercentage;
