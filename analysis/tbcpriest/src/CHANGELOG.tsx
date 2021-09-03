import { change, date } from 'common/changelog';
import * as SPELLS from './SPELLS';
import { Khadaj } from 'CONTRIBUTORS';
import { SpellLink } from 'interface';
import React from 'react';

export default [
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
