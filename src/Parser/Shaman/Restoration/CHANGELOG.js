import React from 'react';

import { Anomoly, Versaya, aryu, Zerotorescue, hatra344, niseko } from 'CONTRIBUTORS';
import ITEMS from 'common/ITEMS';
import SPELLS from 'common/SPELLS';
import ItemLink from 'common/ItemLink';
import SpellLink from 'common/SpellLink';

export default [
  {
    date: new Date('2018-06-18'),
    changes: (
      <React.Fragment>Updated Restoration Shaman for Battle for Azeroth.<br />
      Changes include:<br />
        <ul>
          <li>Removal of old talents and artifact traits.</li>
          <li>Added a module showing the <SpellLink id={SPELLS.EARTH_SHIELD_TALENT.id} /> uptime. The healing bonus contribution is calculated and added into the talent statistic box.</li>
          <li>Added a module detailing the average cooldown of <SpellLink id={SPELLS.DOWNPOUR_TALENT.id} />.</li>
          <li>Average casting time saved from <SpellLink id={SPELLS.FLASH_FLOOD_TALENT.id} /> will be shown in the talent statistics box.</li>
          <li><SpellLink id={SPELLS.CLOUDBURST_TOTEM_TALENT.id} /> now supports 2 charges and replaces <SpellLink id={SPELLS.HEALING_STREAM_TOTEM_CAST.id} /> when talented.</li>
          <li><SpellLink id={SPELLS.EARTHEN_WALL_TOTEM_TALENT.id} /> is now able to handle prepull casts.</li>
        </ul>
      </React.Fragment>
    ),
    contributors: [niseko],
  },
  {
    date: new Date('2018-05-26'),
    changes: <React.Fragment>The <SpellLink id={SPELLS.CLOUDBURST_TOTEM_TALENT.id} /> buff is now displayed in the timeline.</React.Fragment>,
    contributors: [niseko],
  },
  {
    date: new Date('2018-05-20'),
    changes: <React.Fragment>Added support for <SpellLink id={SPELLS.DELUGE_TALENT.id} /> and <ItemLink id={ITEMS.ELEMENTAL_REBALANCERS.id} />.</React.Fragment>,
    contributors: [niseko],
  },
  {
    date: new Date('2018-05-02'),
    changes: <React.Fragment>Inneficient <SpellLink id={SPELLS.HEALING_WAVE.id} /> casts will now be highlighted in the timeline with a red border.</React.Fragment>,
    contributors: [niseko],
  },
  {
    date: new Date('2018-04-13'),
    changes: <React.Fragment>Added statistics showing the healing impact of each talent, with support for all talents that directly impact HPS apart from Crashing Waves, <SpellLink id={SPELLS.DELUGE_TALENT.id} /> and <SpellLink id={SPELLS.ECHO_OF_THE_ELEMENTS_TALENT.id} />.</React.Fragment>,
    contributors: [niseko],
  },
  {
    date: new Date('2018-04-13'),
    changes: <React.Fragment>Added a module breaking down your <SpellLink id={SPELLS.UNLEASH_LIFE_TALENT.id} /> usage by spell.</React.Fragment>,
    contributors: [niseko],
  },
  {
    date: new Date('2018-04-11'),
    changes: 'Implemented Stat Values for Restoration Shaman.',
    contributors: [niseko],
  },
  {
    date: new Date('2018-03-28'),
    changes: <React.Fragment>Added a Tab detailing the <SpellLink id={SPELLS.DEEP_HEALING.id} /> effectiveness per player.</React.Fragment>,
    contributors: [niseko],
  },
  {
    date: new Date('2018-03-24'),
    changes: <React.Fragment>Reworked the <SpellLink id={SPELLS.TIDAL_WAVES_BUFF.id} /> statistics, making them easier to read.</React.Fragment>,
    contributors: [niseko],
  },
  {
    date: new Date('2018-03-16'),
    changes: <React.Fragment>Added a <SpellLink id={SPELLS.RESURGENCE.id} /> module, detailing how much each spell contributed to your mana pool.</React.Fragment>,
    contributors: [niseko],
  },
  {
    date: new Date('2018-03-15'),
    changes: <React.Fragment>Added support for DPS spells, <SpellLink id={SPELLS.CHAIN_HEAL.id} />, <SpellLink id={SPELLS.UNLEASH_LIFE_TALENT.id} /> and <SpellLink id={SPELLS.WELLSPRING_TALENT.id} /> to the timeline. Added talents to the Checklist.</React.Fragment>,
    contributors: [niseko],
  },
  {
    date: new Date('2018-01-16'),
    changes: 'Added support for purify spirit to timeline.',
    contributors: [hatra344],
  },
  {
    date: new Date('2017-12-24'),
    changes: 'Implemented the checklist.',
    contributors: [hatra344],
  },
  {
    date: new Date('2017-11-29'),
    changes: <React.Fragment>Added in T21 2 set and 4 set healing contribution values.</React.Fragment>,
    contributors: [Anomoly],
  },
  {
    date: new Date('2017-11-16'),
    changes: <React.Fragment>Fix crash when using <ItemLink id={ITEMS.FOCUSER_OF_JONAT.id} />.</React.Fragment>,
    contributors: [Zerotorescue],
  },
  {
    date: new Date('2017-11-16'),
    changes: 'Refactored Restoration Shaman spec to be in line with current spec module implementations.',
    contributors: [Anomoly],
  },
  {
    date: new Date('2017-08-20'),
    changes: 'Added Ancestral Vigor metric.',
    contributors: [aryu],
  },
  {
    date: new Date('2017-07-06'),
    changes: 'Fix crash when CBT, AG or Ascendance was cast before pull.',
    contributors: [Versaya],
  },
  {
    date: new Date('2017-05-29'),
    changes: 'Added overhealing in Cast Efficiency tab for some resto shaman spells. Fixed Uncertain Reminder in case of pre-lust. Added GotQ target efficiency. Don\'t allow CBT healing to feed into CBT.',
    contributors: [Versaya],
  },
  {
    date: new Date('2017-05-28'),
    changes: 'Added the initial support.',
    contributors: [Versaya],
  },
];
