import React from 'react';

import { Hewhosmites } from 'CONTRIBUTORS';
import Wrapper from 'common/Wrapper';
import ITEMS from 'common/ITEMS';
import ItemLink from 'common/ItemLink';

export default [
	{
		date: new Date('2018-03-14'),
		changes: <Wrapper>Added <ItemLink id={ITEMS.TYELCA_FERREN_MARCUSS_STATURE.id} icon/></Wrapper>,
		contributors: [Hewhosmites],
	},
  {
    date: new Date('2018-03-03'),
    changes: <Wrapper>Added <ItemLink id={ITEMS.PILLARS_OF_INMOST_LIGHT.id} icon /></Wrapper>,
    contributors: [Hewhosmites],
  },
];
