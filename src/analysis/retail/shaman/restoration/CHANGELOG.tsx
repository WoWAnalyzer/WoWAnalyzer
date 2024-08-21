import { SpellLink } from 'interface'
import { TALENTS_SHAMAN } from 'common/TALENTS';
import SPELLS from 'common/SPELLS'
import { change, date } from 'common/changelog';
import {
  Seriousnes,
  Ypp,
  Texleretour,
} from 'CONTRIBUTORS';


// prettier-ignore
export default [
  change(date(2024, 8, 21), <>Bump supported version to 11.0.2. Set "guide" view as default. </>, Ypp),
  change(date(2024, 8, 18),<>Add <SpellLink spell={TALENTS_SHAMAN.CLOUDBURST_TOTEM_TALENT} /> cast breakdown based on overhealing done and new Section "Mana Efficiency" featuring cast breakdown of <SpellLink spell={TALENTS_SHAMAN.NATURES_SWIFTNESS_TALENT} /> based on mana saved.</> , Texleretour),
  change(date(2024, 8, 14), <>Added mana saved from <SpellLink spell={TALENTS_SHAMAN.SPIRITWALKERS_TIDAL_TOTEM_TALENT} /> statistic, scaled <SpellLink spell={SPELLS.HEALING_SURGE} /> mana cost for The War Within and fixed <SpellLink spell={TALENTS_SHAMAN.NATURES_SWIFTNESS_TALENT} /> statistic</>, Texleretour),
  change(date(2024, 8, 14), <>Deletion of Dragonflight tier sets from the code</>, Ypp),
  change(date(2024, 8, 13), <>Added mana saved from <SpellLink spell={TALENTS_SHAMAN.NATURES_SWIFTNESS_TALENT} /> statistic</>, Texleretour),
  change(date(2024, 8, 9), <>Initial support for Restoration Shaman in The War Within</>, Ypp),
  change(date(2024, 7, 27), <>Partial update for 11.0.0</>, Seriousnes),
];
