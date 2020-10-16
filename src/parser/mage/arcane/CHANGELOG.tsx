import React from 'react';

import { Sharrq } from 'CONTRIBUTORS';
import SPELLS from 'common/SPELLS';
import SpellLink from 'common/SpellLink';
import { change, date } from 'common/changelog';

// prettier-ignore
export default [
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
