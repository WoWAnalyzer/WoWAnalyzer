import { change, date } from 'common/changelog';
import { Sref } from 'CONTRIBUTORS';
import { SpellLink } from 'interface';
import { TALENTS_DRUID } from 'common/TALENTS/druid';

export default [
  change(date(2024, 8, 22), <><SpellLink spell={TALENTS_DRUID.CONVOKE_THE_SPIRITS_TALENT}/> tracker should now correctly detect procced <SpellLink spell={TALENTS_DRUID.RAVAGE_TALENT}/> casts.</>, Sref),
  change(date(2024, 8, 17), <>Marked updated for 11.0.2 and updated the spec's 'About' page.</>, Sref),
  change(date(2024, 8, 14), <>Updated spells to account for 11.0.2 balance patch.</>, Sref),
  change(date(2024, 7, 22), <>Refactored various modules to correctly handle <SpellLink spell={TALENTS_DRUID.RAVAGE_TALENT}/>. More updates for The War Within talent changes.</>, Sref),
  change(date(2024, 7, 14), <>Activating Feral Druid analyzer for The War Within! Hero talent analyzers not yet implemented.</>, Sref),
];
