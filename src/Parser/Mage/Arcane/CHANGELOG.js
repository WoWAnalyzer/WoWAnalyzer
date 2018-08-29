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
    changes: <React.Fragment>Added Arcane Missiles Module and Time Anomaly Mana Management.</React.Fragment>,
    contributors: [Sharrq],
  },
  {
    date: new Date('2018-08-10'),
    changes: <React.Fragment>Added Check to see if the player went OOM during Arcane Power.</React.Fragment>,
    contributors: [Sharrq],
  },
  {
    date: new Date('2018-08-09'),
    changes: <React.Fragment>Added Checklist</React.Fragment>,
    contributors: [Sharrq],
  },
  {
    date: new Date('2018-08-02'),
    changes: <React.Fragment>Removed Arcane Missiles module as it is no longer relevant. Also fixed Arcane Charge event order.</React.Fragment>,
    contributors: [Sharrq],
  },
  {
    date: new Date('2018-08-01'),
    changes: <React.Fragment>Added Support for Rule of Threes.</React.Fragment>,
    contributors: [Sharrq],
  },
  {
    date: new Date('2018-07-28'),
    changes: <React.Fragment>Added Support for Arcane Power.</React.Fragment>,
    contributors: [Sharrq],
  },
  {
    date: new Date('2018-07-25'),
    changes: <React.Fragment>Added Arcane Charge Tracking and Mana Chart.</React.Fragment>,
    contributors: [Sharrq],
  },
  {
    date: new Date('2018-07-23'),
    changes: <React.Fragment>Added Support for Arcane Familiar, Arcane Orb, and Arcane Intellect.</React.Fragment>,
    contributors: [Sharrq],
  },
  {
    date: new Date('2018-07-23'),
    changes: <React.Fragment>Removed Evocate Suggestion, Updated for 8.0.1, Resolved some Abilities Bugs</React.Fragment>,
    contributors: [Sharrq],
  },
  {
    date: new Date('2018-01-27'),
    changes: <React.Fragment>Added Spec</React.Fragment>,
    contributors: [Sharrq],
  },
];
