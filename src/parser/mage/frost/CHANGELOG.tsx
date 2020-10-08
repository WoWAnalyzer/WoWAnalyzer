import React from 'react';

import { Sharrq } from 'CONTRIBUTORS';
import SPELLS from 'common/SPELLS';
import SpellLink from 'common/SpellLink';
import { change, date } from 'common/changelog';

const prepatch = date(2020, 10, 13);

export default [
  change(prepatch, <>Removed <SpellLink id={SPELLS.FREEZING_WINDS.id} /> and adjusted <SpellLink id={SPELLS.RUNE_OF_POWER_TALENT.id} />. </>, Sharrq),
  change(prepatch, <>Added support for the <SpellLink id={SPELLS.SIPHONED_MALICE.id} /> and <SpellLink id={SPELLS.TEMPEST_BARRIER.id} /> conduits. </>, Sharrq),
  change(prepatch, <>Added support for the <SpellLink id={SPELLS.IRE_OF_THE_ASCENDED.id} />, <SpellLink id={SPELLS.GROUNDING_SURGE.id} />, and <SpellLink id={SPELLS.DIVERTED_ENERGY.id} /> conduits. </>, Sharrq),
  change(prepatch, <>Added support for the <SpellLink id={SPELLS.ICE_BITE.id} />, <SpellLink id={SPELLS.ICY_PROPULSION.id} />, <SpellLink id={SPELLS.UNRELENTING_COLD.id} />, and <SpellLink id={SPELLS.SHIVERING_CORE.id} /> conduits. </>, Sharrq),
  change(prepatch, <>Added support for <SpellLink id={SPELLS.FREEZING_WINDS.id} /> and <SpellLink id={SPELLS.COLD_FRONT.id} />. </>, Sharrq),
  change(prepatch, <>Added module for <SpellLink id={SPELLS.FOCUS_MAGIC_TALENT.id} /> buff uptime. </>, Sharrq),
  change(prepatch, <>Updated the<SpellLink id={SPELLS.WINTERS_CHILL.id} /> module for Shadowlands. </>, Sharrq),
  change(prepatch, <>Updated modules for <SpellLink id={SPELLS.GLACIAL_SPIKE_TALENT.id} /> and <SpellLink id={SPELLS.BRAIN_FREEZE.id} /> for Shadowlands. </>, Sharrq),
  change(prepatch, <>Added Spell IDs for the Shadowlands Mage Conduits, Legendaries, and Covenant Abilities. </>, Sharrq),
  change(prepatch, <>Removed Azerite, Essences, and BFA Items in prep for Shadowlands. </>, Sharrq),
  change(prepatch, <>Shadowlands base changes (Added <SpellLink id={SPELLS.FIRE_BLAST.id} /> and <SpellLink id={SPELLS.ARCANE_EXPLOSION.id} /></>, Sharrq),
  change(prepatch, <>General Cleanup for Mage Spells</>, Sharrq),
  change(prepatch, <>Shared class changes for Shadowlands (<SpellLink id={SPELLS.ALTER_TIME.id} />, <SpellLink id={SPELLS.FOCUS_MAGIC_TALENT.id} />, <SpellLink id={SPELLS.MIRROR_IMAGE.id} />)</>, Sharrq),
];
