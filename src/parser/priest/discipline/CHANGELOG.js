import React from 'react';

import { Oratio, Reglitch, Zerotorescue, niseko, Khadaj, blazyb, Adoraci, Tiphess, Putro } from 'CONTRIBUTORS';
import SPELLS from 'common/SPELLS';
import SpellLink from 'common/SpellLink';
import ItemLink from 'common/ItemLink';
import ITEMS from 'common/ITEMS';
import { change, date } from 'common/changelog';

export default [
  change(date(2020, 7, 20), <>Fixed a bug where the <SpellLink id={SPELLS.ATONEMENT_BUFF.id} /> Applicator Breakdown chart would sometimes not load due to an error.</>, [Tiphess]),
  change(date(2020, 6, 20), <>Updated spell calculation tests to reflect <SpellLink id={SPELLS.ATONEMENT_BUFF.id} /> coefficent adjustment for 8.3.</>, Putro),
  change(date(2020, 6, 3), <>Added an <SpellLink id={SPELLS.ATONEMENT_BUFF.id} /> applicator breakdown chart.</>, [Tiphess]),
  change(date(2020, 5, 26), <>Added a <SpellLink id={SPELLS.ENDURING_LUMINESCENCE.id} /> analyzer and fixed the <SpellLink id={SPELLS.ATONEMENT_BUFF.id} /> coefficient to 50% to match the 8.3 nerf.</>, [Tiphess]),
  change(date(2019, 11, 10), <>Fixed minor inaccuracies with <SpellLink id={SPELLS.DEATH_THROES.id} /> analyzer.</>, [Reglitch]),
  change(date(2019, 9, 17), <>Added more information to the <SpellLink id={SPELLS.PURGE_THE_WICKED_BUFF.id} /> module.</>, [Khadaj]),
  change(date(2019, 8, 17), <>Updated cooldown of <SpellLink id={SPELLS.POWER_WORD_RADIANCE.id} /> from 18 seconds to 20.</>, [Adoraci]),
  change(date(2019, 8, 16), <>Fixed <SpellLink id={SPELLS.SHADOWFIEND.id} /> not showing as atonement source when <ItemLink id={ITEMS.GLYPH_OF_THE_LIGHTSPAWN.id} /> is selected.</>, [Adoraci]),
  change(date(2019, 8, 12), 'Added essence Lucid Dreams.', [blazyb]),
  change(date(2019, 7, 31), <>Added a <SpellLink id={SPELLS.DEATH_THROES.id} /> analyzer to disc.</>, [Khadaj]),
  change(date(2019, 7, 26), <>The Evangelism module now correctly shows buff count when casting <SpellLink id={SPELLS.EVANGELISM_TALENT.id} /> right after <SpellLink id={SPELLS.POWER_WORD_RADIANCE.id} />.</>, [Khadaj]),
  change(date(2018, 10, 17), `The Atonement sources tab should no longer display spells that do not cause atonement healing.`, [niseko]),
  change(date(2018, 9, 14), <>Fixed the <SpellLink id={SPELLS.TWIST_OF_FATE_TALENT_DISCIPLINE.id} /> analyzer.</>, [Zerotorescue]),
  change(date(2018, 7, 31), <>Rework of the <SpellLink id={SPELLS.GRACE.id} /> module.</>, [Oratio]),
  change(date(2018, 7, 26), <>Added support for the new <SpellLink id={SPELLS.PENANCE_CAST.id} /> event, thanks Blizzard.</>, [Reglitch]),
  change(date(2018, 7, 19), <>Fixed <SpellLink id={SPELLS.SINS_OF_THE_MANY_TALENT.id} /> bug.</>, [Oratio]),
  change(date(2018, 7, 24), <>Fix crash when using <SpellLink id={SPELLS.LUMINOUS_BARRIER_TALENT.id} />.</>, [Reglitch]),
  change(date(2018, 7, 18), <>Now with 100% more Batle for Azeroth.</>, [Reglitch]),
];
