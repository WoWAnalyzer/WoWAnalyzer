import React from 'react';

import { Putro } from 'CONTRIBUTORS';
import SpellLink from 'common/SpellLink';
import SPELLS from 'common/SPELLS';
import { change, date } from 'common/changelog';

export default [
  change(date(2019, 3, 26), <> Implemented a module for <SpellLink id={SPELLS.SURGING_SHOTS.id} />, <SpellLink id={SPELLS.FOCUSED_FIRE.id} /> and <SpellLink id={SPELLS.UNERRING_VISION.id} />.</>, [Putro]),
  change(date(2019, 3, 20), <> Implemented a module for <SpellLink id={SPELLS.IN_THE_RHYTHM.id} />.</>, [Putro]),
  change(date(2018, 12, 12), <> Implemented <SpellLink id={SPELLS.CAREFUL_AIM_TALENT.id} /> module for patch 8.1.</>, [Putro]),
  change(date(2018, 11, 20), <> Added a simple <SpellLink id={SPELLS.PRECISE_SHOTS.id} /> module. </>, [Putro]),
  change(date(2018, 11, 14), <> Created a module for <SpellLink id={SPELLS.BORN_TO_BE_WILD_TALENT.id} /> and <SpellLink id={SPELLS.BINDING_SHOT_TALENT.id} />. </>, [Putro]),
  change(date(2018, 9, 28), <>Adds simple tracking for <SpellLink id={SPELLS.STEADY_AIM.id} /> azerite trait, and disables focus capping module when that trait is active.</>, [Putro]),
  change(date(2018, 8, 6), <>Adds initial tracking for <SpellLink id={SPELLS.STEADY_FOCUS_TALENT.id} /> to ensure the GCD is accurate in the analyzer.</>, [Putro]),
  change(date(2018, 8, 12), 'Removed all legendaries and tier gear in preparation for Battle for Azeroth launch', [Putro]),
  change(date(2018, 8, 6), <>Adds buff indicators to relevant spells in the timeline, adjusted placement of statistic boxes and added example logs to everything BFA related.</>, [Putro]),
  change(date(2018, 7, 23), 'Updated a large amount of modules to be ready for pre-patch and BFA. Updated patch combatility to 8.0.1.', [Putro]),
];
