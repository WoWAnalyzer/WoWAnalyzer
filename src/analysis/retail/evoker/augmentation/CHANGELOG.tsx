import { change, date } from 'common/changelog';
import { Vollmer } from 'CONTRIBUTORS';
import { SpellLink } from 'interface';
import TALENTS from 'common/TALENTS/evoker';

export default [
  change(date(2024, 8, 11), <>Implement <SpellLink spell={TALENTS.MASS_ERUPTION_TALENT}/> module</>, Vollmer),
  change(date(2024, 7, 22), <>Update <SpellLink spell={TALENTS.REACTIVE_HIDE_TALENT}/> multiplier</>, Vollmer),
  change(date(2024, 7, 21), <>Implement <SpellLink spell={TALENTS.RUMBLING_EARTH_TALENT}/> module</>, Vollmer),
  change(date(2024, 7, 21), <>Implement <SpellLink spell={TALENTS.IMMINENT_DESTRUCTION_AUGMENTATION_TALENT}/> module</>, Vollmer),
  change(date(2024, 7, 19), <>Update IDs for <SpellLink spell={TALENTS.BREATH_OF_EONS_TALENT} /></>, Vollmer),
  change(date(2024, 7, 18), <>Add <SpellLink spell={TALENTS.MOLTEN_EMBERS_TALENT} /> module</>, Vollmer),
];
