import { QualitativePerformance } from 'parser/ui/QualitativePerformance';
import RESOURCE_TYPES from 'game/RESOURCE_TYPES';
import { ResourceLink } from 'interface';
import { useFight } from 'interface/report/context/FightContext';
import { useInfo } from 'interface/guide';
import TALENTS from 'common/TALENTS/demonhunter';
import SPELLS from 'common/SPELLS/demonhunter';
import SpellLink from 'interface/SpellLink';

import PerformancePercentage from './PerformancePercentage';
import { isMythicPlus } from 'common/isMythicPlus';

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
  const { fight } = useFight();
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
      {isMythicPlus(fight) && info.combatant.hasTalent(TALENTS.SPIRIT_BOMB_TALENT) ? (
        <>
          {' '}
          <ResourceLink id={RESOURCE_TYPES.FURY.id} /> waste when taking{' '}
          <SpellLink spell={TALENTS.SPIRIT_BOMB_TALENT} /> in Mythic+ content is not an issue, as
          Vengeance's goal in AoE is to spend as many <SpellLink spell={SPELLS.SOUL_FRAGMENT} />s as
          possible.
        </>
      ) : null}
    </p>
  );
};

export default FuryCapWaste;
