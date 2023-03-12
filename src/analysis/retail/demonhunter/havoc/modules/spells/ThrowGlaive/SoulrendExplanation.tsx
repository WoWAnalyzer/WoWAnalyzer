import { useInfo } from 'interface/guide';
import TALENTS from 'common/TALENTS/demonhunter';
import SpellLink from 'interface/SpellLink';
import SPELLS from 'common/SPELLS/demonhunter';
import { formatPercentage } from 'common/format';
import { SOULREND_SCALING } from 'analysis/retail/demonhunter/havoc/constants';

export const SoulrendExplanation = () => {
  const info = useInfo();
  if (!info || !info.combatant.hasTalent(TALENTS.SOULREND_TALENT)) {
    return null;
  }

  return (
    <p>
      <SpellLink id={TALENTS.SOULREND_TALENT} /> makes <SpellLink id={SPELLS.THROW_GLAIVE_HAVOC} />{' '}
      apply a chaos damage DoT to targets hit, dealing{' '}
      {formatPercentage(SOULREND_SCALING[info.combatant.getTalentRank(TALENTS.SOULREND_TALENT)], 0)}
      % of the damage from the hit. Additional <SpellLink id={SPELLS.THROW_GLAIVE_HAVOC} /> hits
      combine the DoT amounts, meaning that you don't need to worry about overwriting the existing
      DoT.
    </p>
  );
};
