import { change, date } from 'common/changelog';
import { Texleretour, squided, Tialyss, emallson, swirl } from 'CONTRIBUTORS';
import { ResourceLink, SpellLink } from 'interface';
import RESOURCE_TYPES from 'game/RESOURCE_TYPES';
import { TALENTS_PALADIN } from 'common/TALENTS';
import SPELLS from 'common/SPELLS';

// prettier-ignore
export default [
  change(date(2025, 6, 2), <>Adjusted verbiage of guide, added new modules, and modernized + fixed existing modules for TWW.</>, swirl),
  change(date(2025, 5, 27), '11.1.5 bump and Holy Power guide update', Texleretour),
  change(date(2024, 11, 18), 'Remove Seal of Alacrity and handle other talent changes from 11.0.5', emallson),
  change(date(2024, 10, 4), <>Fix uptime issues regarding GCDs and cooldowns of <SpellLink spell={TALENTS_PALADIN.HOLY_ARMAMENTS_TALENT}/>, <SpellLink spell={SPELLS.SHIELD_OF_THE_RIGHTEOUS_HOLY}/> and <SpellLink spell={TALENTS_PALADIN.BLESSING_OF_SUMMER_TALENT}/> </>, Texleretour),
  change(date(2024, 9, 19), <>Add <SpellLink spell={TALENTS_PALADIN.ETERNAL_FLAME_TALENT}/>, <SpellLink spell={TALENTS_PALADIN.DAWNLIGHT_TALENT}/>, <SpellLink spell={TALENTS_PALADIN.SUNS_AVATAR_TALENT}/>, and <SpellLink spell={TALENTS_PALADIN.TRUTH_PREVAILS_TALENT}/></>, Tialyss),
  change(date(2024, 8, 21), <>Add <SpellLink spell={TALENTS_PALADIN.OVERFLOWING_LIGHT_TALENT}/> effective absorb statistic</>, Texleretour),
  change(date(2024, 8, 16), <>Add The War Within initial support and swapped to guide vue. The new guide includes cast
  efficiency and breakdown charts of Holy Paladin's most important spells and cooldowns; as well as <ResourceLink id={RESOURCE_TYPES.HOLY_POWER.id} /> usage,
  explanations and more ! </>, Texleretour),
  change(date(2024, 8, 3), <>Deprecate unused Dragonflight functionality.</>, squided),
];
