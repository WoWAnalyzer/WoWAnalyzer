import { change, date } from 'common/changelog';
import { Earosselot } from 'CONTRIBUTORS';
import SHARED_CHANGELOG from 'analysis/retail/rogue/shared/CHANGELOG';
import TALENTS from 'common/TALENTS/rogue';
import { SpellLink } from 'interface';

export default [
  change(
    date(2026, 8, 17),
    <>
      Add <SpellLink spell={TALENTS.GOREMAWS_BITE_TALENT} /> to the ability list
    </>,
    Earosselot,
  ),
  change(date(2026, 3, 23), <>Fix Shadow Blades Module</>, Earosselot),
  change(date(2026, 3, 23), <>Adding Shadow Dance Module</>, Earosselot),
  change(date(2026, 3, 20), <>Enable Sublety for midnight</>, Earosselot),
  ...SHARED_CHANGELOG,
];