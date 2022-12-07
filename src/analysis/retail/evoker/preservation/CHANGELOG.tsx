import { change, date } from 'common/changelog';
import SPELLS from 'common/SPELLS';
import { TALENTS_EVOKER } from 'common/TALENTS';
import { Trevor, Tyndi, Vohrr } from 'CONTRIBUTORS';
import { SpellLink } from 'interface';

export default [
  change(date(2022, 12, 4), <>Mark Preservation Evoker as fully supported</>, Trevor),
  change(date(2022, 12, 4), <>Added <SpellLink id={TALENTS_EVOKER.TIME_LORD_TALENT.id}/> module</>, Trevor),
  change(date(2022, 12, 4), <>Add <SpellLink id={TALENTS_EVOKER.DREAM_FLIGHT_TALENT.id}/> module and update checklist</>, Trevor),
  change(date(2022, 12, 4), <>Add <SpellLink id={TALENTS_EVOKER.RENEWING_BREATH_TALENT.id}/> module</>, Trevor),
  change(date(2022, 12, 4), <>Added module for <SpellLink id={TALENTS_EVOKER.FIELD_OF_DREAMS_TALENT.id}/></>, Trevor),
  change(date(2022, 12, 4), <>Add suggestion for <SpellLink id={TALENTS_EVOKER.ESSENCE_BURST_TALENT.id}/> based on buffs consumed</>, Trevor),
  change(date(2022, 12, 3), <>Fixed empty <SpellLink id={TALENTS_EVOKER.ESSENCE_BURST_TALENT.id}/> chart when player never gains the buff</>, Trevor),
  change(date(2022, 11, 29), <>Added <SpellLink id={SPELLS.EMERALD_BLOSSOM.id}/> module</>, Trevor),
  change(date(2022, 11, 27), <>Add modules for <SpellLink id={TALENTS_EVOKER.ECHO_TALENT.id}/> and <SpellLink id={TALENTS_EVOKER.RESONATING_SPHERE_TALENT.id}/></>, Trevor),
  change(date(2022, 11, 22), 'Cleanup Preservation Evoker files', Trevor),
  change(date(2022, 11, 22), <>Added <SpellLink id={TALENTS_EVOKER.ESSENCE_BURST_TALENT}/> module</>, Trevor),
  change(date(2022, 11, 21), 'Updated contributor and support status for Preservation', Vohrr),
  change(date(2022, 11, 18), <>Added <SpellLink id={TALENTS_EVOKER.CALL_OF_YSERA_TALENT.id}/> module.</>, Vohrr),
  change(date(2022, 11, 16), <>Updated removed shields from Mastery Effectiveness for a rework and relabeled and added a tooltip indicating such</>, Vohrr),
  change(date(2022, 11, 16), <>Added <SpellLink id={TALENTS_EVOKER.GRACE_PERIOD_TALENT.id}/> module</>, Vohrr),
  change(date(2022, 11, 16), <>Added <SpellLink id={TALENTS_EVOKER.REVERSION_TALENT.id}/> module</>, Vohrr),
  change(date(2022, 11, 14), <>Added preliminary hot tracking, cast attributions, & cast normalizers for Echo handling. Updated <SpellLink id={TALENTS_EVOKER.SPIRITBLOOM_TALENT.id}/> and <SpellLink id={TALENTS_EVOKER.DREAM_BREATH_TALENT.id}/> modules</>, Vohrr),
  change(date(2022, 10, 25), 'Updated abilities list to include all available abilities.', Tyndi),
  change(date(2022, 10, 19), 'Added module tracking healing effected by mastery.', Tyndi),
  change(date(2022, 9, 30), <>First pass at adding initial modules to Preservation</>, Tyndi),
];
