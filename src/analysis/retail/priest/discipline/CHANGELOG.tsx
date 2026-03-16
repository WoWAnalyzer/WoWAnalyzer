import { change, date } from 'common/changelog';
import { Vetyst } from 'CONTRIBUTORS';
import { TALENTS_PRIEST } from 'common/TALENTS';
import { SpellLink } from 'interface';

export default [
  change(date(2025, 3, 15), <>Implement statistics for <SpellLink spell={TALENTS_PRIEST.PROTECTOR_OF_THE_FRAIL_TALENT} /> talent.</>, Vetyst),
  change(date(2025, 3, 14), <>Enable spec for Midnight</>, Vetyst),
];
