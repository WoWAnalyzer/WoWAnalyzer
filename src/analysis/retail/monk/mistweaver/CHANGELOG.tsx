import { change, date } from 'common/changelog';
import SPELLS from 'common/SPELLS';
import { TALENTS_MONK } from 'common/TALENTS';
import { Vohrr } from 'CONTRIBUTORS';
import SpellLink from 'interface/SpellLink';

export default [
  change(date(2025, 11, 25), <>Added Season 1 Tier Set analysis for Mistweaver</>, Vohrr),
  change(date(2025, 11, 23), <>Minor bug fixes and typos. Added <SpellLink spell={TALENTS_MONK.MISTY_COALESCENCE_TALENT}/> module.</>, Vohrr),
  change(date(2025, 11, 23), <>Updated <SpellLink spell={TALENTS_MONK.YULONS_WHISPER_TALENT}/>, <SpellLink spell={TALENTS_MONK.MANA_TEA_TALENT}/> bug fixes,  <SpellLink spell={TALENTS_MONK.JADE_EMPOWERMENT_TALENT}/>, and <SpellLink spell={SPELLS.ANCIENT_TEACHINGS}/> for Midnight.</>, Vohrr),
  change(date(2025, 11, 23), <>Removed analysis references to Enveloping Breath and updated <SpellLink spell={TALENTS_MONK.INVOKE_CHI_JI_THE_RED_CRANE_TALENT}/> and <SpellLink spell={TALENTS_MONK.INVOKE_YULON_THE_JADE_SERPENT_TALENT}/> for Midnight.</>, Vohrr),
  change(date(2025, 11, 22), <>Updated mastery stats breakdown and removed <SpellLink spell={TALENTS_MONK.REVIVAL_TALENT}/> breakdown.</>, Vohrr),
  change(date(2025, 11, 22), <>Update <SpellLink spell={TALENTS_MONK.THUNDER_FOCUS_TEA_TALENT}/>, <SpellLink spell={TALENTS_MONK.UPLIFTED_SPIRITS_TALENT}/>, and <SpellLink spell={TALENTS_MONK.JADEFIRE_TEACHINGS_TALENT}/> for Midnight</>, Vohrr),
  change(date(2025, 11, 22), <>Update <SpellLink spell={TALENTS_MONK.RUSHING_WIND_KICK_MISTWEAVER_TALENT}/> and <SpellLink spell={TALENTS_MONK.VIVACIOUS_VIVIFICATION_TALENT}/> for Midnight.</>, Vohrr),
  change(date(2025, 11, 21), <>Update <SpellLink spell={TALENTS_MONK.MANA_TEA_TALENT}/> for Midnight.</>, Vohrr),
  change(date(2025, 11, 18), <>Initial commit for Midnight.</>, Vohrr),
];
