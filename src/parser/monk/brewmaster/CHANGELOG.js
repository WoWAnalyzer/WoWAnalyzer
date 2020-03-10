import React from 'react';

import { Abelito75, emallson, Zerotorescue } from 'CONTRIBUTORS';
import ITEMS from 'common/ITEMS';
import ItemLink from 'common/ItemLink';
import SPELLS from 'common/SPELLS';
import SpellLink from 'common/SpellLink';
import { change, date } from 'common/changelog';

export default [
  change(date(2020, 3, 10), <>Updated hit tracking for Ny'alotha and bumped compatability to 8.3.</>, emallson),
  change(date(2019, 12, 22), <>Warning threshold for <SpellLink id={SPELLS.HEAVY_STAGGER_DEBUFF.id} /> / <SpellLink id={SPELLS.PURIFYING_BREW.id} /> is now calculated based on time spent in red stagger.</>, emallson),
  change(date(2019, 10, 28), <>Added support for items in the <SpellLink id={SPELLS.CELESTIAL_FORTUNE_HEAL.id} /> tab.</>, Abelito75),
  change(date(2019, 10, 16), <>Removed <SpellLink id={SPELLS.ARCANE_TORRENT_ENERGY.id} /> from Brewmaster suggestions.</>, emallson),
  change(date(2019, 9, 27), <>Update to date for 8.2.5 </>,Abelito75),
  change(date(2019, 7, 20), 'Updated hit-tracking blacklist and internal constants for Eternal Palace.', emallson),
  change(date(2019, 6, 28), <>Added a <SpellLink id={SPELLS.HOT_TRUB.id} /> damage estimator. Nerf sucks :(</>, [emallson]),
  change(date(2019, 4, 11), <>Fixed a bug in the Mitigation Values tab that caused Mastery's base 8% to be counted towards contribution by Mastery Rating.</>, [emallson]),
  change(date(2019, 3, 10), <>Fixed a bug in the <SpellLink id={SPELLS.IRONSKIN_BREW.id} /> normalizer that led to a crash in the new timeline.</>, [Zerotorescue]),
  change(date(2019, 2, 16), <>Removed <SpellLink id={SPELLS.BREATH_OF_FIRE.id} /> from the checklist.</>, [emallson]),
  change(date(2019, 1, 31), <>Added Mitigation Values tab showing estimated stat values for damage mitigation.</>, [emallson]),
  change(date(2018, 12, 30), <>Added <SpellLink id={SPELLS.STRAIGHT_NO_CHASER.id} /> module.</>, [emallson]),
  change(date(2018, 12, 29), <>Added <SpellLink id={SPELLS.GIFT_OF_THE_OX_1.id} /> healing statistic.</>, [emallson]),
  change(date(2018, 10, 26), <>Added <SpellLink id={SPELLS.CELESTIAL_FORTUNE_HEAL.id} /> healing statistic and table.</>, [emallson]),
  change(date(2018, 10, 22), <>The <SpellLink id={SPELLS.MASTERY_ELUSIVE_BRAWLER.id} /> module now loads on-demand, improving load times for lower-end devices.</>, [emallson]),
  change(date(2018, 10, 15), <>Added <SpellLink id={SPELLS.PURIFYING_BREW.id} /> checklist item.</>, [emallson]),
  change(date(2018, 10, 2), <>Re-enabled the <SpellLink id={SPELLS.MASTERY_ELUSIVE_BRAWLER.id} /> module and added additional distribution information to it.</>, [emallson]),
  change(date(2018, 9, 27), 'Updated Stagger plot to show very quick purifies more accurately.', [emallson]),
  change(date(2018, 9, 22), <>Updated <SpellLink id={SPELLS.IRONSKIN_BREW.id} /> and <SpellLink id={SPELLS.BREATH_OF_FIRE.id} /> suggestions to use hits mitigated instead of uptime.</>, [emallson]),
  change(date(2018, 9, 22), <>Added support for <SpellLink id={SPELLS.FIT_TO_BURST.id} />.</>, [emallson]),
  change(date(2018, 9, 13), <>Added support for <SpellLink id={SPELLS.ELUSIVE_FOOTWORK.id} />.</>, [emallson]),
  change(date(2018, 8, 11), <>Added support for <SpellLink id={SPELLS.STAGGERING_STRIKES.id} />.</>, [emallson]),
  change(date(2018, 7, 22), <>Updated support for <ItemLink id={ITEMS.SOUL_OF_THE_GRANDMASTER.id} /> and temporarily disabled the <SpellLink id={SPELLS.MASTERY_ELUSIVE_BRAWLER.id} /> module pending new formula coefficients.</>, [emallson]),
  change(date(2018, 7, 18), <>Added support for <SpellLink id={SPELLS.LIGHT_BREWING_TALENT.id} />.</>, [emallson]),
  change(date(2018, 7, 15), <>Added <SpellLink id={SPELLS.TRAINING_OF_NIUZAO.id} /> support.</>, [emallson]),
  change(date(2018, 6, 16), <>Updated <SpellLink id={SPELLS.IRONSKIN_BREW.id} /> cooldown and duration and added <SpellLink id={SPELLS.GUARD_TALENT.id} />, along with other changes in beta build 26812.</>, [emallson]),
];
