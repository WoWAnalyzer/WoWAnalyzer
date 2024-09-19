import TALENTS from 'common/TALENTS/mage';
import SpellLink from 'interface/SpellLink';
import { change, date } from 'common/changelog';
import { Sharrq } from 'CONTRIBUTORS';

// prettier-ignore
export default [
  change(date(2024, 9, 18), <>Updated the Warning Banner explaining the current state of Fire Mage.</>, Sharrq),
  change(date(2024, 6, 16), <>Added support for <SpellLink spell={TALENTS.EXCESS_FIRE_TALENT} />, <SpellLink spell={TALENTS.EXCESS_FROST_TALENT} />, <SpellLink spell={TALENTS.FLAME_AND_FROST_TALENT} />, <SpellLink spell={TALENTS.MANA_CASCADE_TALENT} />, and <SpellLink spell={TALENTS.GLORIOUS_INCANDESCENCE_TALENT} />.</>, Sharrq),
  change(date(2024, 6, 16), <>Updated the Fire Spec Spellbook and the Mage Class Spellbook.</>, Sharrq),
  change(date(2024, 6, 16), <>Remove Living Bomb, Searing Touch, and Charring Embers</>, Sharrq),
  change(date(2024, 6, 16), <>Initial The War Within support</>, Sharrq),
];
