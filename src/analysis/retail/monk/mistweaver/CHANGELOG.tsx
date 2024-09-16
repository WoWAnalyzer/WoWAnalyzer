import { change, date } from 'common/changelog';
import SPELLS from 'common/SPELLS';
import { TALENTS_MONK } from 'common/TALENTS';
import { Trevor, Vohrr } from 'CONTRIBUTORS';
import SpellLink from 'interface/SpellLink';

export default [
  change(date (2024, 9, 11), <>Add <SpellLink spell={TALENTS_MONK.STRENGTH_OF_THE_BLACK_OX_TALENT}/> guide section</>, Trevor),
  change(date (2024, 9, 11), <>Add <SpellLink spell={TALENTS_MONK.ZEN_PULSE_TALENT}/> guide section</>, Trevor),
  change(date (2024, 9, 10), <>Change <SpellLink spell={TALENTS_MONK.REVIVAL_TALENT}/> load conditions</>, Trevor),
  change(date (2024, 8, 1), <>Updated values from Beta tuning.</>, Vohrr),
  change(date (2024, 7, 31), <>Added <SpellLink spell={TALENTS_MONK.MENDING_PROLIFERATION_TALENT}/>, <SpellLink spell={TALENTS_MONK.TEAR_OF_MORNING_TALENT}/>, <SpellLink spell={TALENTS_MONK.CHI_HARMONY_TALENT}/>, <SpellLink spell={TALENTS_MONK.LOTUS_INFUSION_TALENT}/>, <SpellLink spell={TALENTS_MONK.ZEN_PULSE_TALENT}/>, and <SpellLink spell={TALENTS_MONK.CRANE_STYLE_TALENT}/> to Talent Breakdown.</>, Vohrr),
  change(date (2024, 7, 25), <>Logging cleanup.</>, Vohrr),
  change(date (2024, 7, 25), <>Add procs per minute metric to <SpellLink spell={TALENTS_MONK.ZEN_PULSE_TALENT}/>.</>, Vohrr),
  change(date (2024, 7, 25), <>Update <SpellLink spell={TALENTS_MONK.MENDING_PROLIFERATION_TALENT}/>.</>, Vohrr),
  change(date (2024, 7, 24), <>Bump patch support to 11.0 and sample log.</>, Vohrr),
  change(date (2024, 7, 23), <>Updated Talent values per July 17th tuning.</>, Vohrr),
  change(date (2024, 7, 4), <>Added <SpellLink spell={TALENTS_MONK.CELESTIAL_CONDUIT_TALENT}/>.</>, Vohrr),
  change(date (2024, 6, 29), <>Added <SpellLink spell={TALENTS_MONK.RESTORE_BALANCE_TALENT}/> module.</>, Vohrr),
  change(date (2024, 6, 29), <>Updated <SpellLink spell={TALENTS_MONK.TEAR_OF_MORNING_TALENT}/> module</>, Vohrr),
  change(date (2024, 6, 28), <>Added <SpellLink spell={TALENTS_MONK.HEART_OF_THE_JADE_SERPENT_TALENT}/> and updated healing efficiency metrics.</>, Vohrr),
  change(date (2024, 6, 20), <>Added <SpellLink spell={TALENTS_MONK.POOL_OF_MISTS_TALENT}/>.</>, Vohrr),
  change(date (2024, 6, 18), <>Updated <SpellLink spell={TALENTS_MONK.RISING_MIST_TALENT}/>, <SpellLink spell={TALENTS_MONK.RAPID_DIFFUSION_TALENT}/>, and <SpellLink spell={TALENTS_MONK.DANCING_MISTS_TALENT}/> to include healing contribution from <SpellLink spell={TALENTS_MONK.ZEN_PULSE_TALENT}/>.</>, Vohrr),
  change(date (2024, 6, 18), <>Updated <SpellLink spell={TALENTS_MONK.REFRESHING_JADE_WIND_TALENT}/>, <SpellLink spell={TALENTS_MONK.YULONS_WHISPER_TALENT}/>, and <SpellLink spell={TALENTS_MONK.TEACHINGS_OF_THE_MONASTERY_TALENT}/> for The War Within.</>, Vohrr),
  change(date (2024, 6, 18), <>Removed dragonflight tier set analysis, moved Tier 31 into <SpellLink spell={TALENTS_MONK.CHI_HARMONY_TALENT}/> module.</>, Vohrr),
  change(date(2024, 6, 18), <>Added Nerubar Palance Tier Set</>, Vohrr),
  change(date(2024, 6, 17), <>Bug fix for <SpellLink spell={SPELLS.VIVIFY}/> cast entry section of the guide.</>, Vohrr),
  change(date(2024, 6, 16), <>Added <SpellLink spell={TALENTS_MONK.ZEN_PULSE_TALENT}/>.</>, Vohrr),
  change(date(2024, 6, 16), <>Removed old checklist and suggestion thresholds. Updated <SpellLink spell={SPELLS.VIVIFY}/> event linking to fix cast entry bugs. Added healing boost statistic for <SpellLink spell={TALENTS_MONK.VIVACIOUS_VIVIFICATION_TALENT}/>.</>, Vohrr),
  change(date(2024, 6, 14), <>Added <SpellLink spell={TALENTS_MONK.CRANE_STYLE_TALENT}/> analysis.</>, Vohrr),
  change(date(2024, 6, 14), <>Update <SpellLink spell={SPELLS.GUSTS_OF_MISTS}/> source breakdown to include <SpellLink spell={TALENTS_MONK.JADEFIRE_STOMP_TALENT}/> and <SpellLink spell={TALENTS_MONK.CRANE_STYLE_TALENT}/>. </>, Vohrr),
  change(date(2024, 6, 14), <>Add <SpellLink spell={TALENTS_MONK.LOTUS_INFUSION_TALENT}/> module.</>, Vohrr),
  change(date(2024, 6, 14), <>Enable Mistweaver for The War Within and Spells and Abilities cleanup.</>, Vohrr),
  change(date(2024, 6, 10), <>The War Within initial commit - removing modules for deleted talents.</>, Vohrr),
];
