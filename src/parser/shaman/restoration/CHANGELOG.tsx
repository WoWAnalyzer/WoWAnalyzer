import React from 'react';

import { niseko, Abelito75 } from 'CONTRIBUTORS';
import SPELLS from 'common/SPELLS';
import SpellLink from 'common/SpellLink';
import { change, date } from 'common/changelog';

export default [
  change(date(2020, 10, 13), `Made almost all of Restoration Shaman localizable.`, niseko),
  change(date(2020, 10, 13), <>Added the potency conduits <SpellLink id={SPELLS.EMBRACE_OF_EARTH.id} />, <SpellLink id={SPELLS.HEAVY_RAINFALL.id} /> and <SpellLink id={SPELLS.SWIRLING_CURRENTS.id} />.</>, Abelito75),
  change(date(2020, 10, 13), (
    <>
      Updated Restoration Shaman for Shadowlands.<br />
      Changes include:<br />
      <ul>
        <li>Coming soon.</li>
      </ul>
    </>
  ), [niseko]),
];
