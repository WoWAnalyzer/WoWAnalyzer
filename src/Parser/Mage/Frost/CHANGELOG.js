import React from 'react';

import { Sharrq, sref } from 'CONTRIBUTORS';
import SPELLS from 'common/SPELLS';
import SpellLink from 'common/SpellLink';
import ItemLink from 'common/ItemLink';
import ITEMS from 'common/ITEMS';

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
    changes: <React.Fragment>Added support for <SpellLink id={SPELLS.FROST_MAGE_T21_4SET_BONUS_BUFF.id} /></React.Fragment>,
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
    changes: <React.Fragment>Added support for <SpellLink id={SPELLS.FROST_MAGE_T21_2SET_BONUS_BUFF.id} /></React.Fragment>,
    contributors: [sref],
  },
  {
    date: new Date('2017-11-04'),
    changes: <React.Fragment>Reworked and updated <SpellLink id={SPELLS.GLACIAL_SPIKE_DAMAGE.id} /> module</React.Fragment>,
    contributors: [sref],
  },
  {
    date: new Date('2017-11-04'),
    changes: <React.Fragment>Added support for <SpellLink id={SPELLS.FROST_MAGE_T20_4SET_BONUS_BUFF.id} /></React.Fragment>,
    contributors: [sref],
  },
  {
    date: new Date('2017-11-04'),
    changes: <React.Fragment>Added support for <ItemLink id={ITEMS.ICE_TIME.id} /> and <ItemLink id={ITEMS.LADY_VASHJS_GRASP.id} /> Legendaries</React.Fragment>,
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
    changes: <React.Fragment>Added <SpellLink id={SPELLS.FROST_BOMB_TALENT.id} />, <SpellLink id={SPELLS.UNSTABLE_MAGIC_TALENT.id} />, and <SpellLink id={SPELLS.ARCTIC_GALE_TALENT.id} /> modules</React.Fragment>,
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
    changes: <React.Fragment>Added Support for <ItemLink id={ITEMS.ZANNESU_JOURNEY.id} />, <ItemLink id={ITEMS.MAGTHERIDONS_BANISHED_BRACERS.id} />, and <ItemLink id={ITEMS.SHATTERED_FRAGMENTS_OF_SINDRAGOSA.id} /></React.Fragment>,
    contributors: [Sharrq],
  },
  {
    date: new Date('2017-10-08'),
    changes: 'Added spec',
    contributors: [Sharrq],
  },
];
