import { change, date } from 'common/changelog';
import { Texleretour, Squided } from 'CONTRIBUTORS';
import { ResourceLink } from 'interface';
import RESOURCE_TYPES from 'game/RESOURCE_TYPES';

export default [
  change(date(2024, 8, 16), <>Add The War Within initial support and swapped to guide vue. The new guide includes cast 
  efficiency and breakdown charts of Holy Paladin's most important spells and cooldowns; as well as <ResourceLink id={RESOURCE_TYPES.HOLY_POWER.id} /> usage, 
  explanations and more ! </>, Texleretour),
  change(date(2024, 8, 3), <>Deprecate unused Dragonflight functionality.</>, Squided),
];
