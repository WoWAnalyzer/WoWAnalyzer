import React from 'react';

import { WOPR, emallson } from 'CONTRIBUTORS';
import Wrapper from 'common/Wrapper';
import ITEMS from 'common/ITEMS';
import ItemLink from 'common/ItemLink';
import SPELLS from 'common/SPELLS';
import SpellLink from 'common/SpellLink';

export default [
  {
    date: new Date('2018-04-02'),
    changes: 'Added "Top the DPS Charts" checklist item.',
    contributors: [emallson],
  },
  {
    date: new Date('2018-03-19'),
    changes: <Wrapper>Converted <SpellLink id={SPELLS.BREATH_OF_FIRE.id} /> from uptime to hit tracking and updated hit tracking for <SpellLink id={SPELLS.IRONSKIN_BREW.id} />.</Wrapper>,
    contributors: [emallson],
  },
  {
    date: new Date('2018-01-29'),
    changes: 'Added plot of damage in Stagger pool over time.',
    contributors: [emallson],
  },
  {
    date: new Date('2018-01-27'),
    changes: <Wrapper>Added statistic for <SpellLink id={SPELLS.MASTERY_ELUSIVE_BRAWLER.id} /> effectiveness</Wrapper>,
    contributors: [emallson],
  },
  {
    date: new Date('2018-01-22'),
    changes: 'Added \'Damage Taken by Ability\' table.',
    contributors: [emallson],
  },
  {
    date: new Date('2018-01-18'),
    changes: 'Added High Tolerance haste statistic & changed Brew CDR to use average haste to determine target CDR value.',
    contributors: [emallson],
  },
  {
    date: new Date('2018-01-12'),
    changes: <Wrapper>Added <SpellLink id={SPELLS.PURIFYING_BREW.id} /> statistic.</Wrapper>,
    contributors: [emallson],
  },
  {
    date: new Date('2018-01-02'),
    changes: 'Added brew cooldown reduction tracking.',
    contributors: [emallson],
  },
  {
    date: new Date('2017-12-30'),
    changes: <Wrapper>Added stats for <ItemLink id={ITEMS.STORMSTOUTS_LAST_GASP.id} /> and <ItemLink id={ITEMS.SALSALABIMS_LOST_TUNIC.id} />; updated the <SpellLink id={SPELLS.BREATH_OF_FIRE.id} /> suggestion and checklist item.</Wrapper>,
    contributors: [emallson],
  },
  {
    date: new Date('2017-12-29'),
    changes: <Wrapper>Changed <SpellLink id={SPELLS.RUSHING_JADE_WIND_TALENT.id} /> suggestion from cast efficiency to uptime.</Wrapper>,
    contributors: [emallson],
  },
  {
    date: new Date('2017-12-24'),
    changes: <Wrapper>Added <SpellLink id={SPELLS.IRONSKIN_BREW_BUFF.id} /> uptime and clipping checklist items.</Wrapper>,
    contributors: [emallson],
  },
  {
    date: new Date('2017-08-24'),
    changes: <Wrapper>Added <SpellLink id={SPELLS.BLACKOUT_COMBO_BUFF.id} /> statistic.</Wrapper>,
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
    changes: <Wrapper>Added more information about what occured while <SpellLink id={SPELLS.IRONSKIN_BREW_BUFF.id} /> was up or not.</Wrapper>,
    contributors: [WOPR],
  },
  {
    date: new Date('2017-08-20'),
    changes: 'This is an initial implementation, will be updated soon',
    contributors: [WOPR],
  },
];
