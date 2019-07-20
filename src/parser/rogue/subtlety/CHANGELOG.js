import React from 'react';

import { Zerotorescue, tsabo, Gebuz, Aelexe } from 'CONTRIBUTORS';
import SPELLS from 'common/SPELLS';
import SpellLink from 'common/SpellLink';
import { change, date } from 'common/changelog';

export default [
  change(date(2019, 1, 27), 'Improvements to the Nightblade analysis.', [tsabo]),
  change(date(2019, 1, 19), 'Fix Shuriken Storm CP waste. Any Shuriken Storm that generates at least 3CPs will not be considered waste, otherwise waste will be limited by the CP pool size.', [tsabo]),
  change(date(2018, 12, 28), 'Updates for 8.1, minor fixes.', [tsabo]),
  change(date(2018, 11, 15), <>Fixed <SpellLink id={SPELLS.ARCANE_TORRENT_ENERGY.id} /> GCD.</>, [Aelexe]),
  change(date(2018, 11, 13), <>Fixed cooldown tracking for <SpellLink id={SPELLS.MARKED_FOR_DEATH_TALENT.id} /> when targets die with the debuff.</>, [Aelexe]),
  change(date(2018, 11, 11), <>Added suggestion for Sharpened Blades stack wastage.</>, [Aelexe]),
  change(date(2018, 11, 5), 'Updated resource tracking to display percent instead of per minute, and added spenders to the energy tab.', [Gebuz]),
  change(date(2018, 8, 12), 'Initial Checklist.', [tsabo]),
  change(date(2018, 8, 2), 'Added natural energy regen.', [tsabo]),
  change(date(2018, 7, 15), 'Find Weakness usage analysis. Stealth ability usage analysis.', [tsabo]),
  change(date(2018, 7, 7), 'Update analysis for PrePatch', [tsabo]),
  change(date(2018, 6, 27), 'Update all abilities to new BFA values.', [Zerotorescue]),
];
