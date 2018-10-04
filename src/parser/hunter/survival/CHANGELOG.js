import React from 'react';

import { Putro } from 'CONTRIBUTORS';
import SpellLink from 'common/SpellLink';
import SPELLS from 'common/SPELLS';

export default [
  {
    date: new Date('2018-09-17'),
    changes: <React.Fragment>Added a <SpellLink id={SPELLS.WILDERNESS_SURVIVAL.id} /> module.</React.Fragment>,
    contributors: [Putro],
  },
  {
    date: new Date('2018-09-10'),
    changes: <React.Fragment>Added a <SpellLink id={SPELLS.FLANKERS_ADVANTAGE.id} /> indicator to the time-line, to indicate when <SpellLink id={SPELLS.KILL_COMMAND_SV.id} /> resets.</React.Fragment>,
    contributors: [Putro],
  },
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
];
