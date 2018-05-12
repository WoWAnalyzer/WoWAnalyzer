import { Juko8, Coryn, Talby, Anomoly, AttilioLH, Hewhosmites } from 'CONTRIBUTORS';

import React from 'react';
import ITEMS from 'common/ITEMS';
import SPELLS from 'common/SPELLS';
import ItemLink from 'common/ItemLink';
import SpellLink from 'common/SpellLink';

export default [
  {
    date: new Date('2018-05-10'),
    changes: <React.Fragment>Added highlighting Combo Breaker casts of <SpellLink id={SPELLS.BLACKOUT_KICK.id} /> in Spellcast Timeline</React.Fragment>,
    contributors: [Coryn],
  },
  {
    date: new Date('2018-03-15'),
    changes: <React.Fragment>Added module tracking bad casts of <SpellLink id={SPELLS.BLACKOUT_KICK.id} /> </React.Fragment>,
    contributors: [Juko8],
  },
  {
    date: new Date('2018-03-09'),
    changes: `Added Checklist`,
    contributors: [Juko8],
  },
  {
    date: new Date('2018-03-06'),
    changes: <React.Fragment>Added Statistics and Suggestions on use of <SpellLink id={SPELLS.TOUCH_OF_KARMA_CAST.id} icon/></React.Fragment>,
    contributors: [Juko8],
  },
  {
    date: new Date('2018-03-03'),
    changes: <React.Fragment>Added <ItemLink id={ITEMS.THE_WIND_BLOWS.id} icon/></React.Fragment>,
    contributors: [Hewhosmites],
  },
  {
    date: new Date('2018-02-16'),
    changes: <React.Fragment>Added <SpellLink id={SPELLS.SPINNING_CRANE_KICK.id} /> statistics and suggestion</React.Fragment>,
    contributors: [Juko8],
  },
  {
    date: new Date('2018-01-27'),
    changes: <React.Fragment>Added item breakdown for <ItemLink id={ITEMS.DRINKING_HORN_COVER.id} /> showing average time gained for each <SpellLink id={SPELLS.STORM_EARTH_AND_FIRE_CAST.id} /> or <SpellLink id={SPELLS.SERENITY_TALENT.id} /> cast</React.Fragment>,
    contributors: [Juko8],
  },
  {
    date: new Date('2018-01-24'),
    changes: <React.Fragment>Added Statistic showing actual casts vs expected casts of important spells during <SpellLink id={SPELLS.STORM_EARTH_AND_FIRE_CAST.id} /> or <SpellLink id={SPELLS.SERENITY_TALENT.id} /></React.Fragment>,
    contributors: [Juko8],
  },
  {
    date: new Date('2018-01-20'),
    changes: <React.Fragment>Updated Cooldown Tracker to include extended <SpellLink id={SPELLS.STORM_EARTH_AND_FIRE_CAST.id} /> duration from <ItemLink id={ITEMS.DRINKING_HORN_COVER.id} /></React.Fragment>,
    contributors: [Juko8],
  },
  {
    date: new Date('2018-01-03'),
    changes: "Updated AlwaysBeCasting with channeling and more accurate GCD and fixed Gol'ganneths ravaging storm being shown in Cooldowns tab",
    contributors: [Juko8],
  },
  {
    date: new Date('2017-12-05'),
    changes: <React.Fragment>Updated Cast Efficiency to better handle <SpellLink id={SPELLS.SERENITY_TALENT.id} /> cooldown reduction on <SpellLink id={SPELLS.FISTS_OF_FURY_CAST.id} /> and <SpellLink id={SPELLS.STRIKE_OF_THE_WINDLORD.id} /></React.Fragment>,
    contributors: [Juko8],
  },
  {
    date: new Date('2017-11-23'),
    changes: 'Added Chi breakdown tab, suggestions and chi wasted statistic',
    contributors: [Juko8],
  },
  {
    date: new Date('2017-11-22'),
    changes: 'Added T21 4pc item breakdown',
    contributors: [Juko8],
  },
  {
    date: new Date('2017-11-07'),
    changes: <React.Fragment>Added <SpellLink id={SPELLS.CRACKLING_JADE_LIGHTNING.id} /> damage from <SpellLink id={SPELLS.STORM_EARTH_AND_FIRE_CAST.id} /> clones in <ItemLink id={ITEMS.THE_EMPERORS_CAPACITOR.id} /> item breakdown</React.Fragment>,
    contributors: [Juko8],
  },
  {
    date: new Date('2017-11-06'),
    changes: <React.Fragment>Added <SpellLink id={SPELLS.ENERGIZING_ELIXIR_TALENT.id} /> energy gained calculation and statistic</React.Fragment>,
    contributors: [Coryn],
  },
  {
    date: new Date('2017-11-05'),
    changes: <React.Fragment>Added basic display for <SpellLink id={SPELLS.INVOKE_XUEN_THE_WHITE_TIGER_TALENT.id} /> to Cooldown Throughput with plans for refinement</React.Fragment>,
    contributors: [Talby],
  },
  {
    date: new Date('2017-11-05'),
    changes: <React.Fragment>Updated Cast Efficiency - Added <SpellLink id={SPELLS.ENERGIZING_ELIXIR_TALENT.id} /> and fixed <SpellLink id={SPELLS.RUSHING_JADE_WIND_TALENT.id} /> showing when not talented</React.Fragment>,
    contributors: [Talby],
  },
  {
    date: new Date('2017-10-25'),
    changes: 'Updated Cast Efficiency - Changed reduction values from T19 2pc and added a few talents',
    contributors: [Juko8],
  },
  {
    date: new Date('2017-10-23'),
    changes: <React.Fragment>Added tracking of <SpellLink id={SPELLS.FISTS_OF_FURY_CAST.id} /> ticks</React.Fragment>,
    contributors: [Juko8],
  },
  {
    date: new Date('2017-10-17'),
    changes: <React.Fragment>Updated Cast Efficiency - Added reductions from <ItemLink id={ITEMS.THE_WIND_BLOWS.id} /> and T19 2pc</React.Fragment>,
    contributors: [Juko8],
  },
  {
    date: new Date('2017-10-17'),
    changes: <React.Fragment>Added <ItemLink id={ITEMS.CENEDRIL_REFLECTOR_OF_HATRED.id} />, <ItemLink id={ITEMS.THE_EMPERORS_CAPACITOR.id} /> and <ItemLink id={ITEMS.SOUL_OF_THE_GRANDMASTER.id} /> to legendary item breakdown</React.Fragment>,
    contributors: [Juko8],
  },
  {
    date: new Date('2017-10-15'),
    changes: <React.Fragment>Added <ItemLink id={ITEMS.KATSUOS_ECLIPSE.id} /> chi reduction item breakdown</React.Fragment>,
    contributors: [Juko8],
  },
  {
    date: new Date('2017-10-15'),
    changes: 'Finished AlwaysBeCasting',
    contributors: [Juko8],
  },
  {
    date: new Date('2017-10-14'),
    changes: 'Updated Cast Efficiency - All primary Windwalker spells are now shown',
    contributors: [Juko8],
  },
  {
    date: new Date('2017-10-13'),
    changes: <React.Fragment>Added <SpellLink id={SPELLS.COMBO_BREAKER_BUFF.id} /> tracking with suggestions and statistic</React.Fragment>,
    contributors: [Juko8],
  },
  {
    date: new Date('2017-10-03'),
    changes: 'Added in mastery tracking and suggestions, along with updating the Maintainer and Configuration sections',
    contributors: [Anomoly],
  },
  {
    date: new Date('2017-09-24'),
    changes: <React.Fragment>Added additional Windwalker spells / cooldowns along with a simple <SpellLink id={SPELLS.HIT_COMBO_TALENT.id} /> tracker</React.Fragment>,
    contributors: [Anomoly],
  },
  {
    date: new Date('2017-07-22'),
    changes: 'Added basic Windwalker Monk support',
    contributors: [AttilioLH],
  },
];
