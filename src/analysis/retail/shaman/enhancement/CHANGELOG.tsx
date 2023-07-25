import { change, date } from 'common/changelog';
import { TALENTS_SHAMAN } from 'common/TALENTS';
import { Taum, Vetyst, Vohrr, xunni, Seriousnes, ToppleTheNun } from 'CONTRIBUTORS';
import { SpellLink } from 'interface';

export default [
  change(date(2023, 7, 25), <>Adding <SpellLink spell={TALENTS_SHAMAN.ASCENDANCE_ENHANCEMENT_TALENT} /> cooldown analysis</>, Seriousnes),
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
