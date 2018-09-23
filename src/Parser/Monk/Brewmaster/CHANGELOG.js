import React from 'react';

import { emallson } from 'CONTRIBUTORS';
import ITEMS from 'common/ITEMS';
import ItemLink from 'common/ItemLink';
import SPELLS from 'common/SPELLS';
import SpellLink from 'common/SpellLink';

export default [
  {
    date: new Date('2018-09-22'),
    changes: <React.Fragment>Added support for <SpellLink id={SPELLS.FIT_TO_BURST.id} />.</React.Fragment>,
    contributors: [emallson],
  }, 
  {
    date: new Date('2018-09-13'),
    changes: <React.Fragment>Added support for <SpellLink id={SPELLS.ELUSIVE_FOOTWORK.id} />.</React.Fragment>,
    contributors: [emallson],
  },
  {
    date: new Date('2018-08-11'),
    changes: <React.Fragment>Added support for <SpellLink id={SPELLS.STAGGERING_STRIKES.id} />.</React.Fragment>,
    contributors: [emallson],
  },
  {
    date: new Date('2018-07-22'),
    changes: <React.Fragment>Updated support for <ItemLink id={ITEMS.SOUL_OF_THE_GRANDMASTER.id} /> and temporarily disabled the <SpellLink id={SPELLS.MASTERY_ELUSIVE_BRAWLER.id} /> module pending new formula coefficients.</React.Fragment>,
    contributors: [emallson],
  },
  {
    date: new Date('2018-07-18'),
    changes: <React.Fragment>Added support for <SpellLink id={SPELLS.LIGHT_BREWING_TALENT.id} />.</React.Fragment>,
    contributors: [emallson],
  },
  {
    date: new Date('2018-07-15'),
    changes: <React.Fragment>Added <SpellLink id={SPELLS.TRAINING_OF_NIUZAO.id} /> support.</React.Fragment>,
    contributors: [emallson],
  },
  {
    date: new Date('2018-06-16'),
    changes: <React.Fragment>Updated <SpellLink id={SPELLS.IRONSKIN_BREW.id} /> cooldown and duration and added <SpellLink id={SPELLS.GUARD_TALENT.id} />, along with other changes in beta build 26812.</React.Fragment>,
    contributors: [emallson],
  },
];
