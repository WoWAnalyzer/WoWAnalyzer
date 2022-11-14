import { change, date } from 'common/changelog';
import SPELLS from 'common/SPELLS';
import { TALENTS_MONK } from 'common/TALENTS';
import { emallson, Trevor, ToppleTheNun, Vetyst, Vohrr } from 'CONTRIBUTORS';
import { SpellLink } from 'interface';


export default [
  change(date(2022, 11, 13), <>Fix load conditions for some Mistweaver talents</>, Trevor),
  change(date(2022, 11, 12), <>Updated the spell icon for <SpellLink id={TALENTS_MONK.ENVELOPING_BREATH_TALENT.id}/></>, Vohrr),
  change(date(2022, 11, 12), <>Cleanup covenant files for Mistweaver</>, Trevor),
  change(date(2022, 11, 11), <>Combined the <SpellLink id={TALENTS_MONK.RISING_SUN_KICK_TALENT.id}/> module and moved into general. Reordered the statistics in general to make more sense.</>, Vohrr),
  change(date(2022, 11, 9), <>Improve accuracy of healing statistic for <SpellLink id={TALENTS_MONK.RISING_MIST_TALENT.id}/> and <SpellLink id={TALENTS_MONK.UPWELLING_TALENT.id}/></>, Trevor),
  change(date(2022, 11, 9), <>Cleanup labels for talents</>, Trevor),
  change(date(2022, 11, 8), <>Cleanup covenant files for Mistweaver</>, Trevor),
  change(date(2022, 11, 9), <>Fixed changelog breaking the build</>, Vohrr),
  change(date(2022, 11, 9), <>Removed shadowlands spell references from the <SpellLink id={TALENTS_MONK.INVOKE_CHI_JI_THE_RED_CRANE_TALENT.id}/> module and updated the statistic to use TalentSpellText. Added Vohrr to mistweaver contributors. </>, Vohrr),
  change(date(2022, 11, 8), <>Add module for <SpellLink id={TALENTS_MONK.SAVE_THEM_ALL_TALENT}/></>, Trevor),
  change(date(2022, 11, 8), <>Added module for <SpellLink id={TALENTS_MONK.UNISON_TALENT}/></>, Vohrr),
  change(date(2022, 11, 8), <>Updated the <SpellLink id={SPELLS.GUSTS_OF_MISTS.id}/> from <SpellLink id={TALENTS_MONK.ESSENCE_FONT_TALENT.id}/> module to show healing contribution and <SpellLink id={TALENTS_MONK.INVOKE_CHI_JI_THE_RED_CRANE_TALENT.id}/> contribution when talented.</>, Vohrr), 
  change(date(2022, 11, 8), <>Readded the tooltip for average renewing mists during <SpellLink id={TALENTS_MONK.MANA_TEA_TALENT.id}/> and updated wording to 'mana saved per cast'</>, Vohrr),
  change(date(2022, 11, 8), <> Fix and update for <SpellLink id={TALENTS_MONK.SUMMON_JADE_SERPENT_STATUE_TALENT.id}/> uptime</>, Vohrr),
  change(date(2022, 11, 8), <>Fixed <SpellLink id={TALENTS_MONK.NOURISHING_CHI_TALENT.id}/> showing up when not talented</>, Vohrr),
  change(date(2022, 11, 8), <>Consolidated <SpellLink id={TALENTS_MONK.MANA_TEA_TALENT.id}/> modules into one statistics box</>, Vohrr),
  change(date(2022, 11, 4), <>Remove Abelito75 from the contribution list.</>, Vetyst),
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
