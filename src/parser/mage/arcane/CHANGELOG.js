import React from 'react';

import { Sharrq } from 'CONTRIBUTORS';
import SPELLS from 'common/SPELLS';
import SpellLink from 'common/SpellLink';

export default [
  {
    date: new Date('2018-08-28'),
    changes: <>Added support for <SpellLink id={SPELLS.GALVANIZING_SPARK.id} /> and <SpellLink id={SPELLS.ANOMALOUS_IMPACT.id} /></>,
    contributors: [Sharrq],
    clIndex: 'Arcane20180828.1',
  },
  {
    date: new Date('2018-08-11'),
    changes: <>Added <SpellLink id={SPELLS.ARCANE_MISSILES.id} /> Module and <SpellLink id={SPELLS.TIME_ANOMALY_TALENT.id} /> Mana Management.</>,
    contributors: [Sharrq],
    clIndex: 'Arcane20180811.1',
  },
  {
    date: new Date('2018-08-10'),
    changes: <>Added Check to see if the player went OOM during <SpellLink id={SPELLS.ARCANE_POWER.id} />.</>,
    contributors: [Sharrq],
    clIndex: 'Arcane20180810.1',
  },
  {
    date: new Date('2018-08-09'),
    changes: 'Added Checklist',
    contributors: [Sharrq],
    clIndex: 'Arcane20180809.1',
  },
  {
    date: new Date('2018-08-02'),
    changes: <>Removed <SpellLink id={SPELLS.ARCANE_MISSILES.id} /> module as it is no longer relevant. Also fixed Arcane Charge event order.</>,
    contributors: [Sharrq],
    clIndex: 'Arcane20180802.1',
  },
  {
    date: new Date('2018-08-01'),
    changes: <>Added Support for <SpellLink id={SPELLS.RULE_OF_THREES_TALENT.id} />.</>,
    contributors: [Sharrq],
    clIndex: 'Arcane20180801.1',
  },
  {
    date: new Date('2018-07-28'),
    changes: <>Added Support for <SpellLink id={SPELLS.ARCANE_POWER.id} />.</>,
    contributors: [Sharrq],
    clIndex: 'Arcane20180728.1',
  },
  {
    date: new Date('2018-07-25'),
    changes: 'Added Arcane Charge Tracking and Mana Chart.',
    contributors: [Sharrq],
    clIndex: 'Arcane20180725.1',
  },
  {
    date: new Date('2018-07-23'),
    changes: <>Added Support for <SpellLink id={SPELLS.ARCANE_FAMILIAR_TALENT.id} />, <SpellLink id={SPELLS.ARCANE_ORB_TALENT.id} />, and <SpellLink id={SPELLS.ARCANE_INTELLECT.id} />.</>,
    contributors: [Sharrq],
    clIndex: 'Arcane20180723.2',
  },
  {
    date: new Date('2018-07-23'),
    changes: <>Removed <SpellLink id={SPELLS.EVOCATION.id} /> Suggestion, Updated for 8.0.1, Resolved some Abilities Bugs</>,
    contributors: [Sharrq],
    clIndex: 'Arcane20180723.1',
  },
];
