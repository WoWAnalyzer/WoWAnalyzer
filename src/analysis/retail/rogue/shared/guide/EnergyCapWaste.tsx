import { Trans } from '@lingui/macro';
import { QualitativePerformance } from 'parser/ui/QualitativePerformance';
import { formatNumber } from 'common/format';
import PerformancePercentage from 'analysis/retail/demonhunter/shared/guide/PerformancePercentage';

const percentAtCapPerformance = ({
  percentAtCap,
  perfectTimeAtCap,
  goodTimeAtCap,
  okTimeAtCap,
}: Props): QualitativePerformance => {
  if (percentAtCap <= perfectTimeAtCap) {
    return QualitativePerformance.Perfect;
  }
  if (percentAtCap <= goodTimeAtCap) {
    return QualitativePerformance.Good;
  }
  if (percentAtCap <= okTimeAtCap) {
    return QualitativePerformance.Ok;
  }
  return QualitativePerformance.Fail;
};

interface Props {
  percentAtCap: number;
  perfectTimeAtCap: number;
  goodTimeAtCap: number;
  okTimeAtCap: number;
  wasted: number;
}
const EnergyCapWaste = ({
  percentAtCap,
  perfectTimeAtCap,
  goodTimeAtCap,
  okTimeAtCap,
  wasted,
}: Props) => {
  const wastedFormatted = formatNumber(wasted);
  const performance = percentAtCapPerformance({
    percentAtCap,
    perfectTimeAtCap,
    goodTimeAtCap,
    okTimeAtCap,
    wasted,
  });

  return (
    <p>
      <Trans id="guide.rogue.sections.resources.energy.chart">
        The chart below shows your Fury over the course of the encounter. You spent{' '}
        <PerformancePercentage
          performance={performance}
          perfectPercentage={perfectTimeAtCap}
          goodPercentage={goodTimeAtCap}
          okPercentage={okTimeAtCap}
          value={percentAtCap}
        />{' '}
        of the encounter capped on Energy, leading to{' '}
        <strong>{wastedFormatted} wasted Energy</strong>.
      </Trans>
    </p>
  );
};

export default EnergyCapWaste;
