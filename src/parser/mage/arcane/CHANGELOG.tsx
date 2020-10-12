import React from 'react';

import { Sharrq } from 'CONTRIBUTORS';
import SPELLS from 'common/SPELLS';
import SpellLink from 'common/SpellLink';
import { change, date } from 'common/changelog';

const prepatch = date(2020, 10, 13);

export default [
  change(prepatch, <>Added <SpellLink id={SPELLS.ARCANE_BOMBARDMENT.id} /> and <SpellLink id={SPELLS.ARCANE_HARMONY.id} /> and adjusted <SpellLink id={SPELLS.RUNE_OF_POWER_TALENT.id} />. </>, Sharrq),
  change(prepatch, <>Added support for the <SpellLink id={SPELLS.SIPHONED_MALICE.id} /> and <SpellLink id={SPELLS.TEMPEST_BARRIER.id} /> conduits. </>, Sharrq),
  change(prepatch, <>Added support for the <SpellLink id={SPELLS.IRE_OF_THE_ASCENDED.id} />, <SpellLink id={SPELLS.GROUNDING_SURGE.id} />, and <SpellLink id={SPELLS.DIVERTED_ENERGY.id} /> conduits. </>, Sharrq),
  change(prepatch, <>Added support for the <SpellLink id={SPELLS.ARCANE_PRODIGY.id} /> and <SpellLink id={SPELLS.ARTIFICE_OF_THE_ARCHMAGE.id} /> conduits. </>, Sharrq),
  change(prepatch, <>Added module for <SpellLink id={SPELLS.FOCUS_MAGIC_TALENT.id} /> buff uptime. </>, Sharrq),
  change(prepatch, <>Added Spell IDs for the Shadowlands Mage Conduits, Legendaries, and Covenant Abilities. </>, Sharrq),
  change(prepatch, <>Removed Azerite, Essences, and BFA Items in prep for Shadowlands. </>, Sharrq),
  change(prepatch, <>General Cleanup for Mage Spells</>, Sharrq),
  change(prepatch, <>Arcane class changes for Shadowlands (Baseline <SpellLink id={SPELLS.TOUCH_OF_THE_MAGI.id} />, <SpellLink id={SPELLS.RUNE_OF_POWER_TALENT.id} /> cooldown and charge changes (All Specs), New Talents, <SpellLink id={SPELLS.FROSTBOLT.id} />/<SpellLink id={SPELLS.FIRE_BLAST.id} /> Spellbook entries)</>, Sharrq),
  change(prepatch, <>Shared class changes for Shadowlands (<SpellLink id={SPELLS.ALTER_TIME.id} />, <SpellLink id={SPELLS.FOCUS_MAGIC_TALENT.id} />, <SpellLink id={SPELLS.MIRROR_IMAGE.id} />)</>, Sharrq),
];
