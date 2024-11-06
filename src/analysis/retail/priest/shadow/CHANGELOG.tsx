import { change, date } from 'common/changelog';
//import SPELLS from 'common/SPELLS';
import TALENTS from 'common/TALENTS/priest';
import { DoxAshe } from 'CONTRIBUTORS';
import { SpellLink } from 'interface';

export default [
  change(date(2024, 11, 5),  <>Add support for spells added by Shadow's Voidweaver Hero Talent Tree </>,DoxAshe),
  change(date(2024, 11, 5),  <>Remove <SpellLink spell={TALENTS.SHADOW_WORD_DEATH_TALENT}/> suggestions from guide view </>,DoxAshe),
  change(date(2024, 10, 30),  <>Add support and statistic for Shadow's Archon Hero Talent tree</>,DoxAshe),
  change(date(2024, 10, 17),  <>Add statistic for Shadow's TWW season 1 tier set</>,DoxAshe),
  change(date(2024, 10, 14),  <>Improve guide view recommendations</>,DoxAshe),
  change(date(2024, 8, 8), <>Update spec for 11.0.2 changes</>,DoxAshe),
  change(date(2024, 7, 31), <>Enable spec for The War Within</>,DoxAshe),
];
