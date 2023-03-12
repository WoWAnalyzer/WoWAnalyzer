import { useInfo } from 'interface/guide';
import TALENTS from 'common/TALENTS/demonhunter';
import SpellLink from 'interface/SpellLink';
import SPELLS from 'common/SPELLS/demonhunter';
import { formatPercentage } from 'common/format';
import { SERRATED_GLAIVE_SCALING } from 'analysis/retail/demonhunter/havoc/constants';

export const SerratedGlaiveExplanation = () => {
  const info = useInfo();
  if (!info || !info.combatant.hasTalent(TALENTS.SERRATED_GLAIVE_TALENT)) {
    return null;
  }

  return (
    <p>
      <SpellLink id={TALENTS.SERRATED_GLAIVE_TALENT} /> makes{' '}
      <SpellLink id={SPELLS.THROW_GLAIVE_HAVOC} /> apply a debuff to targets that will make them
      receive{' '}
      {formatPercentage(
        SERRATED_GLAIVE_SCALING[info.combatant.getTalentRank(TALENTS.SERRATED_GLAIVE_TALENT)],
        0,
      )}
      % increased damage from <SpellLink id={TALENTS.EYE_BEAM_TALENT} />.
    </p>
  );
};
