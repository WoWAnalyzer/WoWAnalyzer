import { change, date } from 'common/changelog';
import { Sref } from 'CONTRIBUTORS';
import { TALENTS_DRUID } from 'common/TALENTS';
import { SpellLink } from 'interface';

export default [
  change(date(2023, 4, 24), <>Fixed a bug where <SpellLink spell={TALENTS_DRUID.PULVERIZE_TALENT} /> uses weren't being correctly detected.</>, Sref),
  change(date(2023, 4, 22), <>Reactivated Guardian analyzer! Only basic guide and modules so far, more to come.</>, Sref),
];
