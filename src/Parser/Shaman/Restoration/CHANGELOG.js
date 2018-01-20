import React from 'react';

import { Anomoly, Versaya, aryu, Zerotorescue, hatra344 } from 'MAINTAINERS';
import Wrapper from 'common/Wrapper';
import ITEMS from 'common/ITEMS';
import ItemLink from 'common/ItemLink';

export default [
  {
    date: new Date('2017-12-24'),
    changes: 'Implemented the checklist.',
    contributors: [hatra344],
  },
  {
    date: new Date('2017-11-29'),
    changes: <Wrapper>Added in T21 2 set and 4 set healing contribution values.</Wrapper>,
    contributors: [Anomoly],
  },
  {
    date: new Date('2017-11-16'),
    changes: <Wrapper>Fix crash when using <ItemLink id={ITEMS.FOCUSER_OF_JONAT.id}/>.</Wrapper>,
    contributors: [Zerotorescue],
  },
  {
    date: new Date('2017-11-16'),
    changes: 'Refactored Restoration Shaman spec to be in line with current spec module implementations.',
    contributors: [Anomoly],
  },
  {
    date: new Date('2017-08-20'),
    changes: 'Added Ancestral Vigor metric.',
    contributors: [aryu],
  },
  {
    date: new Date('2017-07-06'),
    changes: 'Fix crash when CBT, AG or Ascendance was cast before pull.',
    contributors: [Versaya],
  },
  {
    date: new Date('2017-05-29'),
    changes: 'Added overhealing in Cast Efficiency tab for some resto shaman spells. Fixed Uncertain Reminder in case of pre-lust. Added GotQ target efficiency. Don\'t allow CBT healing to feed into CBT.',
    contributors: [Versaya],
  },
  {
    date: new Date('2017-05-28'),
    changes: 'Added the initial support.',
    contributors: [Versaya],
  },
];
