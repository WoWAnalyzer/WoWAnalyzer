import TALENTS from 'common/TALENTS/mage';
import SPELLS from 'common/SPELLS';
import SpellLink from 'interface/SpellLink';
import { change, date } from 'common/changelog';
import { Sharrq, Earosselot, Vollmer, DarkDiver } from 'CONTRIBUTORS';

// prettier-ignore
export default [
  change(date(2025, 5, 9), <>Add HYPERTHERMIA_BUFF in addition to HYPERTHERMIA_TALENT.</>, DarkDiver),
  change(date(2025, 4, 21), <>Update example log.</>, Vollmer),
  change(date(2025, 4, 20), <>Added Defensives to Guide</>, Earosselot),
  change(date(2024, 11, 22), <>Removed Checklist.</>, Sharrq),
  change(date(2024, 11, 22), <>Updated <SpellLink spell={TALENTS.COMBUSTION_TALENT} />, <SpellLink spell={SPELLS.HOT_STREAK} />, <SpellLink spell={SPELLS.HEATING_UP} />, and <SpellLink spell={TALENTS.FEEL_THE_BURN_TALENT} />.</>, Sharrq),
  change(date(2024, 9, 18), <>Updated the Warning Banner explaining the current state of Fire Mage.</>, Sharrq),
  change(date(2024, 6, 16), <>Added support for <SpellLink spell={TALENTS.EXCESS_FIRE_TALENT} />, <SpellLink spell={TALENTS.EXCESS_FROST_TALENT} />, <SpellLink spell={TALENTS.FLAME_AND_FROST_TALENT} />, <SpellLink spell={TALENTS.MANA_CASCADE_TALENT} />, and <SpellLink spell={TALENTS.GLORIOUS_INCANDESCENCE_TALENT} />.</>, Sharrq),
  change(date(2024, 6, 16), <>Updated the Fire Spec Spellbook and the Mage Class Spellbook.</>, Sharrq),
  change(date(2024, 6, 16), <>Remove Living Bomb, Searing Touch, and Charring Embers</>, Sharrq),
  change(date(2024, 6, 16), <>Initial The War Within support</>, Sharrq),
];
