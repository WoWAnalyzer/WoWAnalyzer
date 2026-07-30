import { change, date } from 'common/changelog';
//import SPELLS from 'common/SPELLS';
import TALENTS from 'common/TALENTS/priest';
import { DoxAshe, Thias, Vetyst } from 'CONTRIBUTORS';
import { SpellLink } from 'interface';

export default [
  change(date(2026, 4, 30), <>Fix <SpellLink spell={TALENTS.INSIDIOUS_IRE_TALENT}/> buff tracking and guide view</>,DoxAshe),
  change(date(2026, 4, 27), <>Add <SpellLink spell={TALENTS.INVOKED_NIGHTMARE_TALENT}/>, <SpellLink spell={TALENTS.TORMENTING_WHISPERS_TALENT}/>, <SpellLink spell={TALENTS.DESCENDING_DARKNESS_TALENT}/>, <SpellLink spell={TALENTS.SURGE_OF_INSANITY_TALENT}/>, <SpellLink spell={TALENTS.HAUNTING_SHADOWS_TALENT}/>, <SpellLink spell={TALENTS.MENTAL_DECAY_TALENT}/>, Phantom Menace, and <SpellLink spell={TALENTS.INSTILLED_DOUBT_TALENT}/> statistics</>,DoxAshe),
  change(date(2026, 4, 25), <>Fix Cooldown Efficiency of <SpellLink spell={TALENTS.POWER_INFUSION_TALENT}/> </>,DoxAshe),
  change(date(2026, 4, 11), <>Added Defensive usage to guide section.</>, Thias),
  change(date(2026, 3, 14), <>Updated spellbook</>,Vetyst),
  change(date(2026, 2, 24), <>Fix issues in guide view with <SpellLink spell={TALENTS.COLLAPSING_VOID_TALENT}/> </>,DoxAshe),
  change(date(2026, 2, 23), <>Fix issues in guide view with <SpellLink spell={TALENTS.SHADOW_WORD_MADNESS_TALENT}/> and <SpellLink spell={TALENTS.VOIDFORM_TALENT}/></>,DoxAshe),
  change(date(2026, 1, 10), <>Enable spec for Midnight</>,DoxAshe),
];
