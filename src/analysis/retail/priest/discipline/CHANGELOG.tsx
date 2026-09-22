import { change, date } from 'common/changelog';
import { Thias, Vetyst, WillyRS, Fyperia } from 'CONTRIBUTORS';
import { TALENTS_PRIEST } from 'common/TALENTS';
import { SpellLink } from 'interface';
import SPELLS from 'common/SPELLS';

export default [
  change(date(2026, 8, 31), <>Added support and statistics for <SpellLink spell={TALENTS_PRIEST.MIND_BLAST_TALENT} /> CDR from Midnight Season 2 Tier Set 2-piece bonus.</>, Fyperia),
  change(date(2026, 8, 29), <>Updated incorrect cooldown for <SpellLink spell={TALENTS_PRIEST.POWER_WORD_RADIANCE_TALENT} />.</>, Fyperia),
  change(date(2026, 8, 29), <>Updated proc checks for <SpellLink spell={SPELLS.MASTER_THE_DARKNESS_BUFF} /> for 12.1 updates.</>, Fyperia),
  change(date(2026, 5, 1), <>Added proc checks for <SpellLink spell={SPELLS.MASTER_THE_DARKNESS_BUFF} /> for Discipline Priest.</>, WillyRS),
  change(date(2026, 4, 11), <>Added Defensive usage to guide section.</>, Thias),
  change(date(2026, 3, 22), <>Introduced Guide for <SpellLink spell={SPELLS.PENANCE_CAST} /> usage and updated interactions with <SpellLink spell={TALENTS_PRIEST.CASTIGATION_TALENT} />, <SpellLink spell={TALENTS_PRIEST.HARSH_DISCIPLINE_TALENT} /> and <SpellLink spell={TALENTS_PRIEST.TWINSIGHT_TALENT} />.</>, Vetyst),
  change(date(2026, 3, 20), <>Updated several StatisticBox deprecations.</>, Vetyst),
  change(date(2026, 3, 20), <>Add <SpellLink spell={SPELLS.SHADOW_WORD_PAIN} /> uptime suggestions to the guide.</>, Vetyst),
  change(date(2026, 3, 20), <>Update about page.</>, Vetyst),
  change(date(2026, 3, 18), <>Add <SpellLink spell={SPELLS.VOID_BLAST_CAST_DISC} /> to the spellbook.</>, Vetyst),
  change(date(2026, 3, 15), <>Implement statistics for <SpellLink spell={TALENTS_PRIEST.PROTECTOR_OF_THE_FRAIL_TALENT} /> talent.</>, Vetyst),
  change(date(2026, 3, 14), <>Enable spec for Midnight</>, Vetyst),
];
