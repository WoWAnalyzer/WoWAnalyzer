import React from 'react';

import { Oratio, Reglitch, Zerotorescue, niseko } from 'CONTRIBUTORS';
import SPELLS from 'common/SPELLS';
import SpellLink from 'common/SpellLink';
import { change, date } from 'common/changelog';

export default [
  change(date(2018, 10, 17), `The Atonement sources tab should no longer display spells that do not cause atonement healing.`, [niseko]),
  change(date(2018, 9, 14), <>Fixed the <SpellLink id={SPELLS.TWIST_OF_FATE_TALENT_DISCIPLINE.id} /> analyzer.</>, [Zerotorescue]),
  change(date(2018, 7, 31), <>Rework of the <SpellLink id={SPELLS.GRACE.id} /> module.</>, [Oratio]),
  change(date(2018, 7, 26), <>Added support for the new <SpellLink id={SPELLS.PENANCE_CAST.id} /> event, thanks Blizzard.</>, [Reglitch]),
  change(date(2018, 7, 19), <>Fixed <SpellLink id={SPELLS.SINS_OF_THE_MANY_TALENT.id} /> bug.</>, [Oratio]),
  change(date(2018, 7, 24), <>Fix crash when using <SpellLink id={SPELLS.LUMINOUS_BARRIER_TALENT.id} />.</>, [Reglitch]),
  change(date(2018, 7, 18), <>Now with 100% more Batle for Azeroth.</>, [Reglitch]),
];
