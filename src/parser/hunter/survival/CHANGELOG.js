import React from 'react';

import { Putro, LeoZhekov } from 'CONTRIBUTORS';
import SpellLink from 'common/SpellLink';
import SPELLS from 'common/SPELLS';
import { change, date } from 'common/changelog';

export default [
  change(date(2020, 2, 15), <> Added a <SpellLink id={SPELLS.WILDFIRE_CLUSTER.id} /> module </>, [Putro]),
  change(date(2020, 1, 28), <> Completely reworked the Focus modules for Hunter. A new tab, chart and statistic has been added for Focus metrics. </>, Putro),
  change(date(2020, 1, 27), <> Updated the shared hunter talent modules for 8.3. </>, Putro),
  change(date(2019, 9, 21), <> Added a <SpellLink id={SPELLS.DIRE_CONSEQUENCES.id} /> module </>, [LeoZhekov]),
  change(date(2019, 7, 31), <> Added some inefficient casts and enhanced casts highlights on the timeline and updated all statistics for spells, talents and traits to use the new statistics module. </>, [LeoZhekov]),
  change(date(2019, 7, 18), <>Added checklist module and statistic for <SpellLink id={SPELLS.PRIMEVAL_INTUITION.id} />. </>, [LeoZhekov]),
  change(date(2018, 12, 25), <> Added a statistic for <SpellLink id={SPELLS.FLANKING_STRIKE_TALENT.id} />, <SpellLink id={SPELLS.TIP_OF_THE_SPEAR_TALENT.id} />, <SpellLink id={SPELLS.HYDRAS_BITE_TALENT.id} />, <SpellLink id={SPELLS.GUERRILLA_TACTICS_TALENT.id} />.</>, [Putro]),
  change(date(2018, 12, 24), <> Added a statistic for <SpellLink id={SPELLS.ALPHA_PREDATOR_TALENT.id} />, <SpellLink id={SPELLS.VIPERS_VENOM_TALENT.id} /> and <SpellLink id={SPELLS.BLOODSEEKER_TALENT.id} />.</>, [Putro]),
  change(date(2018, 11, 19), <> Adjusted <SpellLink id={SPELLS.SERPENT_STING_SV.id} /> uptime in general, but especially in regard to using <SpellLink id={SPELLS.BIRDS_OF_PREY_TALENT.id} />.</>, [Putro]),
  change(date(2018, 11, 14), <> Created a module for <SpellLink id={SPELLS.BORN_TO_BE_WILD_TALENT.id} /> and <SpellLink id={SPELLS.BINDING_SHOT_TALENT.id} />. </>, [Putro]),
  change(date(2018, 10, 6), <>Added a <SpellLink id={SPELLS.BLUR_OF_TALONS.id} /> and a <SpellLink id={SPELLS.LATENT_POISON.id} /> module.</>, [Putro]),
  change(date(2018, 9, 17), <>Added a <SpellLink id={SPELLS.WILDERNESS_SURVIVAL.id} /> module.</>, [Putro]),
  change(date(2018, 9, 10), <>Added a <SpellLink id={SPELLS.FLANKERS_ADVANTAGE.id} /> indicator to the time-line, to indicate when <SpellLink id={SPELLS.KILL_COMMAND_CAST_SV.id} /> resets.</>, [Putro]),
  change(date(2018, 9, 4), <>Properly recognizes <SpellLink id={SPELLS.WILDFIRE_INFUSION_TALENT.id} /> casts now.</>, [Putro]),
  change(date(2018, 8, 12), 'Removed all legendaries and tier gear in preparation for Battle for Azeroth launch', [Putro]),
  change(date(2018, 8, 6), 'Fixed a crash in Frizzo\'s Fingertrap, adds buff indicators to relevant spells in the timeline, adjusted placement of statistic boxes and added example logs to everything BFA related.', [Putro]),
  change(date(2018, 7, 30), <>Updates GCD for <SpellLink id={SPELLS.HARPOON.id} /> and updates cast efficiency for a few spells. Adds a <SpellLink id={SPELLS.BIRDS_OF_PREY_TALENT.id} /> module into the tooltip for <SpellLink id={SPELLS.COORDINATED_ASSAULT.id} />.</>, [Putro]),
  change(date(2018, 7, 30), <>Adds average targets hit for <SpellLink id={SPELLS.CHAKRAMS_TALENT.id} />, <SpellLink id={SPELLS.WILDFIRE_BOMB.id} />, <SpellLink id={SPELLS.BUTCHERY_TALENT.id} /> and <SpellLink id={SPELLS.CARVE.id} />.</>, [Putro]),
  change(date(2018, 7, 30), <>Adds <SpellLink id={SPELLS.STEEL_TRAP_TALENT.id} /> to Traits and Talents list, and adds a check/suggestion whether casting <SpellLink id={SPELLS.WILDFIRE_BOMB.id} /> was the right choice for the player.</>, [Putro]),
  change(date(2018, 7, 30), <>Adds two modules for <SpellLink id={SPELLS.MONGOOSE_BITE_TALENT.id} /> to track its efficiency, and also checks for <SpellLink id={SPELLS.SERPENT_STING_SV.id} /> casts without <SpellLink id={SPELLS.VIPERS_VENOM_TALENT.id} /> buff up during <SpellLink id={SPELLS.MONGOOSE_FURY.id} />.</>, [Putro]),
  change(date(2018, 7, 24), <>Implements better <SpellLink id={SPELLS.SERPENT_STING_SV.id} /> handling, aswell as <SpellLink id={SPELLS.VIPERS_VENOM_TALENT.id} /> support. </>, [Putro]),
  change(date(2018, 7, 23), 'Survival analyzer updated to be 8.0.1 compatible', [Putro]),
];
