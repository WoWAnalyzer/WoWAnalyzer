import { QualitativePerformance } from 'parser/ui/QualitativePerformance';
import RESOURCE_TYPES from 'game/RESOURCE_TYPES';
import { ResourceLink } from 'interface';

import PerformancePercentage from './PerformancePercentage';

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
  return (
    <p>
      <>
        The chart below shows your <ResourceLink id={RESOURCE_TYPES.FURY.id} /> over the course of
        the encounter. You wasted{' '}
        <PerformancePercentage
          performance={percentAtCapPerformance}
          perfectPercentage={perfectTimeAtFuryCap}
          goodPercentage={goodTimeAtFuryCap}
          okPercentage={okTimeAtFuryCap}
          percentage={percentAtCap}
          flatAmount={wasted}
        />{' '}
        of your <ResourceLink id={RESOURCE_TYPES.FURY.id} />.
      </>
    </p>
  );
};

export default FuryCapWaste;
