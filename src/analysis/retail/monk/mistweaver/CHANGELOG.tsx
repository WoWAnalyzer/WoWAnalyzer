import { change, date } from 'common/changelog';
import { TALENTS_MONK } from 'common/TALENTS';
import { emallson, Trevor, ToppleTheNun } from 'CONTRIBUTORS';
import { SpellLink } from 'interface';


export default [
  change(date(2022, 10, 26), <>Fix detection for cancelling <SpellLink id={TALENTS_MONK.ESSENCE_FONT_TALENT.id}/></>, Trevor),
  change(date(2022, 10, 25), <>Fix overcapping detection for <SpellLink id={TALENTS_MONK.VIVACIOUS_VIVIFICATION_TALENT.id}/></>, Trevor),
  change(date(2022, 10, 25), <>Fix another crash caused by <SpellLink id={TALENTS_MONK.INVOKE_YULON_THE_JADE_SERPENT_TALENT.id}/></>, Trevor),
  change(date(2022, 10, 25), <>Fix crashes caused by <SpellLink id={TALENTS_MONK.INVOKE_YULON_THE_JADE_SERPENT_TALENT.id}/></>, ToppleTheNun),
  change(date(2022, 10, 23), <>Added module for <SpellLink id={TALENTS_MONK.YULONS_WHISPER_TALENT.id}/></>, Trevor),
  change(date(2022, 10, 23), <>Enhance tooltip for <SpellLink id={TALENTS_MONK.UPLIFTED_SPIRITS_TALENT.id}/> module to breakdown CDR by spell</>, Trevor),
  change(date(2022, 10, 22), <>Added module for <SpellLink id={TALENTS_MONK.VIVACIOUS_VIVIFICATION_TALENT.id}/></>, Trevor),
  change(date(2022, 10 , 21), <> Fix cancellation detection for <SpellLink id={TALENTS_MONK.ESSENCE_FONT_TALENT}/> when buffed by <SpellLink id={TALENTS_MONK.THUNDER_FOCUS_TEA_TALENT}/> </>, Trevor),
  change(date(2022, 10, 16), <>Added module for <SpellLink id={TALENTS_MONK.MISTY_PEAKS_TALENT.id}/></>, Trevor),
  change(date(2022, 10, 18), <>Fixed <SpellLink id={TALENTS_MONK.RISING_SUN_KICK_TALENT}/> uptime calculation and <SpellLink id={TALENTS_MONK.TEACHINGS_OF_THE_MONASTERY_TALENT}/></>, Trevor),
  change(date(2022, 10, 16), <>Fixed Uplifted Spirits CDR</>, Trevor),
  change(date(2022, 10, 13), <>Cleaned up MW spells/talents files</>, Trevor),
  change(date(2022, 10, 13), <>Updated Rising Mist module for Dragonflight</>, Trevor),
  change(date(2022, 10, 9), <>Added Secret Infusion haste buff and fixed <SpellLink id={TALENTS_MONK.UPLIFTED_SPIRITS_TALENT.id}/></>, Trevor),
  change(date(2022, 10, 8), <>Added support for existing MW talents</>, Trevor),
  change(date(2022, 9, 4), <>Updated guide link in checklist.</>, emallson),
];
