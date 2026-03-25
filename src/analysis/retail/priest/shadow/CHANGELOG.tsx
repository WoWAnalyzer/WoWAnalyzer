import { change, date } from 'common/changelog';
//import SPELLS from 'common/SPELLS';
import TALENTS from 'common/TALENTS/priest';
import { DoxAshe, Vetyst } from 'CONTRIBUTORS';
import { SpellLink } from 'interface';

export default [
  change(date(2026, 3, 14), <>Updated spellbook</>,Vetyst),
  change(date(2026, 2, 24), <>Fix issues in guide view with <SpellLink spell={TALENTS.COLLAPSING_VOID_TALENT}/> </>,DoxAshe),
  change(date(2026, 2, 23), <>Fix issues in guide view with <SpellLink spell={TALENTS.SHADOW_WORD_MADNESS_TALENT}/> and <SpellLink spell={TALENTS.VOIDFORM_TALENT}/></>,DoxAshe),
  change(date(2026, 1, 10), <>Enable spec for Midnight</>,DoxAshe),
];
