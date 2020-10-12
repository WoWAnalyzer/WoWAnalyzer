import React from 'react';

import { Eylwen, Zerotorescue, Abelito75 } from 'CONTRIBUTORS';
import SPELLS from 'common/SPELLS';
import SpellLink from 'common/SpellLink';
import { change, date } from 'common/changelog';

export default [
  change(date(2020, 3, 27), <>Removed Frothing Berserker suggestion.</>, Abelito75),
  change(date(2020, 3, 27), <>Changed Bloodthirst's threshold based on how many Cold Steel Hot Bloods you have.</>, Abelito75),
  change(date(2020, 3, 13), <>Furious Slash uptime requirement changed to general not max stacks.</>, Abelito75),
  change(date(2020, 2, 27), <>Removed Heroic Leap check as it wasn't important.</>, Abelito75),
  change(date(2020, 2, 27), <>Whirlwind checker for casting it at the correct times.</>, Abelito75),
  change(date(2020, 2, 26), <>Fixed typo.</>, Abelito75),
  change(date(2020, 2, 26), <>Removed missed rampage swings as its not important, add checks to only use Dragon Roar and Bladestorm during enrage.</>, Abelito75),
  change(date(2020, 2, 25), <>Siegebreaker during Recklessness checker.</>, Abelito75),
  change(date(2020, 2, 25), <>Added buffs to timeline.</>, Abelito75),
  change(date(2020, 2, 25), <>Added Rage tracker.</>, Abelito75),
  change(date(2018, 12, 15), <>Updated Fury for 8.1:  removal of the GCD on <SpellLink id={SPELLS.CHARGE.id} />, added <SpellLink id={SPELLS.COLD_STEEL_HOT_BLOOD_ENERGIZE.id} /> and <SpellLink id={SPELLS.UNBRIDLED_FEROCITY.id} /></>, [Eylwen]),
  change(date(2018, 7, 19), <>Implemented the cooldown reduction of <SpellLink id={SPELLS.ANGER_MANAGEMENT_TALENT.id} /> and added a statistic to show the cooldown reduction usage.</>, [Zerotorescue]),
  change(date(2018, 6, 30), <>Ignored cooldown errors triggered by <SpellLink id={SPELLS.SUDDEN_DEATH_TALENT_FURY.id} />'s random cooldown resets of <SpellLink id={SPELLS.EXECUTE_FURY.id} />.</>, [Zerotorescue]),
  change(date(2018, 6, 30), <>Implemented handling of random <SpellLink id={SPELLS.RAGING_BLOW.id} /> resets that guesses where the cooldown reset. Because the combatlog doesn't reveal any cooldown information we have to do manual cooldown tracking. Unfortunately there's not a single event that shows random cooldown resets, so implementing effects like the random reset of <SpellLink id={SPELLS.RAGING_BLOW.id} /> is nearly impossible. To work around this, the <SpellLink id={SPELLS.RAGING_BLOW.id} /> module will <i>guess</i> where it procced; whenever <SpellLink id={SPELLS.RAGING_BLOW.id} /> is cast, it will check if it was supposed to still be on cooldown. If so, then it will mark the cooldown as ended on the last possible trigger. This should make the cooldown of this spell reasonable given you're using procs quickly.</>, [Zerotorescue]),
  change(date(2018, 6, 30), 'Update all abilities to new BFA values.', [Zerotorescue]),
];
