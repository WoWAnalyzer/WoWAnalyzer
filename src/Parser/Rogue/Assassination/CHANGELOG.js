import React from 'react';

import SPELLS from 'common/SPELLS';
import SpellLink from 'common/SpellLink';
import ITEMS from 'common/ITEMS';
import ItemLink from 'common/ItemLink';

import { tsabo, Cloake, Hewhosmites, Zerotorescue } from 'CONTRIBUTORS';

export default [
  {
    date: new Date('2018-08-02'),
    changes: 'Added natural energy regen.',
    contributors: [tsabo],
  },
  {
    date: new Date('2018-07-27'),
    changes: <React.Fragment>Added <SpellLink id={SPELLS.ELABORATE_PLANNING_TALENT.id} /> support.</React.Fragment>,
    contributors: [Cloake],
  },
  {
    date: new Date('2018-07-09'),
    changes: 'Added blindside support.',
    contributors: [tsabo],
  },
  {
    date: new Date('2018-07-07'),
    changes: 'Update for prepatch.',
    contributors: [tsabo],
  },
  {
    date: new Date('2018-06-24'),
    changes: 'Update all abilities to new BFA values.',
    contributors: [Zerotorescue],
  },
  {
    date: new Date('2018-03-01'),
    changes: <React.Fragment>Added <ItemLink id={ITEMS.ZOLDYCK_FAMILY_TRAINING_SHACKLES.id} icon /></React.Fragment>,
    contributors: [Hewhosmites],
  },
  {
    date: new Date('2018-02-14'),
    changes: <React.Fragment>Added support for tracking <SpellLink id={SPELLS.ASSA_ROGUE_T21_2SET_BONUS.id} icon /> uptime.</React.Fragment>,
    contributors: [Cloake],
  },
  {
    date: new Date('2018-02-12'),
    changes: <React.Fragment>Added support for <ItemLink id={ITEMS.DUSKWALKERS_FOOTPADS.id} icon />.</React.Fragment>,
    contributors: [Cloake],
  },
  {
    date: new Date('2018-01-20'),
    changes: 'Set up the spec in a way to make it easy for someone else to contribute. Added a few basic metrics based on my current Subtlety implementation.',
    contributors: [tsabo],
  }];
