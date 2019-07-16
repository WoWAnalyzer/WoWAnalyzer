import React from 'react';

import { emallson, Zerotorescue } from 'CONTRIBUTORS';
import ITEMS from 'common/ITEMS';
import ItemLink from 'common/ItemLink';
import SPELLS from 'common/SPELLS';
import SpellLink from 'common/SpellLink';

export default [
  {
    date: new Date('2019-06-28'),
    changes: <>Added a <SpellLink id={SPELLS.HOT_TRUB.id} /> damage estimator. Nerf sucks :(</>,
    contributors: [emallson],
  },
  {
    date: new Date('2019-04-11'),
    changes: <>Fixed a bug in the Mitigation Values tab that caused Mastery's base 8% to be counted towards contribution by Mastery Rating.</>,
    contributors: [emallson],
  },
  {
    date: new Date('2019-03-10'),
    changes: <>Fixed a bug in the <SpellLink id={SPELLS.IRONSKIN_BREW.id} /> normalizer that led to a crash in the new timeline.</>,
    contributors: [Zerotorescue],
  },
  {
    date: new Date('2019-02-16'),
    changes: <>Removed <SpellLink id={SPELLS.BREATH_OF_FIRE.id} /> from the checklist.</>,
    contributors: [emallson],
  },
  {
    date: new Date('2019-01-31'),
    changes: <>Added Mitigation Values tab showing estimated stat values for damage mitigation.</>,
    contributors: [emallson],
  },
  {
    date: new Date('2018-12-30'),
    changes: <>Added <SpellLink id={SPELLS.STRAIGHT_NO_CHASER.id} /> module.</>,
    contributors: [emallson],
  },
  {
    date: new Date('2018-12-29'),
    changes: <>Added <SpellLink id={SPELLS.GIFT_OF_THE_OX_1.id} /> healing statistic.</>,
    contributors: [emallson],
  },
  {
    date: new Date('2018-10-26'),
    changes: <>Added <SpellLink id={SPELLS.CELESTIAL_FORTUNE_HEAL.id} /> healing statistic and table.</>,
    contributors: [emallson],
  },
  {
    date: new Date('2018-10-22'),
    changes: <>The <SpellLink id={SPELLS.MASTERY_ELUSIVE_BRAWLER.id} /> module now loads on-demand, improving load times for lower-end devices.</>,
    contributors: [emallson],
  },
  {
    date: new Date('2018-10-15'),
    changes: <>Added <SpellLink id={SPELLS.PURIFYING_BREW.id} /> checklist item.</>,
    contributors: [emallson],
  },
  {
    date: new Date('2018-10-02'),
    changes: <>Re-enabled the <SpellLink id={SPELLS.MASTERY_ELUSIVE_BRAWLER.id} /> module and added additional distribution information to it.</>,
    contributors: [emallson],
  },
  {
    date: new Date('2018-09-27'),
    changes: 'Updated Stagger plot to show very quick purifies more accurately.',
    contributors: [emallson],
  },
  {
    date: new Date('2018-09-22'),
    changes: <>Updated <SpellLink id={SPELLS.IRONSKIN_BREW.id} /> and <SpellLink id={SPELLS.BREATH_OF_FIRE.id} /> suggestions to use hits mitigated instead of uptime.</>,
    contributors: [emallson],
  },
  {
    date: new Date('2018-09-22'),
    changes: <>Added support for <SpellLink id={SPELLS.FIT_TO_BURST.id} />.</>,
    contributors: [emallson],
  },
  {
    date: new Date('2018-09-13'),
    changes: <>Added support for <SpellLink id={SPELLS.ELUSIVE_FOOTWORK.id} />.</>,
    contributors: [emallson],
  },
  {
    date: new Date('2018-08-11'),
    changes: <>Added support for <SpellLink id={SPELLS.STAGGERING_STRIKES.id} />.</>,
    contributors: [emallson],
  },
  {
    date: new Date('2018-07-22'),
    changes: <>Updated support for <ItemLink id={ITEMS.SOUL_OF_THE_GRANDMASTER.id} /> and temporarily disabled the <SpellLink id={SPELLS.MASTERY_ELUSIVE_BRAWLER.id} /> module pending new formula coefficients.</>,
    contributors: [emallson],
  },
  {
    date: new Date('2018-07-18'),
    changes: <>Added support for <SpellLink id={SPELLS.LIGHT_BREWING_TALENT.id} />.</>,
    contributors: [emallson],
  },
  {
    date: new Date('2018-07-15'),
    changes: <>Added <SpellLink id={SPELLS.TRAINING_OF_NIUZAO.id} /> support.</>,
    contributors: [emallson],
  },
  {
    date: new Date('2018-06-16'),
    changes: <>Updated <SpellLink id={SPELLS.IRONSKIN_BREW.id} /> cooldown and duration and added <SpellLink id={SPELLS.GUARD_TALENT.id} />, along with other changes in beta build 26812.</>,
    contributors: [emallson],
  },
];
