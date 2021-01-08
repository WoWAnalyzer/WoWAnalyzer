import React from 'react';

import { niseko, Abelito75 } from 'CONTRIBUTORS';
import SPELLS from 'common/SPELLS';
import SpellLink from 'common/SpellLink';
import { change, date } from 'common/changelog';

export default [
  change(date(2020, 12, 15), <>Added support for <SpellLink id={SPELLS.PRIMORDIAL_WAVE_CAST.id} /> and <SpellLink id={SPELLS.CHAIN_HARVEST.id} />.</>, niseko),
  change(date(2020, 12, 9), <>Fixing loading errors due to hanging spellIds.</>, Abelito75),
  change(date(2020, 11, 8), <>Fixed <SpellLink id={SPELLS.PRIMAL_TIDE_CORE.id} /> module not catching the <SpellLink id={SPELLS.RIPTIDE.id} /> initial heal.</>, niseko),
  change(date(2020, 11, 23), `Updated everything to Shadowlands Level 60 values, prepatch logs will be showing inaccurate results.`, niseko),
  change(date(2020, 11, 8), <>Added the legendaries <SpellLink id={SPELLS.JONATS_NATURAL_FOCUS.id} /> and <SpellLink id={SPELLS.EARTHEN_HARMONY.id} />.</>, niseko),
  change(date(2020, 11, 8), <>Added the legendary <SpellLink id={SPELLS.PRIMAL_TIDE_CORE.id} />.</>, niseko),
  change(date(2020, 11, 8), <>Added the conduit <SpellLink id={SPELLS.NATURES_FOCUS.id} />.</>, niseko),
  change(date(2020, 10, 26), <>Added statistics, suggestions and checklist entries for <SpellLink id={SPELLS.WATER_SHIELD.id} /> and <SpellLink id={SPELLS.EARTH_SHIELD_HEAL.id} />.</>, niseko),
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
