import React from 'react';

import { faide, WOPR } from 'MAINTAINERS';
import Wrapper from 'common/Wrapper';
import ItemLink from 'common/ItemLink';
import ITEMS from 'common/ITEMS';
import SPELLS from 'common/SPELLS';
import SpellLink from 'common/SpellLink';

export default [
  { 
    date: new Date('2017-08-29'),
    changes: 'Added Fury of Nature and Luffa Wrappings statistics.',
    contributors: [faide],
  },
  { 
    date: new Date('2017-08-29'),
    changes: 'Added Earthwarden metrics and suggestions.',
    contributors: [faide],
  },
  { 
    date: new Date('2017-08-28'),
    changes: 'Fixed Stampeding Roar cast efficiency to work with Guttural Roars.',
    contributors: [faide],
  },
  { 
    date: new Date('2017-08-23'),
    changes: 'Added rage waste statistic and suggestion.',
    contributors: [faide],
  },
  { 
    date: new Date('2017-08-22'),
    changes: 'Fixed issue with calculation of Frenzied Regenration by Guardian of Elune.',
    contributors: [WOPR],
  },
  { 
    date: new Date('2017-08-22'),
    changes: 'Fix to Ironfur uptime suggestion',
    contributors: [WOPR],
  },
  { 
    date: new Date('2017-08-19'),
    changes: 'Added Skysec\'s Hold statistic and suggestion.',
    contributors: [faide],
  },
  { 
    date: new Date('2017-08-19'),
    changes: 'Added detail on Ironfur usage.',
    contributors: [],
  },
  { 
    date: new Date('2017-08-18'),
    changes: 'Updates to align with new module structure and added overkill into DTPS display.',
    contributors: [],
  },
  { 
    date: new Date('2017-08-13'),
    changes: 'Added damage type into the tooltip of damage taken, added logic for Pulverize and minor fixes.',
    contributors: [WOPR],
  }
];
