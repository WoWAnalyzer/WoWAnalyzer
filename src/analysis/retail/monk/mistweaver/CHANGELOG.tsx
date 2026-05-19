import { change, date } from 'common/changelog';
import SPELLS from 'common/SPELLS';
import { TALENTS_MONK } from 'common/TALENTS';
import { swirl, Vohrr } from 'CONTRIBUTORS';
import SpellLink from 'interface/SpellLink';

// prettier-ignore
export default [
  change(date(2026, 5, 18), <>Fixed <SpellLink spell={TALENTS_MONK.VEIL_OF_PRIDE_TALENT} /> correctly evaluating 0-cloud casts.</>, swirl),
  change(date(2026, 5, 16), <>Refreshed UI elements of the performance modules in the Overview tab.</>, swirl),
  change(date(2026, 5, 14), <>Fixed a bug with <SpellLink spell={SPELLS.ANCIENT_TEACHINGS} /> events doubling on filters.</>, swirl),
  change(date(2026, 5, 13), <>Added <SpellLink spell={TALENTS_MONK.HEART_OF_THE_JADE_SERPENT_TALENT}/> CDR analysis.</>, swirl),
  change(date(2026, 5, 12), <>Improved cast analysis of <SpellLink spell={TALENTS_MONK.THUNDER_FOCUS_TEA_TALENT}/> cast efficiency.</>, swirl),
  change(date(2026, 4, 23), <>Fixed a bug with <SpellLink spell={TALENTS_MONK.SPIRITFONT_1_MISTWEAVER_TALENT} /> performance, fixed <SpellLink spell={TALENTS_MONK.SAVE_THEM_ALL_TALENT} /> showing as 0% for events without hitpoints data, removed <SpellLink spell={TALENTS_MONK.MANA_TEA_TALENT}/> reference from <SpellLink spell={TALENTS_MONK.STRENGTH_OF_THE_BLACK_OX_TALENT} />, and moved "casting while moving" module out of <SpellLink spell={TALENTS_MONK.WAY_OF_THE_SERPENT_TALENT}/>.</>, swirl),
  change(date(2026, 4, 15), <>Fixed a bug with <SpellLink spell={TALENTS_MONK.ZEN_PULSE_TALENT} /> statistic and guide subsection analysis when <SpellLink spell={TALENTS_MONK.SHEILUNS_GIFT_TALENT} /> is talented.</>, Vohrr),
  change(date(2026, 3, 29), <>Updated Celestial analysis, APL checks, and general healing cooldowns updates.</>, swirl),
  change(date(2026, 3, 24), <>Fixed <SpellLink spell={TALENTS_MONK.MISTY_COALESCENCE_TALENT} /> to correctly cap scaling at 20 players.</>, swirl),
  change(date(2026, 3, 21), <>Added <SpellLink spell={TALENTS_MONK.MORNING_BREEZE_TALENT} /> module.</>, swirl),
  change(date(2026, 3, 20), <>Updated <SpellLink spell={TALENTS_MONK.THUNDER_FOCUS_TEA_TALENT} /> perf box analysis</>, Vohrr),
  change(date(2026, 1, 30), <>Updated existing <SpellLink spell={TALENTS_MONK.SHEILUNS_GIFT_TALENT} /> modules, added <SpellLink spell={TALENTS_MONK.INVIGORATING_MISTS_TALENT} />, <SpellLink spell={TALENTS_MONK.EMPERORS_FAVOR_TALENT} />, and <SpellLink spell={TALENTS_MONK.TRANQUIL_TEA_TALENT} /> modules.</>, swirl),
  change(date(2026, 1, 22), <>Added <SpellLink spell={TALENTS_MONK.PEACEFUL_MENDING_TALENT} /> module.</>, swirl),
  change(date(2025, 1, 22), <>Updated <SpellLink spell={TALENTS_MONK.SAVE_THEM_ALL_TALENT} /> for Midnight.</>, swirl),
  change(date(2026, 1, 18), <>Added <SpellLink spell={TALENTS_MONK.SPIRITFONT_1_MISTWEAVER_TALENT} /> module.</>, swirl),
  change(date(2025, 12, 15), <>Added <SpellLink spell={TALENTS_MONK.WAY_OF_THE_CRANE_TALENT} /> and <SpellLink spell={TALENTS_MONK.WAY_OF_THE_SERPENT_TALENT} /> modules.</>, swirl),
  change(date(2025, 12, 12), <>Updated <SpellLink spell={TALENTS_MONK.TEAR_OF_MORNING_TALENT} /> for Midnight.</>, swirl),
  change(date(2025, 12, 5), <>Added <SpellLink spell={TALENTS_MONK.AMPLIFIED_RUSH_TALENT} /> statistic, removed Unison.</>, Vohrr),
  change(date(2025, 12, 2), <>Updated <SpellLink spell={TALENTS_MONK.RESTORE_BALANCE_TALENT} /> for Midnight and re-enabled <SpellLink spell={TALENTS_MONK.CELESTIAL_CONDUIT_MISTWEAVER_TALENT} /> for Mistweaver.</>, Vohrr),
  change(date(2025, 11, 25), <>Added Season 1 Tier Set analysis for Mistweaver</>, Vohrr),
  change(date(2025, 11, 23), <>Minor bug fixes and typos. Added <SpellLink spell={TALENTS_MONK.MISTY_COALESCENCE_TALENT} /> module.</>, Vohrr),
  change(date(2025, 11, 23), <>Updated <SpellLink spell={TALENTS_MONK.YULONS_WHISPER_TALENT} />, <SpellLink spell={TALENTS_MONK.MANA_TEA_TALENT} /> bug fixes,  <SpellLink spell={TALENTS_MONK.JADE_EMPOWERMENT_TALENT} />, and <SpellLink spell={SPELLS.ANCIENT_TEACHINGS} /> for Midnight.</>, Vohrr),
  change(date(2025, 11, 23), <>Removed analysis references to Enveloping Breath and updated <SpellLink spell={TALENTS_MONK.INVOKE_CHI_JI_THE_RED_CRANE_TALENT} /> and <SpellLink spell={TALENTS_MONK.INVOKE_YULON_THE_JADE_SERPENT_TALENT} /> for Midnight.</>, Vohrr),
  change(date(2025, 11, 22), <>Updated mastery stats breakdown and removed <SpellLink spell={TALENTS_MONK.REVIVAL_TALENT} /> breakdown.</>, Vohrr),
  change(date(2025, 11, 22), <>Update <SpellLink spell={TALENTS_MONK.THUNDER_FOCUS_TEA_TALENT} />, <SpellLink spell={TALENTS_MONK.UPLIFTED_SPIRITS_TALENT} />, and <SpellLink spell={TALENTS_MONK.JADEFIRE_TEACHINGS_TALENT} /> for Midnight</>, Vohrr),
  change(date(2025, 11, 22), <>Update <SpellLink spell={TALENTS_MONK.RUSHING_WIND_KICK_MISTWEAVER_TALENT} /> and <SpellLink spell={TALENTS_MONK.VIVACIOUS_VIVIFICATION_TALENT} /> for Midnight.</>, Vohrr),
  change(date(2025, 11, 21), <>Update <SpellLink spell={TALENTS_MONK.MANA_TEA_TALENT} /> for Midnight.</>, Vohrr),
  change(date(2025, 11, 18), <>Initial commit for Midnight.</>, Vohrr),
];
