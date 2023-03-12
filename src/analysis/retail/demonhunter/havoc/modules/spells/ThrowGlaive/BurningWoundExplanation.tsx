import { useInfo } from 'interface/guide';
import TALENTS from 'common/TALENTS/demonhunter';
import SpellLink from 'interface/SpellLink';
import SPELLS from 'common/SPELLS/demonhunter';
import { formatPercentage } from 'common/format';
import { BURNING_WOUND_SCALING } from 'analysis/retail/demonhunter/havoc/constants';

export const BurningWoundExplanation = () => {
  const info = useInfo();
  if (!info || !info.combatant.hasTalent(TALENTS.BURNING_WOUND_TALENT)) {
    return null;
  }

  return (
    <p>
      <SpellLink id={TALENTS.BURNING_WOUND_TALENT} /> makes{' '}
      <SpellLink id={SPELLS.THROW_GLAIVE_HAVOC} /> apply a debuff to the target that will make them
      receive{' '}
      {formatPercentage(
        BURNING_WOUND_SCALING[info.combatant.getTalentRank(TALENTS.BURNING_WOUND_TALENT)],
        0,
      )}
      % increased damage from <SpellLink id={SPELLS.IMMOLATION_AURA} />.
    </p>
  );
};
