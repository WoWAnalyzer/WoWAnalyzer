import React from 'react';

import { TheBadBossy, Aelexe } from 'CONTRIBUTORS';
import SPELLS from 'common/SPELLS';
import SpellLink from 'common/SpellLink';

export default [
  {
    date: new Date('2018-06-16'),
    changes: <React.Fragment>Fixed a rare crash when casting <SpellLink id={SPELLS.EXECUTE.id} /> on a non-boss target.</React.Fragment>,
    contributors: [Aelexe],
  },
  {
    date: new Date('2018-05-02'),
    changes: 'Added tier 21 2 piece damage statistic.',
    contributors: [Aelexe],
  },
  {
    date: new Date('2018-04-19'),
    changes: <React.Fragment>Added suggestion for GCD use during <SpellLink id={SPELLS.BATTLE_CRY.id} />.</React.Fragment>,
    contributors: [Aelexe],
  },
  {
    date: new Date('2018-04-13'),
    changes: <React.Fragment>Added suggestions for <SpellLink id={SPELLS.SLAM.id} /> and <SpellLink id={SPELLS.WHIRLWIND.id} /> usage.</React.Fragment>,
    contributors: [Aelexe],
  },
  {
    date: new Date('2018-04-12'),
    changes: <React.Fragment>Added a suggestion for avoiding using <SpellLink id={SPELLS.MORTAL_STRIKE.id} /> without <SpellLink id={SPELLS.SHATTERED_DEFENSES.id} /> where possible.</React.Fragment>,
    contributors: [Aelexe],
  },
  {
    date: new Date('2018-04-10'),
    changes: <React.Fragment>Added a suggestion for not using <SpellLink id={SPELLS.REND_TALENT.id} /> on a target in <SpellLink id={SPELLS.EXECUTE.id} /> range.</React.Fragment>,
    contributors: [Aelexe],
  },
  {
    date: new Date('2018-04-12'),
    changes: <React.Fragment>Added a suggestion for avoiding wasted <SpellLink id={SPELLS.EXECUTIONERS_PRECISION.id} /> stacks.</React.Fragment>,
    contributors: [Aelexe],
  },
  {
    date: new Date('2018-04-12'),
    changes: <React.Fragment>Added a suggestion for avoiding wasted <SpellLink id={SPELLS.SHATTERED_DEFENSES.id} /> with <SpellLink id={SPELLS.COLOSSUS_SMASH.id} />.</React.Fragment>,
    contributors: [Aelexe],
  },
  {
    date: new Date('2018-04-10'),
    changes: <React.Fragment>Added <SpellLink id={SPELLS.BATTLE_CRY.id} /> statistic block.</React.Fragment>,
    contributors: [Aelexe],
  },
  {
    date: new Date('2018-04-09'),
    changes: <React.Fragment>Added a suggestion for preparing <SpellLink id={SPELLS.SHATTERED_DEFENSES.id} /> for <SpellLink id={SPELLS.BATTLE_CRY.id} />.</React.Fragment>,
    contributors: [Aelexe],
  },
  {
    date: new Date('2018-04-09'),
    changes: <React.Fragment>Add <SpellLink id={SPELLS.CHARGE.id} /> cooldown and charge modifications for <SpellLink id={SPELLS.DOUBLE_TIME_TALENT.id} />.</React.Fragment>,
    contributors: [Aelexe],
  },
  {
    date: new Date('2018-04-05'),
    changes: <React.Fragment>Added improved suggestions for <SpellLink id={SPELLS.CHARGE.id} />, <SpellLink id={SPELLS.HEROIC_LEAP.id} /> and <SpellLink id={SPELLS.COMMANDING_SHOUT.id} />.</React.Fragment>,
    contributors: [Aelexe],
  },
  {
    date: new Date('2018-04-05'),
    changes: <React.Fragment>Added <SpellLink id={SPELLS.MORTAL_STRIKE.id} /> haste cooldown reduction and <SpellLink id={SPELLS.TACTICIAN.id} /> cooldown resets.</React.Fragment>,
    contributors: [Aelexe],
  },
  {
    date: new Date('2018-04-05'),
    changes: <React.Fragment>Added <SpellLink id={SPELLS.BLADESTORM.id} /> channeling.</React.Fragment>,
    contributors: [Aelexe],
  },
  {
    date: new Date('2018-04-05'),
    changes: <React.Fragment>Added <SpellLink id={SPELLS.IN_FOR_THE_KILL_TALENT.id} /> haste buff.</React.Fragment>,
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
