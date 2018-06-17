import React from 'react';

import SPELLS from 'common/SPELLS';
import SpellLink from 'common/SpellLink';

import { Chizu } from 'CONTRIBUTORS';

export default [
  {
    date: new Date('2018-02-02'),
    changes: <React.Fragment>Added more information to <SpellLink id={SPELLS.ERADICATION_TALENT.id} icon /> statistic box, now showing uptime on <SpellLink id={SPELLS.LESSONS_OF_SPACETIME_BUFF.id} icon /> buff and also a suggestion about wrong talent choice when running <SpellLink id={SPELLS.FIRE_AND_BRIMSTONE_TALENT.id} icon /> on single target.</React.Fragment>,
    contributors: [Chizu],
  },
  {
    date: new Date('2018-01-26'),
    changes: 'Implemented Tier 21 set bonuses.',
    contributors: [Chizu],
  },
  {
    date: new Date('2017-09-16'),
    changes: <React.Fragment>Added Summon Doomguard/<SpellLink id={SPELLS.SUMMON_INFERNAL.id} icon />/Grimoire of Service to Cooldowns tab.</React.Fragment>,
    contributors: [Chizu],
  },
  {
    date: new Date('2017-09-12'),
    changes: 'Added Legendaries and T20 2set.',
    contributors: [Chizu],
  },
  {
    date: new Date('2017-09-10'),
    changes: <React.Fragment>Added <SpellLink id={SPELLS.CHANNEL_DEMONFIRE_TALENT.id} icon /> and <SpellLink id={SPELLS.HAVOC.id} icon /> cleave module (not 100% accurate though).</React.Fragment>,
    contributors: [Chizu],
  },
  {
    date: new Date('2017-09-10'),
    changes: <React.Fragment>Added <SpellLink id={SPELLS.FIRE_AND_BRIMSTONE_TALENT.id} icon /> cleave and fragment tracker.</React.Fragment>,
    contributors: [Chizu],
  },
  {
    date: new Date('2017-09-10'),
    changes: 'Added Dimensional Rift damage tracker.',
    contributors: [Chizu],
  },
  {
    date: new Date('2017-09-09'),
    changes: <React.Fragment>Added <SpellLink id={SPELLS.REVERSE_ENTROPY_TALENT.id} icon />, <SpellLink id={SPELLS.ERADICATION_TALENT.id} icon /> and Empowered Life Tap modules.</React.Fragment>,
    contributors: [Chizu],
  },
  {
    date: new Date('2017-09-08'),
    changes: <React.Fragment>Added <SpellLink id={SPELLS.BACKDRAFT.id} icon />, Roaring Blaze and <SpellLink id={SPELLS.SHADOWBURN_TALENT.id} icon /> modules.</React.Fragment>,
    contributors: [Chizu],
  },
  {
    date: new Date('2017-09-07'),
    changes: <React.Fragment>Added <SpellLink id={SPELLS.IMMOLATE_DEBUFF.id} icon /> uptime tracker.</React.Fragment>,
    contributors: [Chizu],
  },
  {
    date: new Date('2017-09-05'),
    changes: 'Added Soul Shard usage breakdown.',
    contributors: [Chizu],
  },
  {
    date: new Date('2017-09-04'),
    changes: <React.Fragment>Fixed the issues with Grimoire of Service and Summon Doomguard/<SpellLink id={SPELLS.SUMMON_INFERNAL_UNTALENTED.id} icon />.</React.Fragment>,
    contributors: [Chizu],
  },
];
