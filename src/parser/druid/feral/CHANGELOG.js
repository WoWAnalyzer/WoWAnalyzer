import React from 'react';

import { Anatta336 } from 'CONTRIBUTORS';
import SPELLS from 'common/SPELLS';
import SpellLink from 'common/SpellLink';

export default [
  {
    date: new Date('2018-12-20'),
    changes: <>Updated tracking of <SpellLink id={SPELLS.RIP.id} /> snapshots, and interaction with <SpellLink id={SPELLS.SABERTOOTH_TALENT.id} /> for patch 8.1.</>,
    contributors: [Anatta336],
  },
  {
    date: new Date('2018-10-10'),
    changes: <>Added tracking to Feral for the <SpellLink id={SPELLS.WILD_FLESHRENDING.id} /> Azerite trait.</>,
    contributors: [Anatta336],
  },
  {
    date: new Date('2018-10-05'),
    changes: <React.Fragment>Added tracking for using <SpellLink id={SPELLS.SHADOWMELD.id} /> to buff <SpellLink id={SPELLS.RAKE.id} /> damage.</React.Fragment>,
    contributors: [Anatta336],
  },
  {
    date: new Date('2018-08-11'),
    changes: <>Added tracking for wasted energy from <SpellLink id={SPELLS.TIGERS_FURY.id} /> and a breakdown of how energy is spent.</>,
    contributors: [Anatta336],
  },
  {
    date: new Date('2018-08-05'),
    changes: <>Added a checklist for Feral.</>,
    contributors: [Anatta336],
  },
  {
    date: new Date('2018-07-22'),
    changes: <>Corrected <SpellLink id={SPELLS.SAVAGE_ROAR_TALENT.id} /> to only claim credit for damage from abilities it affects in 8.0.1</>,
    contributors: [Anatta336],
  },
  {
    date: new Date('2018-07-15'),
    changes: <>Fixed bugs with combo generation from AoE attacks and detecting when <SpellLink id={SPELLS.PRIMAL_FURY.id} /> waste is unavoidable.</>,
    contributors: [Anatta336],
  },
  {
    date: new Date('2018-07-15'),
    changes: <>Added tracking for how <SpellLink id={SPELLS.BLOODTALONS_TALENT.id} /> charges are used.</>,
    contributors: [Anatta336],
  },
  {
    date: new Date('2018-07-15'),
    changes: 'Added tracking of time spent at maximum energy.',
    contributors: [Anatta336],
  },
  {
    date: new Date('2018-07-15'),
    changes: <>Added tracking for number of targets hit by <SpellLink id={SPELLS.SWIPE_CAT.id} />, <SpellLink id={SPELLS.THRASH_FERAL.id} />, and <SpellLink id={SPELLS.BRUTAL_SLASH_TALENT.id} />.</>,
    contributors: [Anatta336],
  },
];
