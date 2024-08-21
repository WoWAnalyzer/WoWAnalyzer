import { change, date } from 'common/changelog';
import { Texleretour, Squided } from 'CONTRIBUTORS';
import { ResourceLink, SpellLink } from 'interface';
import RESOURCE_TYPES from 'game/RESOURCE_TYPES';
import { TALENTS_PALADIN } from 'common/TALENTS';

export default [
  change(date(2024, 8, 21), <>Add <SpellLink spell={TALENTS_PALADIN.LIGHTS_PROTECTION_TALENT}/> DRPS statistic and <SpellLink spell={TALENTS_PALADIN.OVERFLOWING_LIGHT_TALENT}/> effective absorb statistic</>, Texleretour),
  change(date(2024, 8, 16), <>Add The War Within initial support and swapped to guide vue. The new guide includes cast 
  efficiency and breakdown charts of Holy Paladin's most important spells and cooldowns; as well as <ResourceLink id={RESOURCE_TYPES.HOLY_POWER.id} /> usage, 
  explanations and more ! </>, Texleretour),
  change(date(2024, 8, 3), <>Deprecate unused Dragonflight functionality.</>, Squided),
];
