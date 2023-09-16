import { PerformanceMark } from 'interface/guide';
import { QualitativePerformance } from 'parser/ui/QualitativePerformance';
import { formatNumber, formatPercentage } from 'common/format';
import PerformanceStrongWithTooltip from 'interface/PerformanceStrongWithTooltip';

/**
 * Thresholds for a performance percentage, where the actual value is compared
 * using the <= operator.
 */
export interface LTEThreshold {
  type: 'lte';
  perfect: number;
  good: number;
  ok: number;
}

/**
 * Thresholds for a performance percentage, where the actual value is compared
 * using the >= operator.
 */
export interface GTEThreshold {
  type: 'gte';
  perfect: number;
  good: number;
  ok: number;
}

interface Props {
  threshold: LTEThreshold | GTEThreshold /** The threshold to compare against. */;
  percentage: number /** The actual percentage value to compare against the threshold */;
  flatAmount?: number /** The flat amount of the percentage (the numerator). Will only show percentage if not specified. */;
}

export function determinePerformance(actual: number, threshold: LTEThreshold | GTEThreshold) {
  const ops = {
    lte: (a: number, b: number) => a <= b,
    gte: (a: number, b: number) => a >= b,
  };

  let performance;
  if (ops[threshold.type](actual, threshold.perfect)) {
    performance = QualitativePerformance.Perfect;
  } else if (ops[threshold.type](actual, threshold.good)) {
    performance = QualitativePerformance.Good;
  } else if (ops[threshold.type](actual, threshold.ok)) {
    performance = QualitativePerformance.Ok;
  } else {
    performance = QualitativePerformance.Fail;
  }

  return performance;
}
/**
 * Element that shows a performance percentage with a tooltip.
 *
 * The performance is computed based on the given threshold. Computation starts
 * by comparing against perfect, good and ok thresholds in order, returning the first one that matched.
 */
const ThresoldPerformancePercentage = ({ threshold, percentage, flatAmount }: Props) => {
  let signJsx;
  if (threshold.type === 'lte') {
    signJsx = <>&lt;</>;
  } else {
    signJsx = <>&gt;</>;
  }

  const performance = determinePerformance(percentage, threshold);

  let child;
  if (flatAmount) {
    child = (
      <>
        {formatNumber(flatAmount)} ({formatPercentage(percentage)}%)
      </>
    );
  } else {
    child = <>{formatPercentage(percentage)}%</>;
  }

  const perfectSign = threshold.perfect > 0 ? <>{signJsx}=</> : <>=</>;
  return (
    <PerformanceStrongWithTooltip
      performance={performance}
      tooltip={
        <>
          <PerformanceMark perf={QualitativePerformance.Perfect} /> Perfect usage {perfectSign}{' '}
          {formatPercentage(threshold.perfect, 0)}%
          <br />
          <PerformanceMark perf={QualitativePerformance.Good} /> Good usage {signJsx}={' '}
          {formatPercentage(threshold.good, 0)}%
          <br />
          <PerformanceMark perf={QualitativePerformance.Ok} /> OK usage {signJsx}={' '}
          {formatPercentage(threshold.ok, 0)}%
        </>
      }
    >
      {child}
    </PerformanceStrongWithTooltip>
  );
};

export default ThresoldPerformancePercentage;
