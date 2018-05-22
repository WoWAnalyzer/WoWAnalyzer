import React from 'react';

import SPELLS from 'common/SPELLS';
import SpellLink from 'common/SpellLink';
import ITEMS from 'common/ITEMS';
import ItemLink from 'common/ItemLink';

import { tsabo, Cloake, Hewhosmites } from 'CONTRIBUTORS';

export default [
  {
    date: new Date('2018-03-1'),
    changes: <React.Fragment>Added <ItemLink id={ITEMS.ZOLDYCK_FAMILY_TRAINING_SHACKLES.id} icon/></React.Fragment>,
    contributors: [Hewhosmites],
  },
  {
    date: new Date('2018-02-14'),
    changes: <React.Fragment>Added support for tracking <SpellLink id={SPELLS.ASSA_ROGUE_T21_2SET_BONUS.id} icon/> uptime.</React.Fragment>,
    contributors: [Cloake],
  },
  {
    date: new Date('2018-02-12'),
    changes: <React.Fragment>Added support for <ItemLink id={ITEMS.DUSKWALKERS_FOOTPADS.id} icon/>.</React.Fragment>,
    contributors: [Cloake],
  },
  {
    date: new Date('2018-01-20'),
    changes: 'Set up the spec in a way to make it easy for someone else to contribute. Added a few basic metrics based on my current Subtlety implementation.',
    contributors: [tsabo],
  }];
