import { change, date } from 'common/changelog';
import { emallson } from 'CONTRIBUTORS';
import SpellLink from 'interface/SpellLink';
import SPELLS from './spell-list_Monk_Brewmaster.retail';

// prettier-ignore
export default [
  change(date(2025, 11, 20), <>Remove Purified Chi in Midnight and do a pass on <SpellLink spell={SPELLS.PURIFYING_BREW_TALENT} /> / <SpellLink spell={SPELLS.CELESTIAL_BREW_TALENT} /> analysis</>, emallson),
  change(date(2025, 11, 20), <>Update <SpellLink spell={SPELLS.BLACKOUT_COMBO_TALENT} /> for Midnight</>, emallson),
  change(date(2025, 11, 15), 'Initial Midnight setup', emallson)
];
