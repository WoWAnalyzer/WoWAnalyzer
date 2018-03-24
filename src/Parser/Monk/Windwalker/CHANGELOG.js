import { Juko8, Coryn, Talby, Anomoly, AttilioLH, Hewhosmites } from 'CONTRIBUTORS';

import React from 'react';
import ITEMS from 'common/ITEMS';
import SPELLS from 'common/SPELLS';
import ItemLink from 'common/ItemLink';
import SpellLink from 'common/SpellLink';
import Wrapper from 'common/Wrapper';

export default [
  {
    date: new Date('2018-03-15'),
    changes: <Wrapper>Added module tracking bad casts of <SpellLink id={SPELLS.BLACKOUT_KICK.id} icon /> </Wrapper>,
    contributors: [Juko8],
  },
  {
    date: new Date('2018-03-09'),
    changes: `Added Checklist`,
    contributors: [Juko8],
  },
  {
    date: new Date('2018-03-06'),
    changes: <Wrapper>Added Statistics and Suggestions on use of <SpellLink id={SPELLS.TOUCH_OF_KARMA_CAST.id} icon/></Wrapper>,
    contributors: [Juko8],
  },
  {
    date: new Date('2018-03-03'),
    changes: <Wrapper>Added <ItemLink id={ITEMS.THE_WIND_BLOWS.id} icon/></Wrapper>,
    contributors: [Hewhosmites],
  },
  {
    date: new Date('2018-02-16'),
    changes: <Wrapper>Added <SpellLink id={SPELLS.SPINNING_CRANE_KICK.id} icon /> statistics and suggestion</Wrapper>,
    contributors: [Juko8],
  },
  {
    date: new Date('2018-01-27'),
    changes: <Wrapper>Added item breakdown for <ItemLink id={ITEMS.DRINKING_HORN_COVER.id} icon /> showing average time gained for each <SpellLink id={SPELLS.STORM_EARTH_AND_FIRE_CAST.id} icon /> or <SpellLink id={SPELLS.SERENITY_TALENT.id} icon /> cast</Wrapper>,
    contributors: [Juko8],
  },
  {
    date: new Date('2018-01-24'),
    changes: <Wrapper>Added Statistic showing actual casts vs expected casts of important spells during <SpellLink id={SPELLS.STORM_EARTH_AND_FIRE_CAST.id} icon /> or <SpellLink id={SPELLS.SERENITY_TALENT.id} icon /></Wrapper>,
    contributors: [Juko8],
  },
  {
    date: new Date('2018-01-20'),
    changes: <Wrapper>Updated Cooldown Tracker to include extended <SpellLink id={SPELLS.STORM_EARTH_AND_FIRE_CAST.id} icon /> duration from <ItemLink id={ITEMS.DRINKING_HORN_COVER.id} icon /></Wrapper>,
    contributors: [Juko8],
  },
  {
    date: new Date('2018-01-03'),
    changes: "Updated AlwaysBeCasting with channeling and more accurate GCD and fixed Gol'ganneths ravaging storm being shown in Cooldowns tab",
    contributors: [Juko8],
  },
  {
    date: new Date('2017-12-05'),
    changes: <Wrapper>Updated Cast Efficiency to better handle <SpellLink id={SPELLS.SERENITY_TALENT.id} icon /> cooldown reduction on <SpellLink id={SPELLS.FISTS_OF_FURY_CAST.id} icon /> and <SpellLink id={SPELLS.STRIKE_OF_THE_WINDLORD.id} icon /></Wrapper>,
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
    changes: <Wrapper>Added <SpellLink id={SPELLS.CRACKLING_JADE_LIGHTNING.id} icon /> damage from <SpellLink id={SPELLS.STORM_EARTH_AND_FIRE_CAST.id} icon /> clones in <ItemLink id={ITEMS.THE_EMPERORS_CAPACITOR.id} icon /> item breakdown</Wrapper>,
    contributors: [Juko8],
  },
  {
    date: new Date('2017-11-06'),
    changes: <Wrapper>Added <SpellLink id={SPELLS.ENERGIZING_ELIXIR_TALENT.id} icon /> energy gained calculation and statistic</Wrapper>,
    contributors: [Coryn],
  },
  {
    date: new Date('2017-11-05'),
    changes: <Wrapper>Added basic display for <SpellLink id={SPELLS.INVOKE_XUEN_THE_WHITE_TIGER_TALENT.id} icon /> to Cooldown Throughput with plans for refinement</Wrapper>,
    contributors: [Talby],
  },
  {
    date: new Date('2017-11-05'),
    changes: <Wrapper>Updated Cast Efficiency - Added <SpellLink id={SPELLS.ENERGIZING_ELIXIR_TALENT.id} icon /> and fixed <SpellLink id={SPELLS.RUSHING_JADE_WIND_TALENT.id} icon /> showing when not talented</Wrapper>,
    contributors: [Talby],
  },
  {
    date: new Date('2017-10-25'),
    changes: 'Updated Cast Efficiency - Changed reduction values from T19 2pc and added a few talents',
    contributors: [Juko8],
  },
  {
    date: new Date('2017-10-23'),
    changes: <Wrapper>Added tracking of <SpellLink id={SPELLS.FISTS_OF_FURY_CAST.id} icon /> ticks</Wrapper>,
    contributors: [Juko8],
  },
  {
    date: new Date('2017-10-17'),
    changes: <Wrapper>Updated Cast Efficiency - Added reductions from <ItemLink id={ITEMS.THE_WIND_BLOWS.id} icon /> and T19 2pc</Wrapper>,
    contributors: [Juko8],
  },
  {
    date: new Date('2017-10-17'),
    changes: <Wrapper>Added <ItemLink id={ITEMS.CENEDRIL_REFLECTOR_OF_HATRED.id} icon />, <ItemLink id={ITEMS.THE_EMPERORS_CAPACITOR.id} icon /> and <ItemLink id={ITEMS.SOUL_OF_THE_GRANDMASTER.id} icon /> to legendary item breakdown</Wrapper>,
    contributors: [Juko8],
  },
  {
    date: new Date('2017-10-15'),
    changes: <Wrapper>Added <ItemLink id={ITEMS.KATSUOS_ECLIPSE.id} icon /> chi reduction item breakdown</Wrapper>,
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
    changes: <Wrapper>Added <SpellLink id={SPELLS.COMBO_BREAKER_BUFF.id} icon /> tracking with suggestions and statistic</Wrapper>,
    contributors: [Juko8],
  },
  {
    date: new Date('2017-10-03'),
    changes: 'Added in mastery tracking and suggestions, along with updating the Maintainer and Configuration sections',
    contributors: [Anomoly],
  },
  {
    date: new Date('2017-09-24'),
    changes: <Wrapper>Added additional Windwalker spells / cooldowns along with a simple <SpellLink id={SPELLS.HIT_COMBO_TALENT.id} icon /> tracker</Wrapper>,
    contributors: [Anomoly],
  },
  {
    date: new Date('2017-07-22'),
    changes: 'Added basic Windwalker Monk support',
    contributors: [AttilioLH],
  },
];
