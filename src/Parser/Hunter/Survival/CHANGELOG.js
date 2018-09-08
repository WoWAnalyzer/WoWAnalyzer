import React from 'react';

import { Putro } from 'CONTRIBUTORS';
import SpellLink from 'common/SpellLink';
import SPELLS from 'common/SPELLS';

export default [
  {
    date: new Date('2018-09-04'),
    changes: <React.Fragment>Properly recognizes <SpellLink id={SPELLS.WILDFIRE_INFUSION_TALENT.id} /> casts now.</React.Fragment>,
    contributors: [Putro],
  },
  {
    date: new Date('2018-08-12'),
    changes: 'Removed all legendaries and tier gear in preparation for Battle for Azeroth launch',
    contributors: [Putro],
  },
  {
    date: new Date('2018-08-06'),
    changes: 'Fixed a crash in Frizzo\'s Fingertrap, adds buff indicators to relevant spells in the timeline, adjusted placement of statistic boxes and added example logs to everything BFA related.',
    contributors: [Putro],
  },
  {
    date: new Date('2018-07-30'),
    changes: <React.Fragment>Updates GCD for <SpellLink id={SPELLS.HARPOON.id} /> and updates cast efficiency for a few spells. Adds a <SpellLink id={SPELLS.BIRDS_OF_PREY_TALENT.id} /> module into the tooltip for <SpellLink id={SPELLS.COORDINATED_ASSAULT.id} />.</React.Fragment>,
    contributors: [Putro],
  },
  {
    date: new Date('2018-07-30'),
    changes: <React.Fragment>Adds average targets hit for <SpellLink id={SPELLS.CHAKRAMS_TALENT.id} />, <SpellLink id={SPELLS.WILDFIRE_BOMB.id} />, <SpellLink id={SPELLS.BUTCHERY_TALENT.id} /> and <SpellLink id={SPELLS.CARVE.id} />.</React.Fragment>,
    contributors: [Putro],
  },
  {
    date: new Date('2018-07-30'),
    changes: <React.Fragment>Adds <SpellLink id={SPELLS.STEEL_TRAP_TALENT.id} /> to Traits and Talents list, and adds a check/suggestion whether casting <SpellLink id={SPELLS.WILDFIRE_BOMB.id} /> was the right choice for the player.</React.Fragment>,
    contributors: [Putro],
  },
  {
    date: new Date('2018-07-30'),
    changes: <React.Fragment>Adds two modules for <SpellLink id={SPELLS.MONGOOSE_BITE_TALENT.id} /> to track its efficiency, and also checks for <SpellLink id={SPELLS.SERPENT_STING_SV.id} /> casts without <SpellLink id={SPELLS.VIPERS_VENOM_TALENT.id} /> buff up during <SpellLink id={SPELLS.MONGOOSE_FURY.id} />.</React.Fragment>,
    contributors: [Putro],
  },
  {
    date: new Date('2018-07-24'),
    changes: <React.Fragment>Implements better <SpellLink id={SPELLS.SERPENT_STING_SV.id} /> handling, aswell as <SpellLink id={SPELLS.VIPERS_VENOM_TALENT.id} /> support. </React.Fragment>,
    contributors: [Putro],
  },
  {
    date: new Date('2018-07-23'),
    changes: 'Survival analyzer updated to be 8.0.1 compatible',
    contributors: [Putro],
  },
  {
    date: new Date('2018-04-22'),
    changes: <React.Fragment>Implements the checklist for Survival. Fixes a display bug with <SpellLink id={SPELLS.ASPECT_OF_THE_EAGLE.id} />.</React.Fragment>,
    contributors: [Putro],
  },
  {
    date: new Date('2018-04-10'),
    changes: <React.Fragment>Adds a <SpellLink id={SPELLS.ASPECT_OF_THE_EAGLE.id} /> module to provide suggestions with poor usage, and also updates Way of the Mok'Nathal module to be more accurate when displaying refreshes.</React.Fragment>,
    contributors: [Putro],
  },
  {
    date: new Date('2018-04-05'),
    changes: <React.Fragment>Added tracking for On The Trail and Lacerate to help identify when you're casting this too much. Added additional refreshing information into Way of the Mok'Nathal module, aswell as average time remaining on <SpellLink id={SPELLS.MONGOOSE_FURY.id} icon /> upon using Fury of the Eagle and other minor behind the scenes updates. </React.Fragment>,
    contributors: [Putro],
  },
  {
    date: new Date('2018-02-20'),
    changes: 'Spring cleaning in many modules. Added icons to Focus Usage modules and elsewhere around the analyzer and added support for Caltrops.',
    contributors: [Putro],
  },
  {
    date: new Date('2018-02-14'),
    changes: 'Added a module for Fury of the Eagle artifact ability.',
    contributors: [Putro],
  },
  {
    date: new Date('2018-02-12'),
    changes: <React.Fragment>Added modules for Mortal Wounds and merged <SpellLink id={SPELLS.CARVE.id} /> and <SpellLink id={SPELLS.BUTCHERY_TALENT.id} />.</React.Fragment>,
    contributors: [Putro],
  },
  {
    date: new Date('2018-02-12'),
    changes: 'Added support for the most prominent traits into the listbox Aspect of the Skylord, Eagles Bite, Echoes of Ohnara, Talon Bond and Talon Strike traits.',
    contributors: [Putro],
  },
  {
    date: new Date('2018-02-11'),
    changes: <React.Fragment>Added support for <SpellLink id={SPELLS.ASPECT_OF_THE_BEAST_TALENT.id} />, <SpellLink id={SPELLS.SERPENT_STING_TALENT.id} />, A Murder of Crows, Dragonsfire Grenade, Throwing Axes into the Talents/Trait listbox.</React.Fragment>,
    contributors: [Putro],
  },
  {
    date: new Date('2018-02-11'),
    changes: <React.Fragment>Added a preliminary Talents and Traits list which will include damage information about various talents and traits as they get implemented. Implemented modules for <SpellLink id={SPELLS.STEEL_TRAP_TALENT.id} />, Explosive Trap, Caltrops and added prepull handling for all three. </React.Fragment>,
    contributors: [Putro],
  },
  {
    date: new Date('2018-02-05'),
    changes: 'Added additional information to the Call of the Wild module, to show cooldown reduction on the various affected spells.',
    contributors: [Putro],
  },
  {
    date: new Date('2018-02-02'),
    changes: <React.Fragment>Added a module for tracking <SpellLink id={SPELLS.SPITTING_COBRA_TALENT.id} />, and ensure cast efficiency works properly for the talent even if precast. </React.Fragment>,
    contributors: [Putro],
  },
  {
    date: new Date('2018-02-02'),
    changes: 'Added support for Butchers Bone Apron, Frizzos Fingertrap, Helbrine, Rope of the Mist Marauder, Nesingwary\'s Trapping Treads, Unseen Predators Cloak.',
    contributors: [Putro],
  },
  {
    date: new Date('2018-01-31'),
    changes: 'Added a module for tracking Way of the Mok\'Nathal.',
    contributors: [Putro],
  },
  {
    date: new Date('2018-01-30'),
    changes: <React.Fragment>Added two statistic modules for <SpellLink id={SPELLS.MONGOOSE_FURY.id} /></React.Fragment>,
    contributors: [Putro],
  },
  {
    date: new Date('2018-01-30'),
    changes: 'Added a focus usage chart to track what you\'re spending your focus on',
    contributors: [Putro],
  },
  {
    date: new Date('2018-01-18'),
    changes: 'Added support for Tier 20 2p, tier 20 4p, tier 21 2p and tier 21 4p',
    contributors: [Putro],
  },
  {
    date: new Date('2018-01-17'),
    changes: 'Initial support of survival.',
    contributors: [Putro],
  },
];
