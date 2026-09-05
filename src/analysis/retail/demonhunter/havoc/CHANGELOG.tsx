import { change, date } from 'common/changelog';
import { Topple, Vollmer, Hezaerd, Zogmaw } from 'CONTRIBUTORS';
import SHARED_CHANGELOG from 'analysis/retail/demonhunter/shared/CHANGELOG';
import SpellLink from 'interface/SpellLink';
import TALENTS from 'common/TALENTS/demonhunter';
import SPELLS from 'common/SPELLS/demonhunter';

// prettier-ignore
export default [
  change(date(2026, 5, 24), 'Updated for 12.1', Zogmaw),
  change(date(2026, 5, 24), <>Add <SpellLink spell={TALENTS.ETERNAL_HUNT_1_HAVOC_TALENT} /> analysis.</>, Zogmaw),
  change(date(2026, 5, 23), <>Add <SpellLink spell={TALENTS.INERTIA_TALENT} /> to the timeline view.</>, Zogmaw),
  change(date(2026, 5, 21), <>Fixing <SpellLink spell={TALENTS.INERTIA_TALENT} /> analysis to work with <SpellLink spell={SPELLS.ABYSSAL_GAZE} />.</>, Zogmaw),
  change(date(2026, 5, 12), <>Add <SpellLink spell={SPELLS.BLUR} /> charges and clean up old havoc spells.</>, Zogmaw),
  change(date(2026, 4, 10), <>Add <SpellLink spell={SPELLS.BLUR} /> analysis to Havoc analysis.</>, Hezaerd),
  change(date(2026, 4, 2), <>Add initial Havoc analysis for <SpellLink spell={TALENTS.INERTIA_TALENT} /> and clean up outdated guide talent references.</>, Hezaerd),
  change(date(2025, 4, 21), <>Update example log.</>, Vollmer),
  change(date(2024, 9, 23), <>Improve handling of <SpellLink spell={TALENTS.EYE_BEAM_TALENT} /> in preparation for Demonsurge.</>, Topple),
  change(date(2024, 9, 3), 'Add Aldrachi Reaver and Fel-scarred abilities to the spellbook.', Topple),
  change(date(2024, 6, 17), 'Begin working on support for The War Within.', Topple),
  ...SHARED_CHANGELOG,
];
