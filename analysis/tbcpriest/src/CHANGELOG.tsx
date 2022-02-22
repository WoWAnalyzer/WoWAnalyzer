import { change, date } from 'common/changelog';
import { Khadaj } from 'CONTRIBUTORS';
import { SpellLink } from 'interface';

import * as SPELLS from './SPELLS';

export default [
  change(
    date(2022, 2, 16),
    'TBC Priest Fixing CanceledCasts module.',
    Khadaj,
  ),
  change(
    date(2021, 9, 29),
    'TBC Priest Fixing mana efficiency and adding CanceledCasts module.',
    Khadaj,
  ),
  change(date(2021, 9, 2), 'TBC Priest T5 cleanup', Khadaj),
  change(date(2021, 9, 2), 'Adding more TBC checklist items', Khadaj),
  change(date(2021, 9, 1), 'Adding basic checklist for TBC and PoM analysis module', Khadaj),
  change(date(2021, 7, 12), 'Adding basic support for TBC Priests', Khadaj),
  change(
    date(2021, 9, 3),
    <>
      Adding card for <SpellLink id={SPELLS.SHADOW_FIEND} />
    </>,
    Khadaj,
  ),
  change(
    date(2021, 9, 3),
    <>
      Adding card for <SpellLink id={SPELLS.CIRCLE_OF_HEALING} /> and{' '}
      <SpellLink id={SPELLS.PRAYER_OF_HEALING} />
    </>,
    Khadaj,
  ),
];
