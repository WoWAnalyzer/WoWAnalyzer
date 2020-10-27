import React from 'react';

import { niseko, Abelito75 } from 'CONTRIBUTORS';
import SPELLS from 'common/SPELLS';
import SpellLink from 'common/SpellLink';
import { change, date } from 'common/changelog';

export default [
  change(date(2020, 10, 26), <>Added statistics, suggestions and checklist entries for <SpellLink id={SPELLS.WATER_SHIELD.id} /> and <SpellLink id={SPELLS.EARTH_SHIELD.id} />.</>, niseko),
  change(date(2020, 10, 26), <>Added statistics, suggestions and checklist entries for <SpellLink id={SPELLS.SURGE_OF_EARTH_TALENT.id} />.</>, niseko),
  change(date(2020, 10, 23), <>Added a statistic for <SpellLink id={SPELLS.MANA_TIDE_TOTEM_CAST.id} />.</>, niseko),
  change(date(2020, 10, 22), <>Added a module to show the estimated damage reduction from <SpellLink id={SPELLS.SPIRIT_LINK_TOTEM.id} />, as Blizzard finally added the buff to combat logs.</>, niseko),
  change(date(2020, 10, 17), `Fixed imports so we stop crashing!`, Abelito75),
  change(date(2020, 10, 17), `Made almost all of Restoration Shaman localizable.`, niseko),
  change(date(2020, 10, 16), <>Fixed <SpellLink id={SPELLS.UNLEASH_LIFE_TALENT.id} /> not displaying its full healing contribution.</>, niseko),
  change(date(2020, 10, 13), <>Added the potency conduits <SpellLink id={SPELLS.EMBRACE_OF_EARTH.id} />, <SpellLink id={SPELLS.HEAVY_RAINFALL.id} /> and <SpellLink id={SPELLS.SWIRLING_CURRENTS.id} />.</>, Abelito75),
  change(date(2020, 10, 13), (
    <>
      Updated Restoration Shaman for Shadowlands.<br />
      Changes include:<br />
      <ul>
        <li>Updated Abilities.</li>
        <li>Added the new Abilities.</li>
        <li>Don't use primal strike.</li>
        <li>More coming soon.</li>
      </ul>
    </>
  ), niseko),
];
