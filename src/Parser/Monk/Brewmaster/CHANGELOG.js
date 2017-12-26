import React from 'react';
import { WOPR, Zerotorescue, emallson } from 'MAINTAINERS';

export default [
  {
    date: new Date('2017-12-24'),
    changes: 'Added ISB uptime and clipping checklist items.',
    contributors: [emallson],
  },
  {
    date: new Date('2017-08-24'),
    changes: 'Added blackout combo statistic.',
    contributors: [WOPR],
  },
  {
    date: new Date('2017-08-21'),
    changes: 'Fixed bug with stagger if a tick of the dot is absorbed it will calculate correctly.',
    contributors: [WOPR],
  },
  {
    date: new Date('2017-08-21'),
    changes: 'Added T20 2pc and 4pc stats.',
    contributors: [WOPR],
  },
  {
    date: new Date('2017-08-20'),
    changes: 'Added more information about what occured while ISB was up or not',
    contributors: [WOPR],
  },
  {
    date: new Date('2017-08-20'),
    changes: 'This is an initial implementation, will be updated soon',
    contributors: [WOPR],
  },
];
