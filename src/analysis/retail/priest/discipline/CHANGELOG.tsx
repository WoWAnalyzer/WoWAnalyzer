import { change, date } from 'common/changelog';
import { Vetyst } from 'CONTRIBUTORS';
import { TALENTS_PRIEST } from 'common/TALENTS';
import { SpellLink } from 'interface';
import SPELLS from 'common/SPELLS';

export default [
  change(date(2026, 3, 20), <>Update about page.</>, Vetyst),
  change(date(2026, 3, 18), <>Add <SpellLink spell={SPELLS.VOID_BLAST_CAST_DISC} /> to the spellbook.</>, Vetyst),
  change(date(2026, 3, 15), <>Implement statistics for <SpellLink spell={TALENTS_PRIEST.PROTECTOR_OF_THE_FRAIL_TALENT} /> talent.</>, Vetyst),
  change(date(2026, 3, 14), <>Enable spec for Midnight</>, Vetyst),
];
