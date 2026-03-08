import { change, date } from 'common/changelog';
import SPELLS from 'common/SPELLS';
import TALENTS from 'common/TALENTS/warrior';
import { Abelito75, Rzial, Vollmer } from 'CONTRIBUTORS';
import { SpellLink } from 'interface';

// prettier-ignore
export default [
  change(date(2026, 3, 8), <><SpellLink spell={TALENTS.VIOLENT_OUTBURST_TALENT}/> wasted buff tracker.</>, Abelito75),
  change(date(2026, 3, 7), <>General Cleanup of existing code.</>, Abelito75),
  change(date(2026, 3, 6), <>Re-enabled protection warrior parsing.</>, Abelito75),
  change(date(2026, 3, 5), <>Removed broken code, updated core abilities file.</>, Abelito75),
  change(date(2025, 4, 21), <>Update example log.</>, Vollmer),
  change(date(2024, 10, 28), <>Added Hero talent <SpellLink spell={TALENTS.BURST_OF_POWER_TALENT}/> as <SpellLink spell={SPELLS.SHIELD_SLAM} /> reset trigger.</>, Rzial),
  change(date(2024, 10, 28), <>Added The War Within Season 1 2-pieces tier set effect <SpellLink spell={SPELLS.EXPERT_STRATEGIST_BUFF}/> as <SpellLink spell={SPELLS.SHIELD_SLAM} /> reset tracker.</>, Rzial),
  change(date(2024, 10, 24), 'Initial Update for The War Within.', Rzial),
];
