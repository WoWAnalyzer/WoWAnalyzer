import React from 'react';

import { enragednuke, Dyspho, Skamer } from 'CONTRIBUTORS';

export default [
  {
    date: new Date('2018-01-12'),
    changes: 'Added Divine Hymn buff contribution',
    contributors: [enragednuke],
  },
  {
    date: new Date('2017-11-06'),
    changes: 'Added support for T21',
    contributors: [Dyspho],
  },
  {
    date: new Date('2017-09-03'),
    changes: 'Added Echo of Light (Mastery) breakdown',
    contributors: [enragednuke],
  },
  {
    date: new Date('2017-07-22'),
    changes: 'Added Holy Word: Sanctify efficiency metric and fixed an issue with Prayer of Mending cast efficiency',
    contributors: [enragednuke],
  },
  {
    date: new Date('2017-07-05'),
    changes: 'Added Enduring Renewal, Light of Tuure (incl. buff) and fixed a bug that greatly overvalued Divinity',
    contributors: [enragednuke],
  },
  {
    date: new Date('2017-07-04'),
    changes: 'Added Divinity talent.',
    contributors: [Skamer],
  },
  {
    date: new Date('2017-07-02'),
    changes: 'Apotheosis now correctly reduces the mana cost of Holy Word spells. Added Symbol of Hope talent.',
    contributors: [Skamer],
  },
  {
    date: new Date('2017-07-01'),
    changes: <React.Fragment>Added <span className="Priest">Holy Priest</span> support</React.Fragment>,
    contributors: [enragednuke],
  },
];
