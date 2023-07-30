import { QualitativePerformance } from 'parser/ui/QualitativePerformance';
import RESOURCE_TYPES from 'game/RESOURCE_TYPES';
import { ResourceLink, SpellLink } from 'interface';
import { useInfo } from 'interface/guide';
import Tooltip from 'interface/Tooltip';
import InformationIcon from 'interface/icons/Information';

import PerformancePercentage from '../../shared/guide/PerformancePercentage';
import TALENTS from 'common/TALENTS/demonhunter';

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
  const info = useInfo();
  if (!info) {
    return null;
  }

  return (
    <p>
      The chart below shows your <ResourceLink id={RESOURCE_TYPES.FURY.id} /> over the course of the
      encounter. You wasted{' '}
      <PerformancePercentage
        performance={percentAtCapPerformance}
        perfectPercentage={perfectTimeAtFuryCap}
        goodPercentage={goodTimeAtFuryCap}
        okPercentage={okTimeAtFuryCap}
        percentage={percentAtCap}
        flatAmount={wasted}
      />{' '}
      of your <ResourceLink id={RESOURCE_TYPES.FURY.id} />.
      {info.combatant.hasTalent(TALENTS.BLIND_FURY_TALENT) && (
        <>
          {' '}
          <Tooltip
            content={
              <div>
                <ResourceLink id={RESOURCE_TYPES.FURY.id} /> from{' '}
                <SpellLink spell={TALENTS.BLIND_FURY_TALENT} /> isn't logged by the game and won't
                show up on WarcraftLogs; we determine the amount generated based on best guesses
                from existing log events. As a result, the amount shown here may vary from what WCL
                shows and the actual amount in-game.
              </div>
            }
          >
            <div style={{ display: 'inline' }}>
              <InformationIcon style={{ fontSize: '1.4em' }} />
            </div>
          </Tooltip>
        </>
      )}
    </p>
  );
};

export default FuryCapWaste;
