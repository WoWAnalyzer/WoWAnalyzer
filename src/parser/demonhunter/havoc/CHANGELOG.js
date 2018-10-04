import React from 'react';

import { Mamtooth } from 'CONTRIBUTORS';
import ITEMS from 'common/ITEMS';
import ItemLink from 'common/ItemLink';

export default [
  {
    date: new Date('2018-08-05'),
    changes: <React.Fragment>Added <ItemLink id={ITEMS.SOUL_OF_THE_SLAYER.id} icon /> suggestions talents picks for BfA.</React.Fragment>,
    contributors: [Mamtooth],
  },
  {
    date: new Date('2018-08-01'),
    changes: <React.Fragment>Implemented Checklist feature.</React.Fragment>,
    contributors: [Mamtooth],
  },
  {
    date: new Date('2018-07-28'),
    changes: <React.Fragment>Inserted new BfA spells, so the Statistics tab is now up and working again.</React.Fragment>,
    contributors: [Mamtooth],
  },
  {
    date: new Date('2018-07-28'),
    changes: <React.Fragment>Removed artifact spell cast suggestion.</React.Fragment>,
    contributors: [Mamtooth],
  },
];
