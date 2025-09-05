import { change, date } from 'common/changelog';
import SPELLS from 'common/SPELLS/classic';
import { emallson } from 'CONTRIBUTORS';
import SpellLink from 'interface/SpellLink';

export default [
  change(
    date(2025, 8, 25),
    <>
      Add <SpellLink spell={SPELLS.VENGEANCE_BUFF} /> section and adjust parsing rotation detection
    </>,
    emallson,
  ),
  change(date(2025, 8, 9), 'Add rotational analysis', emallson),
  change(date(2025, 7, 30), 'Initial support for Brewmaster Monk', emallson),
];
