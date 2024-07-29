import { change, date } from 'common/changelog';
import SPELLS from 'common/SPELLS';
import { SpellLink } from 'interface';
import { Earosselot } from 'CONTRIBUTORS';

// prettier-ignore
export default [
  change(date(2024, 7, 30), <>Added Icy Veins to guides on About Section.</>, Earosselot),
  change(date(2024, 7, 30), <>Added support for <SpellLink spell={SPELLS.DEATHS_CHILL_BUFF} /> and <SpellLink spell={SPELLS.PERMAFROST_LANCES_BUFF} />.</>, Earosselot),
  change(date(2024, 7, 30), <>Initial The War Within support</>, Earosselot),
];
