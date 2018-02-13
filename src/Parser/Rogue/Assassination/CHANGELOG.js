import React from 'react';

import ITEMS from 'common/ITEMS';
import ItemLink from 'common/ItemLink';
import Wrapper from 'common/Wrapper';

import { tsabo, Cloake } from 'MAINTAINERS';

export default  [
  {
    date: new Date('2018-02-12'),
    changes: <Wrapper>Added support for <ItemLink id={ITEMS.DUSKWALKERS_FOOTPADS.id} icon/>.</Wrapper>,
    contributors: [Cloake],
  },
  {
    date: new Date('2018-01-20'),
    changes: 'Set up the spec in a way to make it easy for someone else to contribute. Added a few basic metrics based on my current Subtlety implementation.',
    contributors: [tsabo],
  }];
