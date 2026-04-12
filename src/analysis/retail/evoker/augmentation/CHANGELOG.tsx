import { change, date } from 'common/changelog';
import { Vollmer, KYZ } from 'CONTRIBUTORS';
import { SpellLink } from 'interface';
import TALENTS from 'common/TALENTS/evoker';

export default [
  change(date(2026, 4, 12), <>Updated for 12.0.5.</>, KYZ),
  change(date(2026, 4, 8), <>Significant updates to guide section.</>, KYZ),
  change(date(2026, 3, 17), <>Updated with further class tuning hotfixes.</>, KYZ),
  change(date(2026, 3, 15), <>Updated with class tuning hotfixes.</>, KYZ),
  change(date(2026, 2, 7), <>Add statistics for <SpellLink spell={TALENTS.CONCENTRATED_POWER_TALENT} />.</>, Vollmer),
  change(date(2026, 1, 31), <>Several <SpellLink spell={TALENTS.DUPLICATE_1_AUGMENTATION_TALENT}/> related updates.</>, KYZ),
  change(date(2026, 1, 19), <>Updated for Midnight.</>, KYZ),
  change(date(2026, 1, 17), <>Update <SpellLink spell={TALENTS.IMMINENT_DESTRUCTION_AUGMENTATION_TALENT}/> module for Midnight.</>, Vollmer),
];
