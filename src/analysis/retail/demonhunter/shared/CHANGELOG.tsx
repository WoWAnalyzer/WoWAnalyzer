import { change, date } from 'common/changelog';
import { ToppleTheNun } from 'CONTRIBUTORS';
import SpellLink from 'interface/SpellLink';
import SPELLS from 'common/SPELLS/demonhunter';
import TALENTS from 'common/TALENTS/demonhunter';

// prettier-ignore
export default [
  change(date(2024, 12, 1), <>Fix statistics for <SpellLink spell={TALENTS.DEMONSURGE_TALENT} />.</>, ToppleTheNun),
  change(date(2024, 9, 23), <>Add statistics for <SpellLink spell={TALENTS.DEMONSURGE_TALENT} />.</>, ToppleTheNun),
  change(date(2024, 9, 23), <>Fix duration of Meta from <SpellLink spell={TALENTS.DEMONIC_TALENT} />.</>, ToppleTheNun),
  change(date(2024, 9, 3), <>Add normalizer for duplicate casts of <SpellLink spell={SPELLS.CONSUMING_FIRE_1} />.</>, ToppleTheNun),
  change(date(2024, 9, 3), 'Add Fel-scarred spells.', ToppleTheNun),
  change(date(2024, 9, 3), 'Add Aldrachi Reaver spells.', ToppleTheNun),
];
