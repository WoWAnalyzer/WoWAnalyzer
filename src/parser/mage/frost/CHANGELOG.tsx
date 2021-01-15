import React from 'react';

import { Sharrq } from 'CONTRIBUTORS';
import SPELLS from 'common/SPELLS';
import SpellLink from 'common/SpellLink';
import { change, date } from 'common/changelog';

export default [
  change(date(2021, 1, 15), <>Fixed an issue that was not adding the proper amount of additional CDR from <SpellLink id={SPELLS.DISCIPLINE_OF_THE_GROVE.id} />.</>, Sharrq),
  change(date(2020, 12, 28), <>Updated conduit statistic boxes to use the new layout.</>, Sharrq),
  change(date(2020, 12, 24), <>Fixed an error in <SpellLink id={SPELLS.GLACIAL_FRAGMENTS.id} /> that was not properly counting absorbed damage.</>, Sharrq),
  change(date(2020, 12, 24), <>Fixed an issue that was showing <SpellLink id={SPELLS.RUNE_OF_POWER_TALENT.id} /> as lasting the entire fight duration in the Cooldowns tab.</>, Sharrq),
  change(date(2020, 12, 19), <>Added module to check the active time during <SpellLink id={SPELLS.ICY_VEINS.id} /> and added support for <SpellLink id={SPELLS.GLACIAL_FRAGMENTS.id} />.</>, Sharrq),
  change(date(2020, 12, 17), <>Resolved an issue in <SpellLink id={SPELLS.WINTERS_CHILL.id} /> that was causing it to miscount shattered spells.</>, Sharrq),
  change(date(2020, 12, 16), `Fixed an abe with suggestions showing {0} instead of the suggestion text in Frost modules and fixed an abe that was causing a crash in Winter's Chill.`, Sharrq),
  change(date(2020, 12, 9), <>Adjusted <SpellLink id={SPELLS.WINTERS_CHILL.id} /> to not require a precast if the target has <SpellLink id={SPELLS.MIRRORS_OF_TORMENT.id} />.</>, Sharrq),
  change(date(2020, 12, 8), <>Fixed a potential crash with <SpellLink id={SPELLS.ICY_PROPULSION.id} />.</>, Sharrq),
  change(date(2020, 11, 16), <>Added support for <SpellLink id={SPELLS.SHIFTING_POWER.id} />.</>, Sharrq),
  change(date(2020, 11, 16), <>Updated numbers for <SpellLink id={SPELLS.ICY_PROPULSION.id} /> and <SpellLink id={SPELLS.RUNE_OF_POWER_TALENT.id} /> to match latest tuning.</>, Sharrq),
  change(date(2020, 11, 8), <>Resolved an issue where <SpellLink id={SPELLS.ICE_LANCE.id} /> was miscounting Non Shattered casts. </>, Sharrq),
  change(date(2020, 10, 29), <>Updated <SpellLink id={SPELLS.BRAIN_FREEZE.id} /> module to check for overlapping <SpellLink id={SPELLS.FLURRY.id} /> (Using a Brain Freeze while Winters Chill is still on the target). </>, Sharrq),
  change(date(2020, 10, 20), 'Cleaned up variable types and constants.', Sharrq),
  change(date(2020, 10, 20), <>Added Covenant Abilities to Spellbook and removed the GCD on <SpellLink id={SPELLS.ICY_VEINS.id} />. </>, Sharrq),
  change(date(2020, 10, 13), <>Updated <SpellLink id={SPELLS.MIRROR_IMAGE.id} /> module, added an <SpellLink id={SPELLS.ICE_BARRIER.id} /> module, and adjusted <SpellLink id={SPELLS.RUNE_OF_POWER_TALENT.id} /> ... again. </>, Sharrq),
  change(date(2020, 10, 13), <>Adjusted <SpellLink id={SPELLS.RUNE_OF_POWER_TALENT.id} />. </>, Sharrq),
  change(date(2020, 10, 13), <>Added support for the <SpellLink id={SPELLS.SIPHONED_MALICE.id} /> and <SpellLink id={SPELLS.TEMPEST_BARRIER.id} /> conduits. </>, Sharrq),
  change(date(2020, 10, 13), <>Added support for the <SpellLink id={SPELLS.IRE_OF_THE_ASCENDED.id} />, <SpellLink id={SPELLS.GROUNDING_SURGE.id} />, and <SpellLink id={SPELLS.DIVERTED_ENERGY.id} /> conduits. </>, Sharrq),
  change(date(2020, 10, 13), <>Added support for the <SpellLink id={SPELLS.ICE_BITE.id} />, <SpellLink id={SPELLS.ICY_PROPULSION.id} />, <SpellLink id={SPELLS.UNRELENTING_COLD.id} />, and <SpellLink id={SPELLS.SHIVERING_CORE.id} /> conduits. </>, Sharrq),
  change(date(2020, 10, 13), <>Added support for <SpellLink id={SPELLS.FREEZING_WINDS.id} /> and <SpellLink id={SPELLS.COLD_FRONT.id} />. </>, Sharrq),
  change(date(2020, 10, 13), <>Added module for <SpellLink id={SPELLS.FOCUS_MAGIC_TALENT.id} /> buff uptime. </>, Sharrq),
  change(date(2020, 10, 13), <>Updated the<SpellLink id={SPELLS.WINTERS_CHILL.id} /> module for Shadowlands. </>, Sharrq),
  change(date(2020, 10, 13), <>Updated modules for <SpellLink id={SPELLS.GLACIAL_SPIKE_TALENT.id} /> and <SpellLink id={SPELLS.BRAIN_FREEZE.id} /> for Shadowlands. </>, Sharrq),
  change(date(2020, 10, 13), <>Added Spell IDs for the Shadowlands Mage Conduits, Legendaries, and Covenant Abilities. </>, Sharrq),
  change(date(2020, 10, 13), <>Removed Azerite, Essences, and BFA Items in prep for Shadowlands. </>, Sharrq),
  change(date(2020, 10, 13), <>Shadowlands base changes (Added <SpellLink id={SPELLS.FIRE_BLAST.id} /> and <SpellLink id={SPELLS.ARCANE_EXPLOSION.id} />).</>, Sharrq),
  change(date(2020, 10, 13), <>General Cleanup for Mage Spells</>, Sharrq),
  change(date(2020, 10, 13), <>Shared class changes for Shadowlands (<SpellLink id={SPELLS.ALTER_TIME.id} />, <SpellLink id={SPELLS.FOCUS_MAGIC_TALENT.id} />, <SpellLink id={SPELLS.MIRROR_IMAGE.id} />)</>, Sharrq),
];
