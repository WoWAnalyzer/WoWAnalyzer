import React from 'react';

import { hassebewlen } from 'MAINTAINERS';
import Wrapper from 'common/Wrapper';
import ItemLink from 'common/ItemLink';
import ITEMS from 'common/ITEMS';


export default [
    {
        date: new Date('2017-12-14'),
        changes: 'Added Tier 21 2 & 4P gains.',
        contributors: [hassebewlen],
    },
    {
        date: new Date('2017-12-09'),
        changes: 'Fixed skippable casts threshold to the correct 140% haste.',
        contributors: [hassebewlen],
    },
    {
        date: new Date('2017-12-04'),
        changes: 'Added skippable casts. Mastery values added. Twist Of Fate uptime added. Changed layout. Fixed cooldown on Mind blast.',
        contributors: [hassebewlen],
    },
    {
        date: new Date('2017-11-25'),
        changes: 'Fixed damage increase modifier of Heart of the Void & cooldown on Shadow crash due to class changes.',
        contributors: [hassebewlen],
    },
    {
        date: new Date('2017-11-15'),
        changes: <Wrapper>Added
            <ItemLink id={ITEMS.THE_TWINS_PAINFUL_TOUCH.id} />,
            <ItemLink id={ITEMS.ANUNDS_SEARED_SHACKLES.id} />,
            <ItemLink id={ITEMS.HEART_OF_THE_VOID.id} />,
            <ItemLink id={ITEMS.ZENKARAM_IRIDIS_ANADEM.id} />.
        </Wrapper>,
        contributors: [hassebewlen],
    },
    {
        date: new Date('2017-11-04'),
        changes: 'Fixed ABC downtime.',
        contributors: [hassebewlen],
    },
    {
        date: new Date('2017-08-29'),
        changes: 'Added Insanity Resource on the Voidform graphs. Fixed pet damage.',
        contributors: [hassebewlen],
    },
    {
        date: new Date('2017-08-26'),
        changes: 'Initial implementation.',
        contributors: [hassebewlen],
    },
];
