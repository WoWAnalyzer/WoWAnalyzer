import SPELLS from 'common/SPELLS';
import TALENTS from 'common/TALENTS/mage';
import SpellLink from 'interface/SpellLink';
import { change, date } from 'common/changelog';
import { Thias, Sharrq } from 'CONTRIBUTORS';

// prettier-ignore
export default [
  change(date(2026, 4, 17), <>Temporarily fix crash of <SpellLink spell={SPELLS.HEAT_SHIMMER_BUFF} /> by extending the buffer</>, Thias),
  change(date(2026, 3, 20), <>Fixed an issue that prevented <SpellLink spell={TALENTS.FLAMESTRIKE_2_FIRE_TALENT} /> from being detected as a <SpellLink spell={SPELLS.HOT_STREAK} /> spender if the player chose the talent to cast <SpellLink spell={TALENTS.FLAMESTRIKE_2_FIRE_TALENT} /> at your target instead of your cursor.</>, Sharrq),
  change(date(2026, 3, 20), <>Fixed an issue that caused some <SpellLink spell={SPELLS.FIRE_BLAST.id} /> casts to not detect that <SpellLink spell={TALENTS.COMBUSTION_TALENT} /> was active.</>, Sharrq),
  change(date(2026, 3, 6), <>Removed Searing Touch and Feel the Burn modules.</>, Sharrq),
  change(date(2026, 3, 6), <>Updated the Fire and Shared Mage Spellbook with the latest cooldown reductions, haste buffs, and cooldowns.</>, Sharrq),
  change(date(2026, 3, 6), <>Added support for <SpellLink spell={TALENTS.FIRED_UP_1_FIRE_TALENT} />.</>, Sharrq),
  change(date(2026, 3, 6), <>Updated <SpellLink spell={SPELLS.HOT_STREAK} />, <SpellLink spell={SPELLS.HEATING_UP} />, and <SpellLink spell={TALENTS.COMBUSTION_TALENT} /> for the latest rotation updates..</>, Sharrq),
  change(date(2026, 3, 6), <>Added support for <SpellLink spell={TALENTS.METEOR_TALENT} />, <SpellLink spell={TALENTS.HEAT_SHIMMER_TALENT} />, <SpellLink spell={TALENTS.PYROCOSM_TALENT} />, and <SpellLink spell={TALENTS.SPONTANEOUS_COMBUSTION_TALENT} />.</>, Sharrq),
  change(date(2026, 1, 18), <>Set Fire Mage to Maintained and added basic support for Midnight.</>, Sharrq),
  change(date(2026, 1,18), <>Update <SpellLink spell={SPELLS.HOT_STREAK} />, <SpellLink spell={TALENTS.COMBUSTION_TALENT} />, <SpellLink spell={TALENTS.FEEL_THE_BURN_TALENT} />, and <SpellLink spell={SPELLS.SCORCH} />.</>, Sharrq),
  change(date(2025, 11, 22), <>Enable Fire Mage for Midnight.</>, Sharrq),
];
