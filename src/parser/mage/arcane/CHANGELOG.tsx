import React from 'react';

import { Putro, Sharrq } from 'CONTRIBUTORS';
import SPELLS from 'common/SPELLS';
import SpellLink from 'common/SpellLink';
import { change, date } from 'common/changelog';

// prettier-ignore
export default [
  change(date(2021, 1, 15), <>Fixed an issue that was not adding the proper amount of additional CDR from <SpellLink id={SPELLS.DISCIPLINE_OF_THE_GROVE.id} />.</>, Sharrq),
  change(date(2020, 12, 28), <>Updated conduit statistic boxes to use the new layout.</>, Sharrq),
  change(date(2020, 12, 24), <>Fixed an issue that was showing <SpellLink id={SPELLS.RUNE_OF_POWER_TALENT.id} /> as lasting the entire fight duration in the Cooldowns tab.</>, Sharrq),
  change(date(2020, 12, 19), <>Added module to check the active time during <SpellLink id={SPELLS.ARCANE_POWER.id} />.</>, Sharrq),
  change(date(2020, 12, 16), `Fixed an abe with suggestions showing {0} instead of the suggestion text in Arcane modules.`, Sharrq),
  change(date(2020, 12, 10), <>Updated <SpellLink id={SPELLS.ARCANE_POWER.id} /> to include <SpellLink id={SPELLS.TOUCH_OF_THE_MAGI.id} /> usage and added support for <SpellLink id={SPELLS.ARCANE_ECHO_TALENT.id} />.</>, Sharrq),
  change(date(2020, 12, 10), <>Removed checks for <SpellLink id={SPELLS.RUNE_OF_POWER_TALENT.id} /> from <SpellLink id={SPELLS.ARCANE_POWER.id} /> module, as per Shadowlands it is now baked into the spell. </>, Putro),
  change(date(2020, 11, 16), <>Added support for <SpellLink id={SPELLS.SHIFTING_POWER.id} />.</>, Sharrq),
  change(date(2020, 11, 16), <>Updated numbers for <SpellLink id={SPELLS.RUNE_OF_POWER_TALENT.id} /> to match latest tuning.</>, Sharrq),
  change(date(2020, 10, 29), <>Added support for <SpellLink id={SPELLS.MASTER_OF_TIME_TALENT.id} />. </>, Sharrq),
  change(date(2020, 10, 20), <>Added Covenant Abilities to Spellbook. Updated <SpellLink id={SPELLS.ARCANE_ORB_TALENT.id} /> for Shadowlands and removed the GCD on <SpellLink id={SPELLS.ARCANE_POWER.id} />. </>, Sharrq),
  change(date(2020, 10, 13), <>Updated <SpellLink id={SPELLS.MIRROR_IMAGE.id} /> module, added a <SpellLink id={SPELLS.PRISMATIC_BARRIER.id} /> module, and adjusted <SpellLink id={SPELLS.RUNE_OF_POWER_TALENT.id} /> ... again. </>, Sharrq),
  change(date(2020, 10, 13), <>Added <SpellLink id={SPELLS.ARCANE_BOMBARDMENT.id} /> and <SpellLink id={SPELLS.ARCANE_HARMONY.id} /> and adjusted <SpellLink id={SPELLS.RUNE_OF_POWER_TALENT.id} />. </>, Sharrq),
  change(date(2020, 10, 13), <>Added support for the <SpellLink id={SPELLS.SIPHONED_MALICE.id} /> and <SpellLink id={SPELLS.TEMPEST_BARRIER.id} /> conduits. </>, Sharrq),
  change(date(2020, 10, 13), <>Added support for the <SpellLink id={SPELLS.IRE_OF_THE_ASCENDED.id} />, <SpellLink id={SPELLS.GROUNDING_SURGE.id} />, and <SpellLink id={SPELLS.DIVERTED_ENERGY.id} /> conduits. </>, Sharrq),
  change(date(2020, 10, 13), <>Added support for the <SpellLink id={SPELLS.ARCANE_PRODIGY.id} /> and <SpellLink id={SPELLS.ARTIFICE_OF_THE_ARCHMAGE.id} /> conduits. </>, Sharrq),
  change(date(2020, 10, 13), <>Added module for <SpellLink id={SPELLS.FOCUS_MAGIC_TALENT.id} /> buff uptime. </>, Sharrq),
  change(date(2020, 10, 13), <>Added Spell IDs for the Shadowlands Mage Conduits, Legendaries, and Covenant Abilities. </>, Sharrq),
  change(date(2020, 10, 13), <>Removed Azerite, Essences, and BFA Items in prep for Shadowlands. </>, Sharrq),
  change(date(2020, 10, 13), <>General Cleanup for Mage Spells</>, Sharrq),
  change(date(2020, 10, 13), <>Arcane class changes for Shadowlands (Baseline <SpellLink id={SPELLS.TOUCH_OF_THE_MAGI.id} />, <SpellLink id={SPELLS.RUNE_OF_POWER_TALENT.id} /> cooldown and charge changes (All Specs), New Talents, <SpellLink id={SPELLS.FROSTBOLT.id} />/<SpellLink id={SPELLS.FIRE_BLAST.id} /> Spellbook entries)</>, Sharrq),
  change(date(2020, 10, 13), <>Shared class changes for Shadowlands (<SpellLink id={SPELLS.ALTER_TIME.id} />, <SpellLink id={SPELLS.FOCUS_MAGIC_TALENT.id} />, <SpellLink id={SPELLS.MIRROR_IMAGE.id} />)</>, Sharrq),
];
