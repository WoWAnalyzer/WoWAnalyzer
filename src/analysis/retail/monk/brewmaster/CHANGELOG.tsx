import { change, date } from 'common/changelog';
import talents from 'common/TALENTS/monk';
import { emallson } from 'CONTRIBUTORS';
import SpellLink from 'interface/SpellLink';

// prettier-ignore
export default [
  change(date(2024, 10, 13), <>Updated text for <SpellLink spell={talents.BLACKOUT_COMBO_TALENT} /> section.</>, emallson),
  change(date(2024, 8, 31), <>Updated <SpellLink spell={talents.ANVIL__STAVE_TALENT} /> implementation to better fit TWW behavior.</>, emallson),
  change(date(2024, 8, 31), <>Added <SpellLink spell={talents.ENDLESS_DRAUGHT_TALENT} /> support</>, emallson),
  change(date(2024, 8, 31), <>Added basic <SpellLink spell={talents.MANTRA_OF_PURITY_TALENT} /> support</>, emallson),
  change(date(2024, 8, 31), 'Updated rotation section for TWW', emallson),
  change(date(2024, 7, 6), 'Post-Dragonflight cleanup. Re-enabled Brewmaster', emallson),
];
