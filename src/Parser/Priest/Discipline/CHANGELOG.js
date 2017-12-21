
import React from 'react';

import { Oratio, Gao, Reglitch, hassebewlen, Zerotorescue, milesoldenburg } from 'MAINTAINERS';

import Wrapper from 'common/Wrapper';
import ItemLink from 'common/ItemLink';
import ITEMS from 'common/ITEMS';
import SPELLS from 'common/SPELLS';
import SpellLink from 'common/SpellLink';

export default [
  {
    date: new Date('2017-12-21'),
    changes: <Wrapper>Fixed a bug for <SpellLink id={SPELLS.SHADOWFIEND.id} /> when using the Light Spawn Glyph.</Wrapper>,
    contributors: [Oratio],
  },
  {
    date: new Date('2017-12-21'),
    changes: 'Added mastery constants for accurate mastery information.',
    contributors: [Oratio],
  },
  {
    date: new Date('2017-12-07'),
    changes: 'Added healing per penance bolt in Atonement Source Tab.',
    contributors: [Oratio],
  },
  {
    date: new Date('2017-12-01'),
    changes: <Wrapper>Added Support for <ItemLink id={ITEMS.CARAFE_OF_SEARING_LIGHT.id} />.</Wrapper>,
    contributors: [Oratio],
  },
  {
    date: new Date('2017-11-15'),
    changes: <Wrapper>Moved <ItemLink id={ITEMS.SOUL_OF_THE_HIGH_PRIEST.id} /> value to show the talent <SpellLink id={SPELLS.TWIST_OF_FATE_TALENT.id} /></Wrapper>,
    contributors: [Gao],
  },
  {
    date: new Date('2017-11-15'),
    changes: 'Added a absolute healing toggle in atonement sources',
    contributors: [Oratio],
  },
  {
    date: new Date('2017-10-13'),
    changes: 'Fixed a bug with some trinket damage events causing a crash.',
    contributors: [Gao],
  },
  {
    date: new Date('2017-11-10'),
    changes: 'Added T21 4pc bonus.',
    contributors: [Oratio],
  },
  {
    date: new Date('2017-11-01'),
    changes: 'Added T21 2pc bonus.',
    contributors: [Oratio],
  },
  {
    date: new Date('2017-11-02'),
    changes: <Wrapper>Added <ItemLink id={ITEMS.ESTEL_DEJAHNAS_INSPIRATION.id} /> Avg Haste bug</Wrapper>,
    contributors: [Gao],
  },
  {
    date: new Date('2017-10-27'),
    changes: 'Refactored disc module.',
    contributors: [Gao],
  },
  {
    date: new Date('2017-10-26'),
    changes: 'Adjusted the T20 2pc bonus for the recent nerfs.',
    contributors: [Oratio],
  },
  {
    date: new Date('2017-10-27'),
    changes: 'Added an atonement normalizer to fix atonement ordering issues.',
    contributors: [Oratio],
  },
  {
    date: new Date('2017-10-16'),
    changes: 'Fixed T20 4pc bug, added a suggestion to utilise the buff.',
    contributors: [Reglitch],
  },
  {
    date: new Date('2017-09-15'),
    changes: 'Pet damage is now also taken into consideration for Atonement damage source.',
    contributors: [Zerotorescue],
  },
  {
    date: new Date('2017-09-14'),
    changes: 'Fix issue where friendly fire damage was considered a valid Atonement damage source.',
    contributors: [Zerotorescue],
  },
  {
    date: new Date('2017-09-14'),
    changes: 'Added atonement sources breakdown. This isn\'t very accurate yet, it\'s just showing the way it\'s assigned right now. Improved accuracy will come later.',
    contributors: [Zerotorescue],
  },
  {
    date: new Date('2017-07-22'),
    changes: <Wrapper>Added mana saved from the legendary <ItemLink id={ITEMS.INNER_HALLATION.id} />.</Wrapper>,
    contributors: [hassebewlen],
  },
  {
    date: new Date('2017-06-18'),
    changes: <Wrapper>Added <SpellLink id={SPELLS.TOUCH_OF_THE_GRAVE.id} /> statistic.</Wrapper>,
    contributors: [Zerotorescue],
  },
  {
    date: new Date('2017-06-17'),
    changes: <Wrapper><SpellLink id={SPELLS.EVANGELISM_TALENT.id} /> casts are now also shown under the cooldowns tab. <SpellLink id={SPELLS.RAPTURE.id} /> now shows the total abosrbs applied and the amount of damage absorbed. Fixed a few issues that caused too much healing to be assigned to <SpellLink id={SPELLS.EVANGELISM_TALENT.id} />.</Wrapper>,
    contributors: [Zerotorescue],
  },
  {
    date: new Date('2017-06-15'),
    changes: <Wrapper>Fixed Wasted Penance bolts always assumed user had the <SpellLink id={SPELLS.CASTIGATION_TALENT.id} /> talent.</Wrapper>,
    contributors: [Zerotorescue],
  },
  {
    date: new Date('2017-06-15'),
    changes: <Wrapper>Disabled suggestions for <SpellLink id={SPELLS.PAIN_SUPPRESSION.id} /> and <SpellLink id={SPELLS.POWER_WORD_BARRIER_CAST.id} />.</Wrapper>,
    contributors: [Zerotorescue],
  },
  {
    date: new Date('2017-06-11'),
    changes: <Wrapper>Added extra suggestion to <SpellLink id={SPELLS.POWER_WORD_SHIELD.id} /> description to add distinction to casts during <SpellLink id={SPELLS.RAPTURE.id} />.</Wrapper>,
    contributors: [milesoldenburg],
  },
  {
    date: new Date('2017-06-05'),
    changes: <Wrapper>Fix Atonement duration in cast efficiency not accounting for the <SpellLink id={SPELLS.DOOMSAYER.id} /> trait.</Wrapper>,
    contributors: [Zerotorescue],
  },
  {
    date: new Date('2017-05-29'),
    changes: <Wrapper>Show Rapture <SpellLink id={SPELLS.POWER_WORD_SHIELD.id} /> casts seperate from regular <SpellLink id={SPELLS.POWER_WORD_SHIELD.id} /> casts in Cast Efficiency.</Wrapper>,
    contributors: [Zerotorescue],
  },
  {
    date: new Date('2017-05-28'),
    changes: 'Added unused Power Word: Shield absorb statistic',
    contributors: [],
  },
  {
    date: new Date('2017-05-25'),
    changes: 'Added Early Atonement refreshes statistic. Fixed Skjoldr sometimes not working properly. Both contributions were created by <b>@Shadowdrizz</b>. Thanks a lot for your contribution! Fix Shadowfiend showing with the Mindbender talent.',
    contributors: [],
  },
  {
    date: new Date('2017-05-18'),
    changes: <Wrapper>Added <SpellLink id={SPELLS.SHADOW_WORD_PAIN.id} />/<SpellLink id={SPELLS.PURGE_THE_WICKED_TALENT.id} /> global uptime statistic.</Wrapper>,
    contributors: [],
  },
  {
    date: new Date('2017-05-17'),
    changes: <Wrapper>Added <SpellLink id={SPELLS.TWIST_OF_FATE_TALENT.id} /> healing statistic (damage gain is in the tooltip).</Wrapper>,
    contributors: [],
  },
  {
    date: new Date('2017-05-16'),
    changes: <Wrapper>Added <ItemLink id={ITEMS.DARKMOON_DECK_PROMISES.id} /> statistic. Added <SpellLink id={SPELLS.LIGHTS_WRATH.id} />  to cast efficiency. Changed Pain Suppression cooldown to take into account the Pain is in your Mind trait.</Wrapper>,
    contributors: [],
  },
  {
    date: new Date('2017-05-16'),
    changes: <Wrapper>Added <ItemLink id={ITEMS.NERO_BAND_OF_PROMISES.id} /> statistic.</Wrapper>,
    contributors: [],
  },
  {
    date: new Date('2017-05-15'),
    changes: <Wrapper>Added <ItemLink id={ITEMS.XALAN_THE_FEAREDS_CLENCH.id} />  statistic.</Wrapper>,
    contributors: [],
  },
  {
    date: new Date('2017-05-15'),
    changes: <Wrapper><ItemLink id={ITEMS.SKJOLDR_SANCTUARY_OF_IVAGONT.id} /> statistic now includes the healing gained via <SpellLink id={SPELLS.SHARE_IN_THE_LIGHT.id} />.</Wrapper>,
    contributors: [],
  },
  {
    date: new Date('2017-05-14'),
    changes: <Wrapper>Added <ItemLink id={ITEMS.SKJOLDR_SANCTUARY_OF_IVAGONT.id} /> statistic. This does not yet include the healing gained via <SpellLink id={SPELLS.SHARE_IN_THE_LIGHT.id} />.</Wrapper>,
    contributors: [],
  },
  {
    date: new Date('2017-05-14'),
    changes: <Wrapper>Added <ItemLink id={ITEMS.CORD_OF_MAIEV_PRIESTESS_OF_THE_MOON.id} /> statistic.</Wrapper>,
    contributors: [],
  },
  {
    date: new Date('2017-05-14'),
    changes: 'Added Disc Priest 2 set bonus statistic.',
    contributors: [],
  },
  {
    date: new Date('2017-05-14'),
    changes: <Wrapper>Renamed Missed penance hits to Wasted Penance bolts. Wasted Penance bolts now accounts for (combat log) latency. Fixed Glyph of the Sha's Shadowfiend not being counted towards Shadowfiend casts. Fixed healing increases (most notably the 15% from Velen's) not working with Disc priest spells.</Wrapper>,
    contributors: [],
  },
  {
    date: new Date('2017-06-05'),
    changes: <Wrapper>Fixed issue where critical atonement healing was not being counted, fixed <ItemLink id={ITEMS.NERO_BAND_OF_PROMISES.id} /> being broken.</Wrapper>,
    contributors: [Reglitch],
  },
  {
    date: new Date('2017-05-14'),
    changes: 'Added Discipline Priest spec. Currently includes basic statistics for Dead GCD time (should be fully operational), shared legendaries, missed Penance hits, cast efficiencies and the other build in tools.',
    contributors: [],
  },
];
