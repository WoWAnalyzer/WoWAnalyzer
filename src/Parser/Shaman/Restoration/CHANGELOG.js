import React from 'react';

import { niseko } from 'CONTRIBUTORS';
import SPELLS from 'common/SPELLS';
import SpellLink from 'common/SpellLink';

export default [
  {
    date: new Date('2018-07-15'),
    changes: <React.Fragment>Added support for <SpellLink id={SPELLS.NATURES_GUARDIAN_TALENT.id} />.</React.Fragment>,
    contributors: [niseko],
  },
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
];
