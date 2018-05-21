import React from 'react';

import { faide, WOPR, Gebuz, Yajinni} from 'CONTRIBUTORS';
import ItemLink from 'common/ItemLink';
import ITEMS from 'common/ITEMS';
import SPELLS from 'common/SPELLS';
import SpellLink from 'common/SpellLink';

export default [
  {
    date: new Date('2018-05-19'),
    changes: <React.Fragment>Added death recap tab and defensive abilities tracking.</React.Fragment>,
    contributors: [Yajinni],
  },
  {
    date: new Date('2018-04-10'),
    changes: <React.Fragment>Fixed an issue where looking for the presence of <SpellLink id={SPELLS.MOONFIRE.id} /> on some enemies would crash the analyzer.</React.Fragment>,
    contributors: [faide],
  },
  {
    date: new Date('2018-04-07'),
    changes: <React.Fragment>Fixed an issue where <SpellLink id={SPELLS.MANGLE_BEAR.id} /> and <SpellLink id={SPELLS.THRASH_BEAR.id} /> max casts were not calculated correctly when using <SpellLink id={SPELLS.INCARNATION_GUARDIAN_OF_URSOC_TALENT.id} />.</React.Fragment>,
    contributors: [Gebuz],
  },
  {
    date: new Date('2018-03-26'),
    changes: 'Highlight bad filler casts on the timeline.',
    contributors: [Gebuz],
  },
  {
    date: new Date('2017-08-29'),
    changes: <React.Fragment>Added <ItemLink id={ITEMS.FURY_OF_NATURE.id} /> and <ItemLink id={ITEMS.LUFFA_WRAPPINGS.id} /> statistics.</React.Fragment>,
    contributors: [faide],
  },
  {
    date: new Date('2017-08-29'),
    changes: <React.Fragment>Added <SpellLink id={SPELLS.EARTHWARDEN_TALENT.id} /> metrics and suggestions.</React.Fragment>,
    contributors: [faide],
  },
  {
    date: new Date('2017-08-28'),
    changes: <React.Fragment>Fixed <SpellLink id={SPELLS.STAMPEDING_ROAR_BEAR.id} /> cast efficiency to work with <SpellLink id={SPELLS.GUTTURAL_ROARS_TALENT.id} />.</React.Fragment>,
    contributors: [faide],
  },
  {
    date: new Date('2017-08-23'),
    changes: 'Added rage waste statistic and suggestion.',
    contributors: [faide],
  },
  {
    date: new Date('2017-08-22'),
    changes: <React.Fragment>Fixed issue with calculation of <SpellLink id={SPELLS.FRENZIED_REGENERATION.id} /> by <SpellLink id={SPELLS.GUARDIAN_OF_ELUNE_TALENT.id} />.</React.Fragment>,
    contributors: [WOPR],
  },
  {
    date: new Date('2017-08-22'),
    changes: <React.Fragment>Fix to <SpellLink id={SPELLS.IRONFUR.id} /> uptime suggestion.</React.Fragment>,
    contributors: [WOPR],
  },
  {
    date: new Date('2017-08-19'),
    changes: <React.Fragment>Added <ItemLink id={ITEMS.SKYSECS_HOLD.id} /> statistic and suggestion.</React.Fragment>,
    contributors: [faide],
  },
  {
    date: new Date('2017-08-19'),
    changes: <React.Fragment>Added detail on <SpellLink id={SPELLS.IRONFUR.id} /> usage.</React.Fragment>,
    contributors: [],
  },
  {
    date: new Date('2017-08-18'),
    changes: 'Updates to align with new module structure and added overkill into DTPS display.',
    contributors: [],
  },
  {
    date: new Date('2017-08-13'),
    changes: <React.Fragment>Added damage type into the tooltip of damage taken, added logic for <SpellLink id={SPELLS.PULVERIZE_TALENT.id} /> and minor fixes.</React.Fragment>,
    contributors: [WOPR],
  },
];
