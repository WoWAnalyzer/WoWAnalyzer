import { change, date } from 'common/changelog';
import { Vollmer } from 'CONTRIBUTORS';
import { SpellLink } from 'interface';
import TALENTS from 'common/TALENTS/evoker';

export default [
  change(date(2024, 7, 18), <>Add <SpellLink spell={TALENTS.MOLTEN_EMBERS_TALENT} /> module</>, Vollmer),
];
