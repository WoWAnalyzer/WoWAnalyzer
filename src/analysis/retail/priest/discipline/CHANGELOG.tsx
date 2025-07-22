import { change, date } from 'common/changelog';
import { Hana, fel1ne, Saeldur, Vollmer, Vetyst } from 'CONTRIBUTORS';
import { SpellLink } from 'interface';
import { TALENTS_PRIEST } from 'common/TALENTS';

export default [
  change(date(2025, 6, 8), <>Add preparation section to overview.</>, Vetyst),
  change(date(2025, 6, 8), <>Fix duplicate spellbook entry of <SpellLink spell={TALENTS_PRIEST.POWER_INFUSION_TALENT.id} />.</>, Vetyst),
  change(date(2025, 4, 21), <>Update example log.</>, Vollmer),
  change(date(2025, 3, 29), <>More Updates for 11.1</>, Saeldur),
  change(date(2025, 3, 16), <>Updates for 11.1</>, Hana),
  change(date(2024, 12, 3), <>Add Void Blast to Words of the Pious, Void Summoner and Train of Thought.</>, Saeldur),
  change(date(2024, 10, 26), <>Fix atonement sources module.</>, fel1ne),
  change(date(2024, 9, 23), <>Add void blast to weal and woe</>, Hana),
  change(date(2024, 3, 9), <>The War Within Clean up.</>, Hana),
];
