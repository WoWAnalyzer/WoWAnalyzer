import React from 'react';

import ZerotorescueAvatar from 'Parser/Paladin/Holy/Images/zerotorescue-avatar.png';

const Zerotorescue = ['Zerotorescue', ZerotorescueAvatar];

export default [
  {
    date: new Date('3000-01-01'),
    changes: <span style={{ color: 'red' }}>Changed completion status to <i>Not actively maintained</i> as @wopr resigned. Any help is welcome to continue support for this spec, see GitHub for more information.</span>,
    contributors: [Zerotorescue],
  },
  {
    date: new Date('2017-08-24'),
    changes: 'Added blackout combo statistic.',
    contributors: ['wopr'],
  },
  {
    date: new Date('2017-08-21'),
    changes: 'Fixed bug with stagger if a tick of the dot is absorbed it will calculate correctly.',
    contributors: ['wopr'],
  },
  {
    date: new Date('2017-08-21'),
    changes: 'Added T20 2pc and 4pc stats.',
    contributors: ['wopr'],
  },
  {
    date: new Date('2017-08-20'),
    changes: 'Added more information about what occured while ISB was up or not',
    contributors: ['wopr'],
  },
  {
    date: new Date('2017-08-20'),
    changes: 'This is an initial implementation, will be updated soon',
    contributors: ['wopr'],
  },
];
