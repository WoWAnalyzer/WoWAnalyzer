import React from 'react';

import { Sharrq } from 'CONTRIBUTORS';
import SPELLS from 'common/SPELLS';
import SpellLink from 'common/SpellLink';
import { change, date } from 'common/changelog';

export default [
  change(date(2020, 9, 8), <>Removed Azerite, Essences, and BFA Items in prep for Shadowlands. </>, Sharrq),
  change(date(2020, 8, 23), <>Shadowlands base changes (Added <SpellLink id={SPELLS.FIRE_BLAST.id} /> and <SpellLink id={SPELLS.ARCANE_EXPLOSION.id} /></>, Sharrq),
  change(date(2020, 8, 23), <>General Cleanup for Mage Spells</>, Sharrq),
  change(date(2020, 7, 30), <>Shared class changes for Shadowlands (<SpellLink id={SPELLS.ALTER_TIME.id} />, <SpellLink id={SPELLS.FOCUS_MAGIC_TALENT.id} />, <SpellLink id={SPELLS.MIRROR_IMAGE.id} />)</>, Sharrq),
];
