import { SpellLink } from 'interface'
import { TALENTS_SHAMAN } from 'common/TALENTS';
import SPELLS from 'common/SPELLS'
import { change, date } from 'common/changelog';
import { SHAMAN_TWW1_ID } from 'common/ITEMS/dragonflight';
import ItemSetLink from 'interface/ItemSetLink';
import {
  Seriousnes,
  Ypp,
  Texleretour,
  Vetyst,
  PandaGoesBaa,
} from 'CONTRIBUTORS';


// prettier-ignore
export default [
  change(date(2024, 10, 12), <>Fixed cooldowns for totems, <SpellLink spell={TALENTS_SHAMAN.TOTEMIC_RECALL_TALENT}/>, and <SpellLink spell={TALENTS_SHAMAN.ASCENDANCE_RESTORATION_TALENT}/> not properly accounting for cooldown reduction talents like <SpellLink spell={TALENTS_SHAMAN.FIRST_ASCENDANT_TALENT}/>.</>, PandaGoesBaa),
  change(date(2024, 10, 6), <>Fix another pre-pull error with <SpellLink spell={TALENTS_SHAMAN.SURGING_TOTEM_TALENT}/>.</>, Vetyst),
  change(date(2024, 9, 26), <>Fixed <SpellLink spell={TALENTS_SHAMAN.SURGING_TOTEM_TALENT}/> when used on pre-pull.</>, Vetyst),
  change(date(2024, 9, 15), <>Fixed <SpellLink spell={TALENTS_SHAMAN.DOWNPOUR_TALENT}/> and <SpellLink spell={TALENTS_SHAMAN.UNLEASH_LIFE_TALENT}/> interaction.</>, Ypp),
  change(date(2024, 8, 27), <>Updated <SpellLink spell={TALENTS_SHAMAN.ANCESTRAL_VIGOR_TALENT}/> for The War Within : one rank for the talent, for 10% max health increase. Updated Lives saved statistic, accounting for <SpellLink spell={TALENTS_SHAMAN.DOWNPOUR_TALENT}/>.</>, Ypp),
  change(date(2024, 8, 27), <>Updated <SpellLink spell={TALENTS_SHAMAN.DOWNPOUR_TALENT}/> mechanics for The War Within : no more cooldown, target cap lowered to 5 and new buff for 10% max health increase. Added <SpellLink spell={TALENTS_SHAMAN.DOWNPOUR_TALENT}/> to the healing contribution.</>, Ypp),
  change(date(2024, 8, 24), <>Statistic box for <SpellLink spell={TALENTS_SHAMAN.TIDEWATERS_TALENT}/> </>, Ypp),
  change(date(2024, 8, 22), <>Guide for <SpellLink spell={TALENTS_SHAMAN.SURGING_TOTEM_TALENT} />, including cooldown graph and Whirling motes consumption. </>, Ypp),
  change(date(2024, 8, 21), <>Bump supported version to 11.0.2. Set "guide" view as default. </>, Ypp),
  change(date(2024, 8, 21), <>Fixed an error causing the Cloudburst Totem module to crash if one was cast prepull</>, Texleretour),
  change(date(2024, 8, 21), <>Add <SpellLink spell={TALENTS_SHAMAN.STONE_BULWARK_TOTEM_TALENT} /> effective shielding done statistic and add <SpellLink spell={TALENTS_SHAMAN.DOWNPOUR_TALENT} /> procs wasted and average targets hit statistic</>, Texleretour),
  change(date(2024, 8, 18), <>Implement <ItemSetLink id={SHAMAN_TWW1_ID}>Nerub-ar tier set</ItemSetLink> for Resto.</>, Ypp),
  change(date(2024, 8, 18),<>Add <SpellLink spell={TALENTS_SHAMAN.CLOUDBURST_TOTEM_TALENT} /> cast breakdown based on overhealing done and new Section "Mana Efficiency" featuring cast breakdown of <SpellLink spell={TALENTS_SHAMAN.NATURES_SWIFTNESS_TALENT} /> based on mana saved.</> , Texleretour),
  change(date(2024, 8, 14), <>Added mana saved from <SpellLink spell={TALENTS_SHAMAN.SPIRITWALKERS_TIDAL_TOTEM_TALENT} /> statistic, scaled <SpellLink spell={SPELLS.HEALING_SURGE} /> mana cost for The War Within and fixed <SpellLink spell={TALENTS_SHAMAN.NATURES_SWIFTNESS_TALENT} /> statistic</>, Texleretour),
  change(date(2024, 8, 14), <>Deletion of Dragonflight tier sets from the code</>, Ypp),
  change(date(2024, 8, 13), <>Added mana saved from <SpellLink spell={TALENTS_SHAMAN.NATURES_SWIFTNESS_TALENT} /> statistic</>, Texleretour),
  change(date(2024, 8, 9), <>Initial support for Restoration Shaman in The War Within</>, Ypp),
  change(date(2024, 7, 27), <>Partial update for 11.0.0</>, Seriousnes),
];
