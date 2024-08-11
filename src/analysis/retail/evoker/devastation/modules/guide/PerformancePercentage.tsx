import { PerformanceMark } from 'interface/guide';
import { QualitativePerformance } from 'parser/ui/QualitativePerformance';
import { formatNumber, formatPercentage } from 'common/format';
import PerformanceStrongWithTooltip from 'interface/PerformanceStrongWithTooltip';

interface Props {
  performance: QualitativePerformance;
  perfectPercentage: number;
  goodPercentage: number;
  okPercentage: number;
  percentage: number;
  flatAmount: number;
}
const PerformancePercentage = ({
  performance,
  perfectPercentage,
  goodPercentage,
  okPercentage,
  percentage,
  flatAmount,
}: Props) => {
  const perfectSign = perfectPercentage > 0 ? '<=' : '=';

  return (
    <PerformanceStrongWithTooltip
      performance={performance}
      tooltip={
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
      {formatNumber(flatAmount)} ({formatPercentage(percentage)}%)
    </PerformanceStrongWithTooltip>
  );
};

export default PerformancePercentage;
