import React from 'react';

import { faide, WOPR, Gebuz } from 'CONTRIBUTORS';
import Wrapper from 'common/Wrapper';
import ItemLink from 'common/ItemLink';
import ITEMS from 'common/ITEMS';
import SPELLS from 'common/SPELLS';
import SpellLink from 'common/SpellLink';

export default [
  { 
    date: new Date('2018-04-07'),
    changes: <Wrapper>Fixed an issue where <SpellLink id={SPELLS.MANGLE_BEAR.id} /> and <SpellLink id={SPELLS.THRASH_BEAR.id} /> max casts were not calculated correctly when using <SpellLink id={SPELLS.INCARNATION_GUARDIAN_OF_URSOC_TALENT.id} />.</Wrapper>,
    contributors: [Gebuz],
  },
  { 
    date: new Date('2018-03-26'),
    changes: 'Highlight bad filler casts on the timeline.',
    contributors: [Gebuz],
  },
  { 
    date: new Date('2017-08-29'),
    changes: <Wrapper>Added <ItemLink id={ITEMS.FURY_OF_NATURE.id} /> and <ItemLink id={ITEMS.LUFFA_WRAPPINGS.id} /> statistics.</Wrapper>,
    contributors: [faide],
  },
  { 
    date: new Date('2017-08-29'),
    changes: <Wrapper>Added <SpellLink id={SPELLS.EARTHWARDEN_TALENT.id} /> metrics and suggestions.</Wrapper>,
    contributors: [faide],
  },
  { 
    date: new Date('2017-08-28'),
    changes: <Wrapper>Fixed <SpellLink id={SPELLS.STAMPEDING_ROAR_BEAR.id} /> cast efficiency to work with <SpellLink id={SPELLS.GUTTURAL_ROARS_TALENT.id} />.</Wrapper>,
    contributors: [faide],
  },
  { 
    date: new Date('2017-08-23'),
    changes: 'Added rage waste statistic and suggestion.',
    contributors: [faide],
  },
  { 
    date: new Date('2017-08-22'),
    changes: <Wrapper>Fixed issue with calculation of <SpellLink id={SPELLS.FRENZIED_REGENERATION.id} /> by <SpellLink id={SPELLS.GUARDIAN_OF_ELUNE_TALENT.id} />.</Wrapper>,
    contributors: [WOPR],
  },
  { 
    date: new Date('2017-08-22'),
    changes: <Wrapper>Fix to <SpellLink id={SPELLS.IRONFUR.id} /> uptime suggestion.</Wrapper>,
    contributors: [WOPR],
  },
  { 
    date: new Date('2017-08-19'),
    changes: <Wrapper>Added <ItemLink id={ITEMS.SKYSECS_HOLD.id} /> statistic and suggestion.</Wrapper>,
    contributors: [faide],
  },
  { 
    date: new Date('2017-08-19'),
    changes: <Wrapper>Added detail on <SpellLink id={SPELLS.IRONFUR.id} /> usage.</Wrapper>,
    contributors: [],
  },
  { 
    date: new Date('2017-08-18'),
    changes: 'Updates to align with new module structure and added overkill into DTPS display.',
    contributors: [],
  },
  { 
    date: new Date('2017-08-13'),
    changes: <Wrapper>Added damage type into the tooltip of damage taken, added logic for <SpellLink id={SPELLS.PULVERIZE_TALENT.id} /> and minor fixes.</Wrapper>,
    contributors: [WOPR],
  },
];
