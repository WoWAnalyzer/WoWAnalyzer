import { useInfo } from 'interface/guide';
import TALENTS from 'common/TALENTS/demonhunter';
import SpellLink from 'interface/SpellLink';
import SPELLS from 'common/SPELLS/demonhunter';
import { formatPercentage } from 'common/format';
import { ACCELERATING_BLADE_SCALING } from 'analysis/retail/demonhunter/havoc/constants';

export const AcceleratingBladeExplanation = () => {
  const info = useInfo();
  if (!info || !info.combatant.hasTalent(TALENTS.ACCELERATING_BLADE_TALENT)) {
    return null;
  }

  const scaling =
    ACCELERATING_BLADE_SCALING[info.combatant.getTalentRank(TALENTS.ACCELERATING_BLADE_TALENT)];
  const perTargetScaling = 1 + scaling;

  // multiplicative scaling
  const primaryTargetScaling = formatPercentage(perTargetScaling, 0);
  const secondaryTargetScaling = formatPercentage(perTargetScaling * perTargetScaling, 0);
  const tertiaryTargetScaling = formatPercentage(
    perTargetScaling * perTargetScaling * perTargetScaling,
    0,
  );

  const tertiaryTargetDisplay = (
    <>
      , and your tertiary target (with <SpellLink id={TALENTS.BOUNCING_GLAIVES_TALENT} />) takes{' '}
      {tertiaryTargetScaling}% damage
    </>
  );

  return (
    <p>
      <SpellLink id={TALENTS.ACCELERATING_BLADE_TALENT} /> makes{' '}
      <SpellLink id={SPELLS.THROW_GLAIVE_HAVOC} /> deal{' '}
      {formatPercentage(
        ACCELERATING_BLADE_SCALING[info.combatant.getTalentRank(TALENTS.ACCELERATING_BLADE_TALENT)],
        0,
      )}
      % increased damage per target hit. This damage increase is applied per bounce along the chain,
      meaning that your primary target takes {primaryTargetScaling}% damage, your secondary target
      takes {secondaryTargetScaling}% damage{tertiaryTargetDisplay}.
    </p>
  );
};
