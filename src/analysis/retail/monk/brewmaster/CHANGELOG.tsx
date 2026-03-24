import { change, date } from 'common/changelog';
import { emallson } from 'CONTRIBUTORS';
import SpellLink from 'interface/SpellLink';
import SPELLS from './spell-list_Monk_Brewmaster.retail';

// prettier-ignore
export default [
  change(date(2026, 3, 24), <>Add cast breakdowns and <SpellLink spell={SPELLS.BLACKOUT_COMBO_TALENT} /> breakdown to Rotation section.</>, emallson),
  change(date(2026, 3, 24), <>Allow using <SpellLink spell={SPELLS.BREATH_OF_FIRE_TALENT} /> before combo <SpellLink spell={SPELLS.TIGER_PALM} /> in the APL in some cases.</>, emallson),
  change(date(2026, 3, 24), <>Move <SpellLink spell={SPELLS.CHI_BURST_TALENT} /> out of the main APL and into the cooldown list to improve APL behavior.</>, emallson),
  change(date(2026, 3, 16), <>Add several missing sources of <SpellLink spell={SPELLS.KEG_SMASH_TALENT} /> and Brew CDR / resets.</>, emallson),
  change(date(2026, 3, 16), <>Add rotation support for Midnight S1</>, emallson),
  change(date(2026, 2, 22), <>Add new <SpellLink spell={SPELLS.STAGGER_TALENT} /> implementation and section</>, emallson),
  change(date(2026, 2, 21), <>Add <SpellLink spell={SPELLS.INVOKE_NIUZAO_THE_BLACK_OX_TALENT} /> section</>, emallson),
  change(date(2026, 1, 18), <>Add statistic for <SpellLink spell={SPELLS.VITAL_FLAME_TALENT} /></>, emallson),
  change(date(2025, 11, 27), <>Update <SpellLink spell={SPELLS.HIGH_TOLERANCE_TALENT} />, <SpellLink spell={SPELLS.STAGGERING_STRIKES_TALENT} /> and <SpellLink spell={SPELLS.WALK_WITH_THE_OX_TALENT} /> for Midnight</>, emallson),
  change(date(2025, 11, 20), <>Remove Purified Chi in Midnight and do a pass on <SpellLink spell={SPELLS.PURIFYING_BREW_TALENT} /> / <SpellLink spell={SPELLS.CELESTIAL_BREW_TALENT} /> analysis</>, emallson),
  change(date(2025, 11, 20), <>Update <SpellLink spell={SPELLS.BLACKOUT_COMBO_TALENT} /> for Midnight</>, emallson),
  change(date(2025, 11, 15), 'Initial Midnight setup', emallson)
];
