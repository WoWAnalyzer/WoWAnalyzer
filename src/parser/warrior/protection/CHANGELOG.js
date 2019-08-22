// eslint-disable-next-line no-unused-vars
import React from 'react';

import SPELLS from 'common/SPELLS';
import SpellLink from 'common/SpellLink';

import { Zerotorescue, Abelito75 } from 'CONTRIBUTORS';
import { change, date } from 'common/changelog';

export default [
  change(date(2019, 8, 22),<>Updated cooldown tracking when <SpellLink id={SPELLS.ANGER_MANAGEMENT_TALENT.id} /> is talented. Also added visions of perfection so we have no more missing spell.  </>,Abelito75),
  change(date(2019, 8, 15),<>Buff tracking changed for timeline.</>,Abelito75),
  change(date(2019, 8, 15),<>Shield Slam module created for assuming possible casts.</>,Abelito75),
  change(date(2019, 8, 9),<>Big Overhaul to Checklist. We also have a working checklist again</>,Abelito75),
  change(date(2019, 7, 31),<>We have a supporter</>,Abelito75),
  change(date(2019, 7, 20), 'Sorry, this spec has no contributors.', Zerotorescue),
];
