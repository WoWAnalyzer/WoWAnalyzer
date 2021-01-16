import React from 'react';

import { Sharrq } from 'CONTRIBUTORS';
import SPELLS from 'common/SPELLS';
import SpellLink from 'common/SpellLink';
import { change, date } from 'common/changelog';

export default [
  change(date(2021, 1, 15), <>Fixed an issue that was not adding the proper amount of additional CDR from <SpellLink id={SPELLS.DISCIPLINE_OF_THE_GROVE.id} />.</>, Sharrq),
  change(date(2021, 1, 14), <>Fixed an issue in <SpellLink id={SPELLS.KINDLING_TALENT.id} /> that was not counting crits from <SpellLink id={SPELLS.PHOENIX_FLAMES.id} /> when calculating cooldown reduction.</>, Sharrq),
  change(date(2021, 1, 14), <>Added a check to ignore pre-casts during <SpellLink id={SPELLS.FIRESTORM.id} />.</>, Sharrq),
  change(date(2021, 1, 12), <>Redesigned Checklist to group things better and explain things more clearly.</>, Sharrq),
  change(date(2021, 1, 12), <>Added additional checks/functionality for <SpellLink id={SPELLS.INFERNAL_CASCADE.id} /> and <SpellLink id={SPELLS.SHIFTING_POWER.id} />.</>, Sharrq),
  change(date(2020, 12, 28), <>Updated conduit statistic boxes to use the new layout.</>, Sharrq),
  change(date(2020, 12, 24), <>Added module to check for capping on <SpellLink id={SPELLS.PHOENIX_FLAMES.id} /> charges and fixed an issue that was showing <SpellLink id={SPELLS.RUNE_OF_POWER_TALENT.id} /> as lasting the entire fight duration in the Cooldowns tab.</>, Sharrq),
  change(date(2020, 12, 19), <>Added module to check the active time during <SpellLink id={SPELLS.COMBUSTION.id} /> and fixed a typo in <SpellLink id={SPELLS.FIRESTORM.id} />.</>, Sharrq),
  change(date(2020, 12, 19), <>Resolved an issue in <SpellLink id={SPELLS.COMBUSTION.id} /> that was marking <SpellLink id={SPELLS.FIREBALL.id} /> casts that started before Combustion and ended after Combustion as being cast during Combustion.</>, Sharrq),
  change(date(2020, 12, 16), `Fixed an abe with suggestions showing {0} instead of the suggestion text in Fire modules and an abe that was causing a crash in Pyroclasm.`, Sharrq),
  change(date(2020, 12, 8), <>Added support for <SpellLink id={SPELLS.FIRESTORM.id} /> and adjusted <SpellLink id={SPELLS.HEATING_UP.id} /> to check for a Venthyr edge case.</>, Sharrq),
  change(date(2020, 11, 16), <>Cleaned up some older modules, resolved an issue in <SpellLink id={SPELLS.PYROCLASM_TALENT.id} />, and added support for <SpellLink id={SPELLS.SHIFTING_POWER.id} /> and <SpellLink id={SPELLS.MIRRORS_OF_TORMENT.id} />.</>, Sharrq),
  change(date(2020, 11, 16), <>Updated numbers for <SpellLink id={SPELLS.INFERNAL_CASCADE.id} /> and <SpellLink id={SPELLS.RUNE_OF_POWER_TALENT.id} /> to match latest tuning.</>, Sharrq),
  change(date(2020, 10, 20), 'Cleaned up variable types and constants.', Sharrq),
  change(date(2020, 10, 20), <>Added Covenant Abilities to Spellbook and added <SpellLink id={SPELLS.FROM_THE_ASHES_TALENT.id} />.</>, Sharrq),
  change(date(2020, 10, 13), <>Updated <SpellLink id={SPELLS.MIRROR_IMAGE.id} /> module, added a <SpellLink id={SPELLS.BLAZING_BARRIER.id} /> module, and adjusted <SpellLink id={SPELLS.RUNE_OF_POWER_TALENT.id} /> ... again. </>, Sharrq),
  change(date(2020, 10, 13), <>Added <SpellLink id={SPELLS.FEVERED_INCANTATION.id} /> and adjusted <SpellLink id={SPELLS.RUNE_OF_POWER_TALENT.id} />. </>, Sharrq),
  change(date(2020, 10, 13), <>Added support for the <SpellLink id={SPELLS.CONTROLLED_DESTRUCTION.id} /> and <SpellLink id={SPELLS.INFERNAL_CASCADE.id} /> conduits. </>, Sharrq),
  change(date(2020, 10, 13), <>Added support for the <SpellLink id={SPELLS.SIPHONED_MALICE.id} /> and <SpellLink id={SPELLS.TEMPEST_BARRIER.id} /> conduits. </>, Sharrq),
  change(date(2020, 10, 13), <>Added support for the <SpellLink id={SPELLS.IRE_OF_THE_ASCENDED.id} />, <SpellLink id={SPELLS.GROUNDING_SURGE.id} />, and <SpellLink id={SPELLS.DIVERTED_ENERGY.id} /> conduits. </>, Sharrq),
  change(date(2020, 10, 13), <>Added support for the <SpellLink id={SPELLS.MASTER_FLAME.id} /> conduit. </>, Sharrq),
  change(date(2020, 10, 13), <>Added module for <SpellLink id={SPELLS.FOCUS_MAGIC_TALENT.id} /> buff uptime. </>, Sharrq),
  change(date(2020, 10, 13), <>Added Spell IDs for the Shadowlands Mage Conduits, Legendaries, and Covenant Abilities. </>, Sharrq),
  change(date(2020, 10, 13), <>Removed Azerite, Essences, and BFA Items in prep for Shadowlands. </>, Sharrq),
  change(date(2020, 10, 13), <>General Cleanup for Mage Spells</>, Sharrq),
  change(date(2020, 10, 13), <>Fire class changes for Shadowlands (Baseline <SpellLink id={SPELLS.PHOENIX_FLAMES.id} />, <SpellLink id={SPELLS.KINDLING_TALENT.id} /> reduction increase, <SpellLink id={SPELLS.DRAGONS_BREATH.id} /> CD, <SpellLink id={SPELLS.PYROCLASM_TALENT.id} /> Damage Bonus, <SpellLink id={SPELLS.FROSTBOLT.id} />/<SpellLink id={SPELLS.ARCANE_EXPLOSION.id} /> Spellbook entries)</>, Sharrq),
  change(date(2020, 10, 13), <>Shared class changes for Shadowlands (<SpellLink id={SPELLS.ALTER_TIME.id} />, <SpellLink id={SPELLS.FOCUS_MAGIC_TALENT.id} />, <SpellLink id={SPELLS.MIRROR_IMAGE.id} />)</>, Sharrq),
];
