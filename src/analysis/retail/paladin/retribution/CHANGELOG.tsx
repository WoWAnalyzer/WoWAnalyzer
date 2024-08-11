import { change, date } from 'common/changelog';
import { emallson, Humperella, Klamuz, ToppleTheNun, xizbow } from 'CONTRIBUTORS';
import { ItemLink } from 'interface';
import ITEMS from 'common/ITEMS';

export default [
  change(date(2024, 2, 13), 'Improve dragonflight 10.2.5 support', Humperella),
  change(date(2024, 1, 7), <>Add <ItemLink id={ITEMS.FYRALATH.id} /> to cooldown graph.</>, ToppleTheNun),
  change(date(2023, 7, 19), 'Make CooldownGraphSubsection generic enough that it can be used by other specs.', ToppleTheNun),
  change(date(2023, 7, 18), 'Show percentage wasted Holy Power instead of percentage at Holy Power cap.', ToppleTheNun),
  change(date(2023, 7, 16), 'First pass at a Guide for Ret Paladin.', ToppleTheNun),
  change(date(2023, 7, 3), 'Update SpellLink usage.', ToppleTheNun),
  change(date(2023, 4, 24), 'Fix more crashes related to 10.0.7 talent changes.', ToppleTheNun),
  change(date(2023, 3, 26), 'Fix crashes related to 10.0.7 talent changes', emallson),
  change(date(2023, 2, 3), <>Added Paladin Retribution Partial Support for Dragonflight 10.0.5</>, Klamuz),
  change(date(2022, 4, 15), <>Added Holy Power Generated Per Minute statistic</>, xizbow),
];
