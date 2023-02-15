import { Trans } from '@lingui/macro';
import { QualitativePerformance } from 'parser/ui/QualitativePerformance';
import RESOURCE_TYPES from 'game/RESOURCE_TYPES';
import { ResourceLink } from 'interface';

import PerformancePercentage from './PerformancePercentage';

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
        The chart below shows your <ResourceLink id={RESOURCE_TYPES.ENERGY.id} /> over the course of
        the encounter. You wasted{' '}
        <PerformancePercentage
          performance={performance}
          perfectPercentage={perfectTimeAtCap}
          goodPercentage={goodTimeAtCap}
          okPercentage={okTimeAtCap}
          percentage={percentAtCap}
          flatAmount={wasted}
        />{' '}
        of your <ResourceLink id={RESOURCE_TYPES.ENERGY.id} />.
      </Trans>
    </p>
  );
};

export default EnergyCapWaste;
