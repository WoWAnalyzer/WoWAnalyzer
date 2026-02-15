import SPELLS from 'common/SPELLS';
import TALENTS from 'common/TALENTS/mage';
import SpellLink from 'interface/SpellLink';
import { change, date } from 'common/changelog';
import { Sharrq } from 'CONTRIBUTORS';

// prettier-ignore
export default [
  change(date(2026, 1, 18), <>Set Fire Mage to Maintained and added basic support for Midnight.</>, Sharrq),
  change(date(2026, 1,18), <>Update <SpellLink spell={SPELLS.HOT_STREAK} />, <SpellLink spell={TALENTS.COMBUSTION_TALENT} />, <SpellLink spell={TALENTS.FEEL_THE_BURN_TALENT} />, and <SpellLink spell={SPELLS.SCORCH} />.</>, Sharrq),
  change(date(2025, 11, 22), <>Enable Fire Mage for Midnight.</>, Sharrq),
];
