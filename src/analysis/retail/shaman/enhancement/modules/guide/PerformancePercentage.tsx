import { formatNumber, formatPercentage } from 'common/format';
import PerformanceStrongWithTooltip from 'interface/PerformanceStrongWithTooltip';
import { QualitativePerformance } from 'parser/ui/QualitativePerformance';
import {
  PERFECT_WASTED_PERCENT,
  GOOD_WASTED_PERCENT,
  OK_WASTED_PERCENT,
} from '../resourcetracker/MaelstromWeaponTracker';
import { PerformanceMark } from 'interface/guide';

interface Props {
  performance: QualitativePerformance;
  wasted: number;
  gained: number;
}

const PerformancePercentage = ({ performance, wasted, gained }: Props) => {
  return (
    <PerformanceStrongWithTooltip
      performance={performance}
      tooltip={
        <>
          <PerformanceMark perf={QualitativePerformance.Perfect} /> Perfect usage {'<='}{' '}
          {formatPercentage(PERFECT_WASTED_PERCENT, 0)}%
          <br />
          <PerformanceMark perf={QualitativePerformance.Good} /> Good usage {'<='}{' '}
          {formatPercentage(GOOD_WASTED_PERCENT, 0)}%
          <br />
          <PerformanceMark perf={QualitativePerformance.Ok} /> Ok usage {'<='}{' '}
          {formatPercentage(OK_WASTED_PERCENT, 0)}%
        </>
      }
    >
      {formatNumber(wasted)} ({formatPercentage(wasted / gained)}%)
    </PerformanceStrongWithTooltip>
  );
};

export default PerformancePercentage;
