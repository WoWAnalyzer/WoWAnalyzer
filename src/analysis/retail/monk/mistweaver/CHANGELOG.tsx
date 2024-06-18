import { change, date } from 'common/changelog';
import SPELLS from 'common/SPELLS';
import { TALENTS_MONK } from 'common/TALENTS';
import { Vohrr } from 'CONTRIBUTORS';
import SpellLink from 'interface/SpellLink';

export default [
  change(date(2024, 6, 17), <>Bug fix for <SpellLink spell={SPELLS.VIVIFY}/> cast entry section of the guide.</>, Vohrr),
  change(date(2024, 6, 16), <>Added <SpellLink spell={TALENTS_MONK.ZEN_PULSE_TALENT}/>.</>, Vohrr),
  change(date(2024, 6, 16), <>Removed old checklist and suggestion thresholds. Updated <SpellLink spell={SPELLS.VIVIFY}/> event linking to fix cast entry bugs. Added healing boost statistic for <SpellLink spell={TALENTS_MONK.VIVACIOUS_VIVIFICATION_TALENT}/>.</>, Vohrr),
  change(date(2024, 6, 14), <>Added <SpellLink spell={TALENTS_MONK.CRANE_STYLE_TALENT}/> analysis.</>, Vohrr),
  change(date(2024, 6, 14), <>Update <SpellLink spell={SPELLS.GUSTS_OF_MISTS}/> source breakdown to include <SpellLink spell={TALENTS_MONK.JADEFIRE_STOMP_TALENT}/> and <SpellLink spell={TALENTS_MONK.CRANE_STYLE_TALENT}/>. </>, Vohrr),
  change(date(2024, 6, 14), <>Add <SpellLink spell={TALENTS_MONK.LOTUS_INFUSION_TALENT}/> module.</>, Vohrr),
  change(date(2024, 6, 14), <>Enable Mistweaver for The War Within and Spells and Abilities cleanup.</>, Vohrr),
  change(date(2024, 6, 10), <>The War Within initial commit - removing modules for deleted talents.</>, Vohrr),
];
