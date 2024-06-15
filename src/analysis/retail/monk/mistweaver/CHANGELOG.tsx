import { change, date } from 'common/changelog';
import { TALENTS_MONK } from 'common/TALENTS';
//import SPELLS from 'common/SPELLS';
//import { TALENTS_MONK } from 'common/TALENTS';
import { Vohrr } from 'CONTRIBUTORS';
import SpellLink from 'interface/SpellLink';
//import { SpellLink } from 'interface';



export default [
  change(date(2024, 6, 14), <>Add <SpellLink spell={TALENTS_MONK.LOTUS_INFUSION_TALENT}/> module.</>, Vohrr),
  change(date(2024, 6, 14), <>Enable Mistweaver for The War Within and Spells and Abilities cleanup</>, Vohrr),
  change(date(2024, 6, 10), <>The War Within initial commit - removing modules for deleted talents.</>, Vohrr),
];
