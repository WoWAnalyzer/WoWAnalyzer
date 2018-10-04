import React from 'react';

import { Sharrq } from 'CONTRIBUTORS';
import SPELLS from 'common/SPELLS';
import SpellLink from 'common/SpellLink';

export default [
  {
    date: new Date('2018-08-28'),
    changes: <React.Fragment>Added support for <SpellLink id={SPELLS.GALVANIZING_SPARK.id} /> and <SpellLink id={SPELLS.ANOMALOUS_IMPACT.id} /></React.Fragment>,
    contributors: [Sharrq],
  },
  {
    date: new Date('2018-08-11'),
    changes: <React.Fragment>Added <SpellLink id={SPELLS.ARCANE_MISSILES.id} /> Module and <SpellLink id={SPELLS.TIME_ANOMALY_TALENT.id} /> Mana Management.</React.Fragment>,
    contributors: [Sharrq],
  },
  {
    date: new Date('2018-08-10'),
    changes: <React.Fragment>Added Check to see if the player went OOM during <SpellLink id={SPELLS.ARCANE_POWER.id} />.</React.Fragment>,
    contributors: [Sharrq],
  },
  {
    date: new Date('2018-08-09'),
    changes: 'Added Checklist',
    contributors: [Sharrq],
  },
  {
    date: new Date('2018-08-02'),
    changes: <React.Fragment>Removed <SpellLink id={SPELLS.ARCANE_MISSILES.id} /> module as it is no longer relevant. Also fixed Arcane Charge event order.</React.Fragment>,
    contributors: [Sharrq],
  },
  {
    date: new Date('2018-08-01'),
    changes: <React.Fragment>Added Support for <SpellLink id={SPELLS.RULE_OF_THREES_TALENT.id} />.</React.Fragment>,
    contributors: [Sharrq],
  },
  {
    date: new Date('2018-07-28'),
    changes: <React.Fragment>Added Support for <SpellLink id={SPELLS.ARCANE_POWER.id} />.</React.Fragment>,
    contributors: [Sharrq],
  },
  {
    date: new Date('2018-07-25'),
    changes: 'Added Arcane Charge Tracking and Mana Chart.',
    contributors: [Sharrq],
  },
  {
    date: new Date('2018-07-23'),
    changes: <React.Fragment>Added Support for <SpellLink id={SPELLS.ARCANE_FAMILIAR_TALENT.id} />, <SpellLink id={SPELLS.ARCANE_ORB_TALENT.id} />, and <SpellLink id={SPELLS.ARCANE_INTELLECT.id} />.</React.Fragment>,
    contributors: [Sharrq],
  },
  {
    date: new Date('2018-07-23'),
    changes: <React.Fragment>Removed <SpellLink id={SPELLS.EVOCATION.id} /> Suggestion, Updated for 8.0.1, Resolved some Abilities Bugs</React.Fragment>,
    contributors: [Sharrq],
  },
];
