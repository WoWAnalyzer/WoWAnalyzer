import React from 'react';

import { Sharrq } from 'CONTRIBUTORS';
import SPELLS from 'common/SPELLS';
import SpellLink from 'common/SpellLink';
import { change, date } from 'common/changelog';

export default [
  change(date(2020, 9, 19), <>Added module for <SpellLink id={SPELLS.FOCUS_MAGIC_TALENT.id} /> buff uptime. </>, Sharrq),
  change(date(2020, 9, 8), <>Added Spell IDs for the Shadowlands Mage Conduits, Legendaries, and Covenant Abilities. </>, Sharrq),
  change(date(2020, 9, 8), <>Removed Azerite, Essences, and BFA Items in prep for Shadowlands. </>, Sharrq),
  change(date(2020, 8, 23), <>General Cleanup for Mage Spells</>, Sharrq),
  change(date(2020, 8, 4), <>Fire class changes for Shadowlands (Baseline <SpellLink id={SPELLS.PHOENIX_FLAMES.id} />, <SpellLink id={SPELLS.KINDLING_TALENT.id} /> reduction increase, <SpellLink id={SPELLS.DRAGONS_BREATH.id} /> CD, <SpellLink id={SPELLS.PYROCLASM_TALENT.id} /> Damage Bonus, <SpellLink id={SPELLS.FROSTBOLT.id} />/<SpellLink id={SPELLS.ARCANE_EXPLOSION.id} /> Spellbook entries)</>, Sharrq),
  change(date(2020, 7, 30), <>Shared class changes for Shadowlands (<SpellLink id={SPELLS.ALTER_TIME.id} />, <SpellLink id={SPELLS.FOCUS_MAGIC_TALENT.id} />, <SpellLink id={SPELLS.MIRROR_IMAGE.id} />)</>, Sharrq),
];
