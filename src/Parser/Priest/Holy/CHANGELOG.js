import React from 'react';

import { enragednuke, Dyspho, Skamer } from 'CONTRIBUTORS';
import Wrapper from 'common/Wrapper';

export default [
  {
    date: new Date('01-12-2018'),
    changes: 'Added Divine Hymn buff contribution',
    contributors: [enragednuke],
  },
  {
    date: new Date('11-06-2017'),
    changes: 'Added support for T21',
    contributors: [Dyspho],
  },
  {
    date: new Date('09-03-2017'),
    changes: 'Added Echo of Light (Mastery) breakdown',
    contributors: [enragednuke],
  },
  {
    date: new Date('07-22-2017'),
    changes: 'Added Holy Word: Sanctify efficiency metric and fixed an issue with Prayer of Mending cast efficiency',
    contributors: [enragednuke],
  },
  {
    date: new Date('07-05-2017'),
    changes: 'Added Enduring Renewal, Light of Tuure (incl. buff) and fixed a bug that greatly overvalued Divinity',
    contributors: [enragednuke],
  },
  {
    date: new Date('07-04-2017'),
    changes: 'Added Divinity talent.',
    contributors: [Skamer],
  },
  {
    date: new Date('07-02-2017'),
    changes: 'Apotheosis now correctly reduces the mana cost of Holy Word spells. Added Symbol of Hope talent.',
    contributors: [Skamer],
  },
  {
    date: new Date('07-01-2016'),
    changes: <Wrapper>Added <span class="Priest">Holy Priest</span> support</Wrapper>,
    contributors: [enragednuke],
  },
];
