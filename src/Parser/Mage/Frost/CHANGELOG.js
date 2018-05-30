import React from 'react';

import { Sharrq, sref } from 'CONTRIBUTORS';
import SPELLS from 'common/SPELLS';
import SpellLink from 'common/SpellLink';

export default [
  {
    date: new Date('2018-01-27'),
    changes: <React.Fragment>Marked spec completeness as Great!</React.Fragment>,
    contributors: [Sharrq],
  },
  {
    date: new Date('2018-01-01'),
    changes: <React.Fragment>Added a 'Fish for procs' entry to the Checklist, and reworded/updated several suggestion metrics.</React.Fragment>,
    contributors: [sref],
  },
  {
    date: new Date('2017-12-29'),
    changes: <React.Fragment>Added support for T21 4pc</React.Fragment>,
    contributors: [sref],
  },
  {
    date: new Date('2017-12-27'),
    changes: 'Converted Changelog to new format',
    contributors: [Sharrq],
  },
  {
    date: new Date('2017-12-24'),
    changes: 'Added Checklist',
    contributors: [sref],
  },
  {
    date: new Date('2017-12-01'),
    changes: <React.Fragment>Added support for T21 2pc</React.Fragment>,
    contributors: [sref],
  },
  {
    date: new Date('2017-11-04'),
    changes: <React.Fragment>Reworked and updated <SpellLink id={SPELLS.GLACIAL_SPIKE_DAMAGE.id} /> module</React.Fragment>,
    contributors: [sref],
  },
  {
    date: new Date('2017-11-04'),
    changes: <React.Fragment>Added support for T20 4pc</React.Fragment>,
    contributors: [sref],
  },
  {
    date: new Date('2017-11-04'),
    changes: <React.Fragment>Added support for Ice Time and Lady Vashj's Grasp Legendaries</React.Fragment>,
    contributors: [sref],
  },
  {
    date: new Date('2017-10-30'),
    changes: 'Added Cancelled Casts module',
    contributors: [Sharrq],
  },
  {
    date: new Date('2017-10-29'),
    changes: <React.Fragment>Added <SpellLink id={SPELLS.ICE_LANCE.id} /> Utilization module</React.Fragment>,
    contributors: [Sharrq],
  },
  {
    date: new Date('2017-10-28'),
    changes: <React.Fragment>Enhanced display of <SpellLink id={SPELLS.WINTERS_CHILL.id} /> and <SpellLink id={SPELLS.BRAIN_FREEZE.id} /> statistics</React.Fragment>,
    contributors: [sref],
  },
  {
    date: new Date('2017-10-28'),
    changes: <React.Fragment>Added <SpellLink id={SPELLS.SPLITTING_ICE_TALENT.id} /> module</React.Fragment>,
    contributors: [sref],
  },
  {
    date: new Date('2017-10-17'),
    changes: <React.Fragment>Added Frost Bomb, Unstable Magic, and Actic Gale modules</React.Fragment>,
    contributors: [sref],
  },
  {
    date: new Date('2017-10-17'),
    changes: <React.Fragment>Added <SpellLink id={SPELLS.RUNE_OF_POWER_BUFF.id} /> and <SpellLink id={SPELLS.MIRROR_IMAGE_SUMMON.id} /> modules</React.Fragment>,
    contributors: [sref],
  },
  {
    date: new Date('2017-10-16'),
    changes: <React.Fragment>Added Cooldown Reduction Tracking for <SpellLink id={SPELLS.FROZEN_ORB.id} /> and <SpellLink id={SPELLS.ICY_VEINS.id} /></React.Fragment>,
    contributors: [Sharrq],
  },
  {
    date: new Date('2017-10-15'),
    changes: <React.Fragment>Added Support for Zannesu' Journey, Magtheridon's Banished Bracers, and Shattered Fragments of Sindragosa</React.Fragment>,
    contributors: [Sharrq],
  },
  {
    date: new Date('2017-10-08'),
    changes: 'Added spec',
    contributors: [Sharrq],
  },
];
