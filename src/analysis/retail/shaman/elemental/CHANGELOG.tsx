import { change, date } from 'common/changelog';
import SPELLS from 'common/SPELLS';
import TALENTS from 'common/TALENTS/shaman';
import { HawkCorrigan, Putro, Zeboot, Maximaw, Zea, emallson, Vetyst } from 'CONTRIBUTORS';
import { SpellLink } from 'interface';

export default [
  change(date(2022, 10, 18), <>Cleanup majority of old spells.</>, Vetyst),
  change(date(2022, 8, 15), <>Track haste gained from <SpellLink id={SPELLS.ELEMENTAL_BLAST.id} />.</>, Vetyst),
  change(date(2022, 3, 4), <>Fixed issue with <SpellLink id={TALENTS.FIRE_ELEMENTAL_TALENT.id} /> on the checklist when <SpellLink id={TALENTS.STORM_ELEMENTAL_TALENT.id} /> is selected.</>, emallson),
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
