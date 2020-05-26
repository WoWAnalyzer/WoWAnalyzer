import React from 'react';

import { tsabo, Cloake, Zerotorescue, Gebuz, Aelexe, Vetyst } from 'CONTRIBUTORS';
import SPELLS from 'common/SPELLS';
import SpellLink from 'common/SpellLink';
import { change, date } from 'common/changelog';

export default [
  change(date(2020, 5, 26), <>Fixed garrote early refresh tracking.</>, [Vetyst]),
  change(date(2019, 4, 22), <>Early dot refresh tracking</>, [tsabo]),
  change(date(2018, 11, 20), <>Added Bleed snapshot tracking and support for <SpellLink id={SPELLS.NIGHTSTALKER_TALENT.id} />, <SpellLink id={SPELLS.SUBTERFUGE_TALENT.id} /> and <SpellLink id={SPELLS.MASTER_ASSASSIN_TALENT.id} />.</>, [Gebuz]),
  change(date(2018, 11, 15), <>Fixed <SpellLink id={SPELLS.ARCANE_TORRENT_ENERGY.id} /> GCD.</>, [Aelexe]),
  change(date(2018, 11, 13), <>Fixed cooldown tracking for <SpellLink id={SPELLS.MARKED_FOR_DEATH_TALENT.id} /> when targets die with the debuff.</>, [Aelexe]),
  change(date(2018, 11, 11), <>Added suggestion for Sharpened Blades stack wastage.</>, [Aelexe]),
  change(date(2018, 11, 9), <>Added <SpellLink id={SPELLS.MASTER_POISONER_TALENT.id} /> module and updated <SpellLink id={SPELLS.ELABORATE_PLANNING_TALENT.id} /> and <SpellLink id={SPELLS.BLINDSIDE_TALENT.id} /> modules.</>, [Gebuz]),
  change(date(2018, 11, 5), 'Updated resource tracking to display percent instead of per minute, and added spenders to the energy tab.', [Gebuz]),
  change(date(2018, 11, 5), 'Added Checklist.', [Gebuz]),
  change(date(2018, 11, 4), <>Added suggestions for <SpellLink id={SPELLS.GARROTE.id} /> and <SpellLink id={SPELLS.RUPTURE.id} /> uptime.</>, [Gebuz]),
  change(date(2018, 11, 4), 'Added cooldowns tab', [Gebuz]),
  change(date(2018, 11, 4), 'Updated timeline with buffs & debuffs and added missing GCDs', [Gebuz]),
  change(date(2018, 8, 2), 'Added natural energy regen.', [tsabo]),
  change(date(2018, 7, 27), <>Added <SpellLink id={SPELLS.ELABORATE_PLANNING_TALENT.id} /> support.</>, [Cloake]),
  change(date(2018, 7, 9), 'Added blindside support.', [tsabo]),
  change(date(2018, 7, 7), 'Update for prepatch.', [tsabo]),
  change(date(2018, 6, 24), 'Update all abilities to new BFA values.', [Zerotorescue]),
];
