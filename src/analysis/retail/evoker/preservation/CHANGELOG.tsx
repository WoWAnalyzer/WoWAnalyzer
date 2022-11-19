import { change, date } from 'common/changelog';
import { TALENTS_EVOKER } from 'common/TALENTS';
import { Tyndi, Vohrr } from 'CONTRIBUTORS';
import { SpellLink } from 'interface';

export default [
  change(date(2022, 11, 18), <>Added <SpellLink id={TALENTS_EVOKER.CALL_OF_YSERA_TALENT.id}/> module.</>, Vohrr),
  change(date(2022, 11, 16), <>Added <SpellLink id={TALENTS_EVOKER.GRACE_PERIOD_TALENT.id}/> module</>, Vohrr),
  change(date(2022, 11, 16), <>Added <SpellLink id={TALENTS_EVOKER.REVERSION_TALENT.id}/> module</>, Vohrr),
  change(date(2022, 11, 14), <>Added preliminary hot tracking, cast attributions, & cast normalizers for Echo handling. Updated <SpellLink id={TALENTS_EVOKER.SPIRITBLOOM_TALENT.id}/> and <SpellLink id={TALENTS_EVOKER.DREAM_BREATH_TALENT.id}/> modules</>, Vohrr),
  change(date(2022, 10, 25), 'Updated abilities list to include all available abilities.', Tyndi),
  change(date(2022, 10, 19), 'Added module tracking healing effected by mastery.', Tyndi),
  change(date(2022, 9, 30), <>First pass at adding initial modules to Preservation</>, Tyndi),
];
