import React from 'react';

import { Sharrq } from 'CONTRIBUTORS';
import SPELLS from 'common/SPELLS';
import SpellLink from 'common/SpellLink';
import { change, date } from 'common/changelog';

export default [
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
  change(date(2020, 10, 13), <>Shadowlands base changes (Added <SpellLink id={SPELLS.FIRE_BLAST.id} /> and <SpellLink id={SPELLS.ARCANE_EXPLOSION.id} /></>, Sharrq),
  change(date(2020, 10, 13), <>General Cleanup for Mage Spells</>, Sharrq),
  change(date(2020, 10, 13), <>Shared class changes for Shadowlands (<SpellLink id={SPELLS.ALTER_TIME.id} />, <SpellLink id={SPELLS.FOCUS_MAGIC_TALENT.id} />, <SpellLink id={SPELLS.MIRROR_IMAGE.id} />)</>, Sharrq),
];
