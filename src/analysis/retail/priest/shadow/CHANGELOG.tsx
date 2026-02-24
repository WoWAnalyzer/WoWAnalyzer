import { change, date } from 'common/changelog';
//import SPELLS from 'common/SPELLS';
import TALENTS from 'common/TALENTS/priest';
import { DoxAshe } from 'CONTRIBUTORS';
import { SpellLink } from 'interface';

export default [
  change(date(2026, 2, 23), <>Fix issues in guide view with <SpellLink spell={TALENTS.SHADOW_WORD_MADNESS_TALENT}/> and <SpellLink spell={TALENTS.VOIDFORM_TALENT}/></>,DoxAshe),
  change(date(2026, 1, 10), <>Enable spec for Midnight</>,DoxAshe),
];
