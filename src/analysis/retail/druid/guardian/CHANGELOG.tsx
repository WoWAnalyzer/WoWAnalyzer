import { change, date } from 'common/changelog';
import { Sref, ToppleTheNun } from 'CONTRIBUTORS';
import { TALENTS_DRUID } from 'common/TALENTS';
import { SpellLink } from 'interface';
import SPELLS from 'common/SPELLS';

export default [
  change(date(2024, 1, 19), <>Marked up to date for 10.2.5</>, Sref),
  change(date(2023, 11, 11), <>Added active time graph to Guide.</>, Sref),
  change(date(2023, 11, 9), <>Added simple spell usage stats for <SpellLink spell={SPELLS.MANGLE_BEAR} />, <SpellLink spell={SPELLS.THRASH_BEAR} />, and <SpellLink spell={SPELLS.MOONFIRE_CAST} />. Marked as updated for 10.2.</>, Sref),
  change(date(2023, 6, 20), 'Update SpellLink usage.', ToppleTheNun),
  change(date(2023, 4, 24), <>Fixed a bug where <SpellLink spell={TALENTS_DRUID.PULVERIZE_TALENT} /> uses weren't being correctly detected.</>, Sref),
  change(date(2023, 4, 22), <>Reactivated Guardian analyzer! Only basic guide and modules so far, more to come.</>, Sref),
];
