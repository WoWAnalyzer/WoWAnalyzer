import SPELLS from 'common/SPELLS';
import TALENTS from 'common/TALENTS/mage';
import SpellLink from 'interface/SpellLink';
import { change, date } from 'common/changelog';
import { Sharrq } from 'CONTRIBUTORS';

// prettier-ignore
export default [
  change(date(2026, 3, 6), <>Removed Searing Touch and Feel the Burn modules.</>, Sharrq),
  change(date(2026, 3, 6), <>Updated the Fire and Shared Mage Spellbook with the latest cooldown reductions, haste buffs, and cooldowns.</>, Sharrq),
  change(date(2026, 3, 6), <>Added support for <SpellLink spell={TALENTS.FIRED_UP_1_FIRE_TALENT} />.</>, Sharrq),
  change(date(2026, 3, 6), <>Updated <SpellLink spell={SPELLS.HOT_STREAK} />, <SpellLink spell={SPELLS.HEATING_UP} />, and <SpellLink spell={TALENTS.COMBUSTION_TALENT} /> for the latest rotation updates..</>, Sharrq),
  change(date(2026, 3, 6), <>Added support for <SpellLink spell={TALENTS.METEOR_TALENT} />, <SpellLink spell={TALENTS.HEAT_SHIMMER_TALENT} />, <SpellLink spell={TALENTS.PYROCOSM_TALENT} />, and <SpellLink spell={TALENTS.SPONTANEOUS_COMBUSTION_TALENT} />.</>, Sharrq),
  change(date(2026, 1, 18), <>Set Fire Mage to Maintained and added basic support for Midnight.</>, Sharrq),
  change(date(2026, 1,18), <>Update <SpellLink spell={SPELLS.HOT_STREAK} />, <SpellLink spell={TALENTS.COMBUSTION_TALENT} />, <SpellLink spell={TALENTS.FEEL_THE_BURN_TALENT} />, and <SpellLink spell={SPELLS.SCORCH} />.</>, Sharrq),
  change(date(2025, 11, 22), <>Enable Fire Mage for Midnight.</>, Sharrq),
];
