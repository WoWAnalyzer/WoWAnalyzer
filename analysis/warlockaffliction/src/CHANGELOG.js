import React from 'react';

import { Dambroda, Sharrq, Maleficien, Akhtal } from 'CONTRIBUTORS';
import SPELLS from 'common/SPELLS';
import { SpellLink } from 'interface';
import { change, date } from 'common/changelog';

export default [
  change(date(2021, 1, 18), <>Added support for <SpellLink id={SPELLS.SCOURING_TITHE.id}/>, <SpellLink id={SPELLS.IMPENDING_CATASTROPHE_CAST.id}/> and <SpellLink id={SPELLS.DECIMATING_BOLT.id}/>.</>, Akhtal),
  change(date(2021, 1, 9), <>Update <SpellLink id={SPELLS.SUMMON_DARKGLARE.id}/> damage calculations to support <SpellLink id={SPELLS.VILE_TAINT_TALENT.id}/>, finish Typescript conversion.</>, Akhtal),
  change(date(2020, 12, 30), <>Add support for <SpellLink id={SPELLS.SHADOW_EMBRACE.id}/> and <SpellLink id={SPELLS.HAUNT_TALENT.id}/> in debuff uptime, convert most analyzers to Typescript.</>, Akhtal),
  change(date(2020, 12, 10), 'Updated spells for Shadowlands, added Night Fae spells, fix uptime bug for debuffs cast during pre-pull.', Maleficien),
  change(date(2020, 10, 15), 'Updated Spellbook and added Conduit, Legendary, and Covenant Spell IDs', Sharrq),
  change(date(2020, 10, 15), 'Fixed a crash in prepatch related to Unstable Affliction changes.', Dambroda),
  change(date(2020, 10, 2), 'Deleted Azerite Traits, Updated Statistic Boxes and added Integration Tests.', Sharrq),
];
