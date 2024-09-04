import { change, date } from 'common/changelog';
import { ToppleTheNun } from 'CONTRIBUTORS';
import SpellLink from 'interface/SpellLink';
import SPELLS from 'common/SPELLS/demonhunter';

// prettier-ignore
export default [
  change(date(2024, 9, 3), <>Add normalizer for duplicate casts of <SpellLink spell={SPELLS.CONSUMING_FIRE_1} />.</>, ToppleTheNun),
  change(date(2024, 9, 3), 'Add Fel-scarred spells.', ToppleTheNun),
  change(date(2024, 9, 3), 'Add Aldrachi Reaver spells.', ToppleTheNun),
];
