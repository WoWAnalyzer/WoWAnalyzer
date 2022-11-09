import { change, date } from 'common/changelog';
import { TALENTS_MONK } from 'common/TALENTS';
import { emallson, Trevor, ToppleTheNun, Vetyst, Vohrr } from 'CONTRIBUTORS';
import { SpellLink } from 'interface';


export default [
  change(date(2022, 11, 8), <>Readded the tooltip for average renewing mists during <SpellLink id={TALENTS_MONK.MANA_TEA_TALENT.id}/> and updated wording to 'mana saved per cast'</>, Vohrr),
  change(date(2022, 11, 8), <> Fix and update for <SpellLink id={TALENTS_MONK.SUMMON_JADE_SERPENT_STATUE_TALENT.id}/> uptime</>, Vohrr),
  change(date(2022, 11, 8), <>Fixed <SpellLink id={TALENTS_MONK.NOURISHING_CHI_TALENT.id}/> showing up when not talented</>, Vohrr),
  change(date(2022, 11, 8), <>Consolidated <SpellLink id={TALENTS_MONK.MANA_TEA_TALENT.id}/> modules into one statistics box</>, Vohrr),
  change(date(2022, 11, 4), <>Remove Abelito75 from the contribution list.</>, Vetyst),
  change(date(2022, 11, 3), <>Improve accuracy of healing statistic for <SpellLink id={TALENTS_MONK.RISING_MIST_TALENT.id}/> and <SpellLink id={TALENTS_MONK.UPWELLING_TALENT.id}/></>, Trevor),
  change(date(2022, 11, 1), <>Add support for extending <SpellLink id={TALENTS_MONK.ENVELOPING_MIST_TALENT.id}/> from <SpellLink id={TALENTS_MONK.MISTY_PEAKS_TALENT.id}/>  with <SpellLink id={TALENTS_MONK.RISING_MIST_TALENT.id}/></>, Trevor),
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
