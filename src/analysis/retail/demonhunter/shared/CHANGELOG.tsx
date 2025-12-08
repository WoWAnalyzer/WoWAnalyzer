import { change, date } from 'common/changelog';
import { Topple, Quaarkz } from 'CONTRIBUTORS';
import SpellLink from 'interface/SpellLink';
import SPELLS from 'common/SPELLS/demonhunter';
import TALENTS from 'common/TALENTS/demonhunter';

// prettier-ignore
export default [
  change(date(2025, 12, 8), 'Update constants for Midnight.', Quaarkz),
  change(date(2025, 11, 24), 'Add example logs for each spec.', Topple),
  change(date(2025, 11, 9), 'Compilation pass for 12.0.0.', Topple),
  change(date(2024, 12, 1), <>Fix statistics for <SpellLink spell={TALENTS.DEMONSURGE_TALENT} />.</>, Topple),
  change(date(2024, 9, 23), <>Add statistics for <SpellLink spell={TALENTS.DEMONSURGE_TALENT} />.</>, Topple),
  change(date(2024, 9, 23), <>Fix duration of Meta from <SpellLink spell={TALENTS.DEMONIC_TALENT} />.</>, Topple),
  change(date(2024, 9, 3), <>Add normalizer for duplicate casts of <SpellLink spell={SPELLS.CONSUMING_FIRE_1} />.</>, Topple),
  change(date(2024, 9, 3), 'Add Fel-scarred spells.', Topple),
  change(date(2024, 9, 3), 'Add Aldrachi Reaver spells.', Topple),
];
