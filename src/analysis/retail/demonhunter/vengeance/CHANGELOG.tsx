import { change, date } from 'common/changelog';
import { Quaarkz, Topple, Vollmer } from 'CONTRIBUTORS';
import SHARED_CHANGELOG from 'analysis/retail/demonhunter/shared/CHANGELOG';
import SpellLink from 'interface/SpellLink';
import SPELLS from 'common/SPELLS/demonhunter';
import TALENTS from 'common/TALENTS/demonhunter';

// prettier-ignore
export default [
  change(date(2025, 11, 21), <>Update <SpellLink spell={TALENTS.FEED_THE_DEMON_TALENT} /> for Midnight.</>, Quaarkz),
  change(date(2025, 11, 20), <>Clean-up VDH tiers and disable Demon Soul.</>, Quaarkz),
  change(date(2025, 11, 15), <>Model VDH tiers and update/add constants.</>, Quaarkz),
  change(date(2025, 4, 21), <>Update example log.</>, Vollmer),
  change(date(2024, 9, 23), <>Clean up <SpellLink spell={SPELLS.FRACTURE} /> analyzer.</>, Topple),
  change(date(2024, 10, 17), 'Untethered Fury talent taken into consideration for Fracture analysis.', Quaarkz),
  change(date(2024, 9, 23), <>Improve handling of <SpellLink spell={TALENTS.FEL_DEVASTATION_TALENT} /> in preparation for Demonsurge.</>, Topple),
  change(date(2024, 9, 3), 'Add Aldrachi Reaver and Fel-scarred abilities to the spellbook.', Topple),
  change(date(2024, 9, 3), 'Remove support for DF S3/S4 tier set.', Topple),
  change(date(2024, 6, 17), 'Begin working on support for The War Within.', Topple),
  ...SHARED_CHANGELOG,
];
