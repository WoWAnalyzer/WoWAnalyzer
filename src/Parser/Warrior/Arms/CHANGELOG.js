import React from 'react';

import { TheBadBossy, Aelexe } from 'CONTRIBUTORS';
import SPELLS from 'common/SPELLS';
import SpellLink from 'common/SpellLink';

export default [
  {
    date: new Date('2018-04-13'),
    changes: <React.Fragment>Added suggestions for <SpellLink id={SPELLS.SLAM.id} icon /> and <SpellLink id={SPELLS.WHIRLWIND.id} icon /> usage.</React.Fragment>,
    contributors: [Aelexe],
  },
  {
    date: new Date('2018-04-12'),
    changes: <React.Fragment>Added a suggestion for avoiding using <SpellLink id={SPELLS.MORTAL_STRIKE.id} icon /> without <SpellLink id={SPELLS.SHATTERED_DEFENSES.id} icon /> where possible.</React.Fragment>,
    contributors: [Aelexe],
  },
  {
    date: new Date('2018-04-10'),
    changes: <React.Fragment>Added a suggestion for not using <SpellLink id={SPELLS.REND_TALENT.id} icon /> on a target in <SpellLink id={SPELLS.EXECUTE.id} icon /> range.</React.Fragment>,
    contributors: [Aelexe],
  },
  {
    date: new Date('2018-04-12'),
    changes: <React.Fragment>Added a suggestion for avoiding wasted <SpellLink id={SPELLS.EXECUTIONERS_PRECISION.id} icon /> stacks.</React.Fragment>,
    contributors: [Aelexe],
  },
  {
    date: new Date('2018-04-12'),
    changes: <React.Fragment>Added a suggestion for avoiding wasted <SpellLink id={SPELLS.SHATTERED_DEFENSES.id} icon /> with <SpellLink id={SPELLS.COLOSSUS_SMASH.id} icon />.</React.Fragment>,
    contributors: [Aelexe],
  },
  {
    date: new Date('2018-04-10'),
    changes: <React.Fragment>Added <SpellLink id={SPELLS.BATTLE_CRY.id} icon /> statistic block.</React.Fragment>,
    contributors: [Aelexe],
  },
  {
    date: new Date('2018-04-09'),
    changes: <React.Fragment>Added a suggestion for preparing <SpellLink id={SPELLS.SHATTERED_DEFENSES.id} icon /> for <SpellLink id={SPELLS.BATTLE_CRY.id} icon />.</React.Fragment>,
    contributors: [Aelexe],
  },
  {
    date: new Date('2018-04-09'),
    changes: <React.Fragment>Add <SpellLink id={SPELLS.CHARGE.id} icon /> cooldown and charge modifications for <SpellLink id={SPELLS.DOUBLE_TIME_TALENT.id} icon />.</React.Fragment>,
    contributors: [Aelexe],
  },
  {
    date: new Date('2018-04-05'),
    changes: <React.Fragment>Added improved suggestions for <SpellLink id={SPELLS.CHARGE.id} icon />, <SpellLink id={SPELLS.HEROIC_LEAP.id} icon /> and <SpellLink id={SPELLS.COMMANDING_SHOUT.id} icon />.</React.Fragment>,
    contributors: [Aelexe],
  },
  {
    date: new Date('2018-04-05'),
    changes: <React.Fragment>Added <SpellLink id={SPELLS.MORTAL_STRIKE.id} icon /> haste cooldown reduction and <SpellLink id={SPELLS.TACTICIAN.id} icon /> cooldown resets.</React.Fragment>,
    contributors: [Aelexe],
  },
  {
    date: new Date('2018-04-05'),
    changes: <React.Fragment>Added <SpellLink id={SPELLS.BLADESTORM.id} icon /> channeling.</React.Fragment>,
    contributors: [Aelexe],
  },
  {
    date: new Date('2018-04-05'),
    changes: <React.Fragment>Added <SpellLink id={SPELLS.IN_FOR_THE_KILL_TALENT.id} icon /> haste buff.</React.Fragment>,
    contributors: [Aelexe],
  },
  {
    date: new Date('2017-10-21'),
    changes: 'Added tactician procs.',
    contributors: [TheBadBossy],
  },
  {
    date: new Date('2017-10-19'),
    changes: 'Added initial support.',
    contributors: [TheBadBossy],
  },
];
