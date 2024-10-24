import { change, date } from 'common/changelog';
import { Quaarkz, ToppleTheNun } from 'CONTRIBUTORS';
import SHARED_CHANGELOG from 'analysis/retail/demonhunter/shared/CHANGELOG';
import SpellLink from 'interface/SpellLink';
import TALENTS from 'common/TALENTS/demonhunter';

// prettier-ignore
export default [
  change(date(2024, 10, 17), 'Untethered Fury talent taken into consideration for Fracture analysis.', Quaarkz),
  change(date(2024, 9, 23), <>Improve handling of <SpellLink spell={TALENTS.FEL_DEVASTATION_TALENT} /> in preparation for Demonsurge.</>, ToppleTheNun),
  change(date(2024, 9, 3), 'Add Aldrachi Reaver and Fel-scarred abilities to the spellbook.', ToppleTheNun),
  change(date(2024, 9, 3), 'Remove support for DF S3/S4 tier set.', ToppleTheNun),
  change(date(2024, 6, 17), 'Begin working on support for The War Within.', ToppleTheNun),
  ...SHARED_CHANGELOG,
];
