import { Trans } from '@lingui/macro';
import { QualitativePerformance } from 'parser/ui/QualitativePerformance';
import { formatNumber } from 'common/format';
import PerformancePercentage from 'analysis/retail/demonhunter/shared/guide/PerformancePercentage';

interface Props {
  percentAtCap: number;
  percentAtCapPerformance: QualitativePerformance;
  perfectTimeAtFuryCap: number;
  goodTimeAtFuryCap: number;
  okTimeAtFuryCap: number;
  wasted: number;
}
const FuryCapWaste = ({
  percentAtCap,
  percentAtCapPerformance,
  perfectTimeAtFuryCap,
  goodTimeAtFuryCap,
  okTimeAtFuryCap,
  wasted,
}: Props) => {
  const furyWastedFormatted = formatNumber(wasted);

  return (
    <p>
      <Trans id="guide.demonhunter.sections.resources.fury.chart">
        The chart below shows your Fury over the course of the encounter. You spent{' '}
        <PerformancePercentage
          performance={percentAtCapPerformance}
          perfectPercentage={perfectTimeAtFuryCap}
          goodPercentage={goodTimeAtFuryCap}
          okPercentage={okTimeAtFuryCap}
          value={percentAtCap}
        />{' '}
        of the encounter capped on Fury, leading to{' '}
        <strong>{furyWastedFormatted} wasted Fury</strong>.
      </Trans>
    </p>
  );
};

export default FuryCapWaste;
