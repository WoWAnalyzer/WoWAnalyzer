import React from 'react';

import { tsabo, Zerotorescue, Gebuz, Aelexe, Coywolf, soloxcx } from 'CONTRIBUTORS';
import SPELLS from 'common/SPELLS';
import SpellLink from 'common/SpellLink';
import { change, date } from 'common/changelog';

export default [
  change(date(2019, 12, 16), <>Updated <SpellLink id={SPELLS.MARKED_FOR_DEATH_TALENT.id} /> wasted combo point thresholds.</>, [soloxcx]),
  change(date(2019, 7, 20), 'Implemented an initial checklist.', [Coywolf]),
  change(date(2018, 11, 15), <>Fixed <SpellLink id={SPELLS.ARCANE_TORRENT_ENERGY.id} /> GCD.</>, [Aelexe]),
  change(date(2018, 11, 13), <>Fixed cooldown tracking for <SpellLink id={SPELLS.MARKED_FOR_DEATH_TALENT.id} /> when targets die with the debuff.</>, [Aelexe]),
  change(date(2018, 11, 5), 'Updated resource tracking to display percent instead of per minute, and added spenders to the energy tab.', [Gebuz]),
  change(date(2018, 10, 8), 'Reduced the recommended threshold for Arcane Torrent and added additional info to use free GCDs for it.', [Zerotorescue]),
  change(date(2018, 8, 2), 'Added natural energy regen.', [tsabo]),
  change(date(2018, 6, 24), 'Update all abilities to new BFA values.', [Zerotorescue]),
];
