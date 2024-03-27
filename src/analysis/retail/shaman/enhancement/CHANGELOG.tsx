import { change, date } from 'common/changelog';
import SPELLS from 'common/SPELLS/shaman';
import TALENTS from 'common/TALENTS/shaman';
import { Taum, Vetyst, Vohrr, xunni, Seriousnes, ToppleTheNun, Putro } from 'CONTRIBUTORS';
import { SpellLink } from 'interface';

export default [
  change(date(2024, 3, 26), 'Remove support for Shadowlands tier set.', ToppleTheNun),
  change(date(2024, 1, 17), <>Mark as updated for 10.2.5, updating relevant statistics now that <SpellLink spell={TALENTS.PRIMORDIAL_WAVE_SPEC_TALENT} /> does elemental damage.</>, Seriousnes),
  change(date(2024, 1, 7), <><SpellLink spell={SPELLS.LIGHTNING_BOLT} /> with <SpellLink spell={TALENTS.PRIMORDIAL_WAVE_SPEC_TALENT} /> should require 8 <SpellLink spell={SPELLS.MAELSTROM_WEAPON} /> rather than 5</>, Seriousnes),
  change(date(2023, 12, 3), <>Fix for normalizer priority, update Ascendance analyzer to include cast timeline.</>, Seriousnes),
  change(date(2023, 12, 2), <>Marked as updated for 10.2</>, Seriousnes),
  change(date(2023, 11, 29), <>Defensives added to guide, <SpellLink spell={TALENTS.ELEMENTAL_BLAST_ELEMENTAL_TALENT} /> usage analysis, <SpellLink spell={TALENTS.ELEMENTAL_ASSAULT_TALENT} /> statistics</>, Seriousnes),
  change(date(2023, 11, 26), 'Resolve errors for unhandled abilities in the MealstromWeaponSpenders module.', Vetyst),
  change(date(2023, 11, 25), <>Updating APL to support 10.2, <SpellLink spell={TALENTS.HOT_HAND_TALENT} /> analysis, tier bonus statistics</>, Seriousnes),
  change(date(2023, 11, 22), <>Added detailed statistics for <SpellLink spell={SPELLS.MAELSTROM_WEAPON} /> source</>, Seriousnes),
  change(date(2023, 9, 22), <>Minor ajustment to APL for <SpellLink spell={TALENTS.ICE_STRIKE_TALENT} />, added <SpellLink spell={SPELLS.MAELSTROM_WEAPON} /> usage and efficiency tables</>, Seriousnes),
  change(date(2023, 9, 7), <>Updated to 10.1.7 compatibility</>, Seriousnes),
  change(date(2023, 9, 6), <>Reworked maelstrom tracker, added spender link and analyzer. Added maelstrom efficiency details</>, Seriousnes),
  change(date(2023, 9, 6), <>Fixed <SpellLink spell={TALENTS.DEEPLY_ROOTED_ELEMENTS_TALENT} /> statistic having one more proc than actually occured</>, Seriousnes),
  change(date(2023, 9, 6), <>Fix <SpellLink spell={TALENTS.ELEMENTAL_BLAST_ENHANCEMENT_TALENT} /> not working after 10.1.7.</>, Putro),
  change(date(2023, 8, 4), <>Added filler spell details to Ascendance analyzer</>, Seriousnes),
  change(date(2023, 7, 31), <>Updated example report</>, Seriousnes),
  change(date(2023, 7, 31), <>Reordered guide sections</>, Seriousnes),
  change(date(2023, 7, 30), <>Added <SpellLink spell={TALENTS.DEEPLY_ROOTED_ELEMENTS_TALENT} /> statistic</>, Seriousnes),
  change(date(2023, 7, 26), <>Swapped <SpellLink spell={TALENTS.ICE_STRIKE_TALENT} /> and <SpellLink spell={TALENTS.LAVA_LASH_TALENT} /> order in APL</>, Seriousnes),
  change(date(2023, 7, 26), <><SpellLink spell={TALENTS.ELEMENTAL_BLAST_ENHANCEMENT_TALENT} /> cooldown should not be reduced by haste</>, Seriousnes),
  change(date(2023, 7, 25), <>Adding <SpellLink spell={TALENTS.ASCENDANCE_ENHANCEMENT_TALENT} /> cooldown analysis</>, Seriousnes),
  change(date(2023, 7, 24), <>Added Windstrike analyzer for max casts</>, Seriousnes),
  change(date(2023, 7, 11), <>Added patch 10.1.5 details.</>, Seriousnes),
  change(date(2023, 7, 8), 'Update SpellLink usage.', ToppleTheNun),
  change(date(2023, 6, 30), <>Adding support for major cooldown usage, various bug fixes</>, Seriousnes),
  change(date(2023, 5, 25), <>Update Enhancement module to 10.1 compatibility</>, Seriousnes),
  change(date(2023, 5, 5), <>Fix crash in Earth Shield Module</>, Vohrr),
  change(date(2022, 1, 1), <>Add Frost Shock cooldown so it displays on timeline.</>, xunni),
  change(date(2022, 12, 31), <>Added Lava Lash per Hot Hand proc stats, fixed misreporting possible casts of Lava Lash.</>, Taum),
  change(date(2022, 12, 28), <>Remove outdated Ice Strike and Crashing Storms modules to avoid confusion.</>, xunni),
  change(date(2022, 11, 1), <>Cleanup changelog for Pre-patch.</>, Vetyst),
];
