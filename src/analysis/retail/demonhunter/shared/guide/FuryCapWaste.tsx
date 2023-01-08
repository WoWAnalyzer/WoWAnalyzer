import { Trans } from '@lingui/macro';
import { QualitativePerformance } from 'parser/ui/QualitativePerformance';
import { formatNumber } from 'common/format';
import {
  GOOD_TIME_AT_FURY_CAP,
  OK_TIME_AT_FURY_CAP,
  PERFECT_TIME_AT_FURY_CAP,
} from 'analysis/retail/demonhunter/vengeance/modules/resourcetracker/FuryTracker';
import PerformancePercentage from 'analysis/retail/demonhunter/shared/guide/PerformancePercentage';

interface Props {
  percentAtCap: number;
  percentAtCapPerformance: QualitativePerformance;
  wasted: number;
}
const FuryCapWaste = ({ percentAtCap, percentAtCapPerformance, wasted }: Props) => {
  const furyWastedFormatted = formatNumber(wasted);

  return (
    <p>
      <Trans id="guide.demonhunter.sections.resources.fury.chart">
        The chart below shows your Fury over the course of the encounter. You spent{' '}
        <PerformancePercentage
          performance={percentAtCapPerformance}
          perfectPercentage={PERFECT_TIME_AT_FURY_CAP}
          goodPercentage={GOOD_TIME_AT_FURY_CAP}
          okPercentage={OK_TIME_AT_FURY_CAP}
          value={percentAtCap}
        />{' '}
        of the encounter capped on Fury, leading to{' '}
        <strong>{furyWastedFormatted} wasted Fury</strong>.
      </Trans>
    </p>
  );
};

export default FuryCapWaste;
