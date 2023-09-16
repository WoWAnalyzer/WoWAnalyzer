import { change, date } from 'common/changelog';
import SPELLS from 'common/SPELLS';
import TALENTS from 'common/TALENTS/shaman';
import { HawkCorrigan, Putro, Zeboot, Maximaw, Zea, emallson, Vetyst, Periodic, ToppleTheNun, Awildfivreld } from 'CONTRIBUTORS';
import { SpellLink } from 'interface';

export default [
  change(date(2023, 9, 30), <>Use the correct spell id for <SpellLink spell={TALENTS.STORMKEEPER_1_ELEMENTAL_TALENT}/> casts.</>, Putro),
  change(date(2023, 8, 30), <>Add section on electrified shocks.</>, Awildfivreld),
  change(date(2023, 8, 13), <>Add section on always be casting, with graph.</>, Awildfivreld),
  change(date(2023, 8, 12), <>Fix and improve the resource graph, and add a section on it in the guide section.</>, Awildfivreld),
  change(date(2023, 8, 6), <>Add a section on proper use of single target spenders.</>, Awildfivreld),
  change(date(2023, 7, 26), <>Adds Flame Shock Guide section</>, Periodic),
  change(date(2023, 7, 16), <>Add a section on usage of Stormkeeper</>, Awildfivreld),
  change(date(2023, 7, 13), <>Fix a bug where the timeline showed too many abilities as empowered by <SpellLink spell={TALENTS.SURGE_OF_POWER_TALENT} /></>, Awildfivreld),
  change(date(2023, 7, 8), <>Add guide skeleton</>, Periodic),
  change(date(2023, 7, 8), 'Update SpellLink usage.', ToppleTheNun),
  change(date(2022, 7, 7), <>Basic cleanup for 10.1.0.</>, Periodic),
  change(date(2022, 10, 18), <>Cleanup majority of old spells.</>, Vetyst),
  change(date(2022, 8, 15), <>Track haste gained from <SpellLink spell={SPELLS.ELEMENTAL_BLAST} />.</>, Vetyst),
  change(date(2022, 3, 4), <>Fixed issue with <SpellLink spell={TALENTS.FIRE_ELEMENTAL_TALENT} /> on the checklist when <SpellLink spell={TALENTS.STORM_ELEMENTAL_TALENT} /> is selected.</>, emallson),
  change(date(2021, 6, 29), <>Bumped to 9.1, moved from partial.</>, Zea),
  change(date(2021, 6, 14), <>Added additional LIGHTNING_SHIELD_ELEMENTAL spellid. Fixed Stormkeeper damage calculation.</>, Zea),
  change(date(2021, 6, 11), <>Bumped version to 9.0.5, left as partial support. Also added spellID for elemental blast.</>, Zea),
  change(date(2021, 1, 28), <>Added check for suboptimal Chain Lightning.</>, Maximaw),
  change(date(2021, 1, 14), 'Updated integration tests to Shadowlands', Putro),
  change(date(2020, 12, 25), <>Allow Echoing Shock to Duplicate EQ</>, HawkCorrigan),
  change(date(2020, 12, 24), <>Fix the cast checker for Primal Elementals</>, HawkCorrigan),
  change(date(2020, 11, 8), <>Adding a module for Static Discharge</>, HawkCorrigan),
  change(date(2020, 11, 4), <>Fix Flame Shock</>, HawkCorrigan),
  change(date(2020, 10, 31), <>Add a suggestion for usage of Echoing Shock</>, HawkCorrigan),
  change(date(2020, 10, 25), <>Convert to Typescript</>, HawkCorrigan),
  change(date(2020, 10, 18), 'Converted legacy listeners to new event filters', Zeboot),
  change(date(2020, 8, 28), <>First go at removing obsolete Spells and Azerite.</>, HawkCorrigan),
];
