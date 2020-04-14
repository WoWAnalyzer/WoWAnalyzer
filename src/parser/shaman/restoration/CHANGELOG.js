import React from 'react';

import { niseko, blazyb, Torothin } from 'CONTRIBUTORS';
import SPELLS from 'common/SPELLS';
import SpellLink from 'common/SpellLink';
import { change, date } from 'common/changelog';

export default [
  change(date(2020, 4, 14), <>Fixed a bug with the <SpellLink id={SPELLS.HIGH_TIDE_TALENT.id} /> that caused it to be valued lower than it should have been.</>, niseko),
  change(date(2020, 3, 16), <><SpellLink id={SPELLS.HIGH_TIDE_TALENT.id} /> buff usage added as a value tooltip for Hight Tide healing.</>, [Torothin]),
  change(date(2020, 3, 16), <>Filtered out pet healing from the <SpellLink id={SPELLS.VISION_OF_PERFECTION.id} /> module by default.</>, niseko),
  change(date(2020, 2, 28), <><SpellLink id={SPELLS.RIPTIDE.id} /> is going to complain a lot less about its usage.</>, [niseko]),
  change(date(2020, 2, 28), <>Added a statistic for <SpellLink id={SPELLS.ANCESTRAL_RESONANCE.id} />.</>, [niseko]),
  change(date(2020, 2, 19), 'Added a toggle to the Mastery Effectiveness panel to show effectiveness by spell instead of player.', niseko),
  change(date(2020, 2, 5), 'Enabled the link to Questionably Live in the Stat Values panel.', niseko),
  change(date(2020, 1, 31), <>Added <SpellLink id={SPELLS.NATURAL_HARMONY_TRAIT.id} /> to Restoration Shaman.</>, niseko),
  change(date(2020, 1, 2), <>Added a small statistic for <SpellLink id={SPELLS.ANCESTRAL_PROTECTION_TOTEM_TALENT.id} />.</>, niseko),
  change(date(2019, 12, 18), <>Added a list of <SpellLink id={SPELLS.CHAIN_HEAL.id} /> casts that only hit one target to the <SpellLink id={SPELLS.CHAIN_HEAL.id} /> statistic, if that happened.</>, niseko),
  change(date(2019, 12, 10), <>Fixed a bug affecting <SpellLink id={SPELLS.EARTHEN_WALL_TOTEM_TALENT.id} /> statistics when used pre-pull.</>, [niseko]),
  change(date(2019, 11, 1), <><SpellLink id={SPELLS.TURN_OF_THE_TIDE_TRAIT.id} /> azerite trait support.</>, [niseko]),
  change(date(2019, 11, 1), <>Removed <SpellLink id={SPELLS.TIDAL_WAVES_BUFF.id} /> checklist rule as it doesn't line up with current shaman gameplay anymore.</>, niseko),
  change(date(2019, 9, 26), <>Updated for patch 8.2.5: <SpellLink id={SPELLS.DELUGE_TALENT.id} /> now includes <SpellLink id={SPELLS.HEALING_WAVE.id} /> and <SpellLink id={SPELLS.HEALING_SURGE_RESTORATION.id} />.</>, niseko),
  change(date(2019, 9, 5), 'Updated for patch 8.2.', niseko),
  change(date(2019, 8, 12), 'Added essence Lucid Dreams.', [blazyb]),
  change(date(2019, 8, 12), <>Added <SpellLink id={SPELLS.VISION_OF_PERFECTION.id} />.</>, niseko),
  change(date(2019, 5, 6), <><SpellLink id={SPELLS.IGNEOUS_POTENTIAL.id} /> and <SpellLink id={SPELLS.SYNAPSE_SHOCK.id} /> azerite traits are now supported.</>, [niseko]),
  change(date(2019, 5, 3), <>Added support for the 8.1.5 <SpellLink id={SPELLS.ASCENDANCE_TALENT_RESTORATION.id} /> changes.</>, [niseko]),
  change(date(2018, 12, 17), <>Updated modules to support various 8.1 changes, including the <SpellLink id={SPELLS.HIGH_TIDE_TALENT.id} /> redesign.</>, [niseko]),
  change(date(2018, 11, 15), <>The <SpellLink id={SPELLS.EARTHEN_WALL_TOTEM_TALENT.id} /> module now provides efficiency details on individual casts, and filters out healing on pets.</>, [niseko]),
  change(date(2018, 11, 4), 'New Tab added: "Mana Efficiency".', [niseko]),
  change(date(2018, 11, 4), <>Added support for <SpellLink id={SPELLS.PACK_SPIRIT_TRAIT.id} /> and <SpellLink id={SPELLS.SERENE_SPIRIT_TRAIT.id} /> azerite traits.</>, [niseko]),
  change(date(2018, 11, 2), (
    <>Added support for all current Restoration Shaman azerite traits:
      <ul>
        <li>Ebb & Flow</li>
        <li><SpellLink id={SPELLS.OVERFLOWING_SHORES_TRAIT.id} /></li>
        <li><SpellLink id={SPELLS.SOOTHING_WATERS_TRAIT.id} /></li>
        <li><SpellLink id={SPELLS.SPOUTING_SPIRITS.id} /></li>
        <li><SpellLink id={SPELLS.SURGING_TIDES.id} /></li>
        <li><SpellLink id={SPELLS.SWELLING_STREAM.id} /></li>
      </ul>
    </>
  ), [niseko]),
  change(date(2018, 11, 1), <>The <SpellLink id={SPELLS.ANCESTRAL_VIGOR.id} /> module now provides a detailed breakdown.</>, [niseko]),
  change(date(2018, 11, 1), <>Added support for <SpellLink id={SPELLS.ASTRAL_SHIFT.id} /> damage reduction.</>, [niseko]),
  change(date(2018, 9, 13), <>Added support for <SpellLink id={SPELLS.WELLSPRING_TALENT.id} /> usage.</>, [niseko]),
  change(date(2018, 10, 10), 'New Tab added: "Player Log Data" with exports for the Restoration Shaman Spreadsheet.', [niseko]),
  change(date(2018, 9, 9), <>Added a spell breakdown for your <SpellLink id={SPELLS.FLASH_FLOOD_TALENT.id} /> buff usage.</>, [niseko]),
  change(date(2018, 7, 15), <>Added support for <SpellLink id={SPELLS.NATURES_GUARDIAN_TALENT.id} />.</>, [niseko]),
  change(date(2018, 6, 18), (
    <>
      Updated Restoration Shaman for Battle for Azeroth.<br />
      Changes include:<br />
      <ul>
        <li>Removal of old talents and artifact traits.</li>
        <li>Added a module showing the <SpellLink id={SPELLS.EARTH_SHIELD_TALENT.id} /> uptime. The healing bonus contribution is calculated and added into the talent statistic box.</li>
        <li>Added a module detailing the average cooldown of <SpellLink id={SPELLS.DOWNPOUR_TALENT.id} />.</li>
        <li>Average casting time saved from <SpellLink id={SPELLS.FLASH_FLOOD_TALENT.id} /> will be shown in the talent statistics box.</li>
        <li><SpellLink id={SPELLS.CLOUDBURST_TOTEM_TALENT.id} /> now supports 2 charges and replaces <SpellLink id={SPELLS.HEALING_STREAM_TOTEM_CAST.id} /> when talented.</li>
        <li><SpellLink id={SPELLS.EARTHEN_WALL_TOTEM_TALENT.id} /> is now able to handle prepull casts.</li>
      </ul>
    </>
  ), [niseko]),
];
