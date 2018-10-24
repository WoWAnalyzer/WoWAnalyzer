import React from 'react';

import { Sharrq } from 'CONTRIBUTORS';
import SPELLS from 'common/SPELLS';
import SpellLink from 'common/SpellLink';

export default [
  {
    date: new Date('2018-10-11'),
    changes: <>Fixed <SpellLink id={SPELLS.ARCANE_CHARGE.id} /> Normalizer to not put energize events after <SpellLink id={SPELLS.ARCANE_BARRAGE.id} /> and added Normalizer to sort the <SpellLink id={SPELLS.ARCANE_POWER.id} /> cast before the buff application</>,
    contributors: [Sharrq],
  },
  {
    date: new Date('2018-10-11'),
    changes: <>Redid <SpellLink id={SPELLS.ARCANE_POWER.id} /> Utilization to count each pre-req separately. Also updated tooltip and suggestion to show which checks were failed.</>,
    contributors: [Sharrq],
  },
  {
    date: new Date('2018-10-11'),
    changes: <>Fixed <SpellLink id={SPELLS.RULE_OF_THREES_TALENT.id} /> bug</>,
    contributors: [Sharrq],
  },
  {
    date: new Date('2018-08-28'),
    changes: <>Added support for <SpellLink id={SPELLS.GALVANIZING_SPARK.id} /> and <SpellLink id={SPELLS.ANOMALOUS_IMPACT.id} /></>,
    contributors: [Sharrq],
  },
  {
    date: new Date('2018-08-11'),
    changes: <>Added <SpellLink id={SPELLS.ARCANE_MISSILES.id} /> Module and <SpellLink id={SPELLS.TIME_ANOMALY_TALENT.id} /> Mana Management.</>,
    contributors: [Sharrq],
  },
  {
    date: new Date('2018-08-10'),
    changes: <>Added Check to see if the player went OOM during <SpellLink id={SPELLS.ARCANE_POWER.id} />.</>,
    contributors: [Sharrq],
  },
  {
    date: new Date('2018-08-09'),
    changes: 'Added Checklist',
    contributors: [Sharrq],
  },
  {
    date: new Date('2018-08-02'),
    changes: <>Removed <SpellLink id={SPELLS.ARCANE_MISSILES.id} /> module as it is no longer relevant. Also fixed Arcane Charge event order.</>,
    contributors: [Sharrq],
  },
  {
    date: new Date('2018-08-01'),
    changes: <>Added Support for <SpellLink id={SPELLS.RULE_OF_THREES_TALENT.id} />.</>,
    contributors: [Sharrq],
  },
  {
    date: new Date('2018-07-28'),
    changes: <>Added Support for <SpellLink id={SPELLS.ARCANE_POWER.id} />.</>,
    contributors: [Sharrq],
  },
  {
    date: new Date('2018-07-25'),
    changes: 'Added Arcane Charge Tracking and Mana Chart.',
    contributors: [Sharrq],
  },
  {
    date: new Date('2018-07-23'),
    changes: <>Added Support for <SpellLink id={SPELLS.ARCANE_FAMILIAR_TALENT.id} />, <SpellLink id={SPELLS.ARCANE_ORB_TALENT.id} />, and <SpellLink id={SPELLS.ARCANE_INTELLECT.id} />.</>,
    contributors: [Sharrq],
  },
  {
    date: new Date('2018-07-23'),
    changes: <>Removed <SpellLink id={SPELLS.EVOCATION.id} /> Suggestion, Updated for 8.0.1, Resolved some Abilities Bugs</>,
    contributors: [Sharrq],
  },
];
