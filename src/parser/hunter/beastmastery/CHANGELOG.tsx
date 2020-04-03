import React from 'react';

import { Putro, Streammz, LeoZhekov } from 'CONTRIBUTORS';
import SpellLink from 'common/SpellLink';
import SPELLS from 'common/SPELLS';
import { change, date } from 'common/changelog';

export default [
  change(date(2020, 1, 24), <> Updated the <SpellLink id={SPELLS.BARBED_SHOT.id} /> module to allow for up to 8 simultaneous buffs running, which reflects behaviour in-game.</>, Putro),
  change(date(2020, 2, 15), <> Added an inefficient cast detection of <SpellLink id={SPELLS.ASPECT_OF_THE_WILD.id} /> when you have two stacks of <SpellLink id={SPELLS.BARBED_SHOT.id} /> up. Also included the number of wasted <SpellLink id={SPELLS.BARBED_SHOT.id} /> stacks in the <SpellLink id={SPELLS.PRIMAL_INSTINCTS.id} /> statistics. </>, LeoZhekov),
  change(date(2020, 2, 14), <>Added a <SpellLink id={SPELLS.RAPID_RELOAD.id} /> azerite trait module. </>, Putro),
  change(date(2020, 2, 14), <>Fix a bug that would indicate you hadn't hit enemies with <SpellLink id={SPELLS.BEAST_CLEAVE_BUFF.id} /> despite having done so whilst using <SpellLink id={SPELLS.ANIMAL_COMPANION_TALENT.id} />.</>, Putro),
  change(date(2020, 2, 13), 'Add focus checks from natural regeneration and from generators, as well as additional cobra shot and multi shot checks to the BM checklist.', Putro),
  change(date(2020, 2, 13), 'Improve focus tab to include wasted information that is not normally included in the combatlog.', Putro),
  change(date(2020, 1, 28), 'Completely reworked the Focus modules for Hunter. A new tab, chart and statistic has been added for Focus metrics.', Putro),
  change(date(2020, 1, 28), 'Set BM compatibility to 8.3.', Putro),
  change(date(2020, 1, 27), 'Updated the shared hunter talent modules for 8.3.', Putro),
  change(date(2020, 1, 27), 'Updated the remaining BM specific talent modules for 8.3.', Putro),
  change(date(2020, 1, 26), <> Updated <SpellLink id={SPELLS.ASPECT_OF_THE_WILD.id} />, <SpellLink id={SPELLS.BEAST_CLEAVE_PET_BUFF.id} />, <SpellLink id={SPELLS.BESTIAL_WRATH.id} /> and <SpellLink id={SPELLS.COBRA_SHOT.id} /> modules. </>, Putro),
  change(date(2020, 1, 25), <> Updated the BM specific GCD module to add more spells in and remove some code meant to handle <SpellLink id={SPELLS.ASPECT_OF_THE_WILD.id} /> affecting itself twice.</>, Putro),
  change(date(2020, 1, 24), <> Updated the <SpellLink id={SPELLS.BARBED_SHOT.id} /> module. </>, Putro),
  change(date(2019, 9, 21), <> Added a <SpellLink id={SPELLS.DIRE_CONSEQUENCES.id} /> module. </>, [LeoZhekov]),
  change(date(2019, 7, 31), 'Added some inefficient casts highlights on the timeline and updated all statistics for spells, talents and traits to use the new statistics module.', [LeoZhekov]),
  change(date(2018, 11, 14), <> Created a module for <SpellLink id={SPELLS.BORN_TO_BE_WILD_TALENT.id} /> and <SpellLink id={SPELLS.BINDING_SHOT_TALENT.id} />. </>, [Putro]),
  change(date(2018, 11, 13), <> Implemented talent statistic module for <SpellLink id={SPELLS.ANIMAL_COMPANION_TALENT.id} /> & an azerite power module for Pack Alpha. </>, [Putro]),
  change(date(2018, 11, 13), <> Implemented talent statistic modules for <SpellLink id={SPELLS.BARRAGE_TALENT.id} /> and <SpellLink id={SPELLS.CHIMAERA_SHOT_TALENT.id} />.</>, [Putro]),
  change(date(2018, 11, 7), <>Implemented talent statistic modules for <SpellLink id={SPELLS.ONE_WITH_THE_PACK_TALENT.id} /> and <SpellLink id={SPELLS.STOMP_TALENT.id} />.</>, [Putro]),
  change(date(2018, 11, 8), <> Implemented a module for <SpellLink id={SPELLS.ASPECT_OF_THE_BEAST_TALENT.id} />, <SpellLink id={SPELLS.SPITTING_COBRA_TALENT.id} />, <SpellLink id={SPELLS.SCENT_OF_BLOOD_TALENT.id} /> and updated the module for <SpellLink id={SPELLS.DIRE_BEAST_TALENT.id} />.</>, [Putro]),
  change(date(2018, 11, 2), <>Implemented a talent statistic module and suggestions for <SpellLink id={SPELLS.VENOMOUS_BITE_TALENT.id} /> and <SpellLink id={SPELLS.THRILL_OF_THE_HUNT_TALENT.id} />.</>, [Putro]),
  change(date(2018, 10, 31), <>Implemented statistics for the talent <SpellLink id={SPELLS.KILLER_INSTINCT_TALENT.id} />.</>, [Streammz]),
  change(date(2018, 10, 29), <>Implemented a suggestion that checks for <SpellLink id={SPELLS.MULTISHOT_BM.id} /> usage in single target situations, warning you about multi-shot uses where no paired <SpellLink id={SPELLS.BEAST_CLEAVE_PET_BUFF.id} /> damage has been dealt.</>, [Streammz]),
  change(date(2018, 10, 25), <>Implemented the new checklist for Beast Mastery, added a <SpellLink id={SPELLS.COBRA_SHOT.id} /> statistic and associated suggestions, and updated <SpellLink id={SPELLS.KILLER_COBRA_TALENT.id} /> suggestions.</>, [Putro]),
  change(date(2018, 10, 24), <>Merged the 3 <SpellLink id={SPELLS.BESTIAL_WRATH.id} /> modules together, and added a cooldown reduction efficiency metric and suggestion to it.</>, [Putro]),
  change(date(2018, 9, 20), <>Added two azerite trait modules, one for <SpellLink id={SPELLS.PRIMAL_INSTINCTS.id} /> and an initial version for <SpellLink id={SPELLS.FEEDING_FRENZY.id} /></>, [Putro]),
  change(date(2018, 8, 12), <>Updated the <SpellLink id={SPELLS.BARBED_SHOT.id} /> statistic to be an expandable statistic box, to showcase uptime of 0->3 stacks separately.</>, [Putro]),
  change(date(2018, 8, 12), 'Removed all legendaries and tier gear in preparation for Battle for Azeroth launch', [Putro]),
  change(date(2018, 8, 6), <> Adds buff indicators to relevant spells in the timeline, adjusted placement of statistic boxes, added example logs to everything BFA related and added statistics for <SpellLink id={SPELLS.CHIMAERA_SHOT_TALENT.id} />, <SpellLink id={SPELLS.DIRE_BEAST_TALENT.id} />, <SpellLink id={SPELLS.KILLER_COBRA_TALENT.id} />, <SpellLink id={SPELLS.STAMPEDE_TALENT.id} /> and <SpellLink id={SPELLS.STOMP_TALENT.id} />. </>, [Putro]),
  change(date(2018, 7, 26), <>Updated the BM module to 8.0.1, and added a <SpellLink id={SPELLS.BARBED_SHOT.id} /> statistic and acoompanying suggestions, also updated downtime module to be accurate with Aspect of the Wilds reduced GCD. </>, [Putro]),
];
