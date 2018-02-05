import React from 'react';

import { Putro } from 'MAINTAINERS';
import SpellLink from 'common/SpellLink';
import Wrapper from 'common/Wrapper';
import SPELLS from 'common/SPELLS';
import ItemLink from 'common/ItemLink';
import ITEMS from 'common/ITEMS';

export default [
  {
    date: new Date('2018-02-05'),
    changes: <Wrapper>Added additional information to the <ItemLink id={ITEMS.CALL_OF_THE_WILD.id} icon /> module, to show cooldown reduction on the various affected spells. </Wrapper>,
    contributors: [Putro],
  },
  {
    date: new Date('2018-01-30'),
    changes: 'Added a tooltip on the focus usage chart that shows focus used aswell as amount of casts of the the given ability',
    contributors: [Putro],
  },
  {
    date: new Date('2018-01-08'),
    changes: <Wrapper>Adjusted what deems a bad cast of <SpellLink id={SPELLS.ASPECT_OF_THE_WILD.id} icon /> to allow casting 3 seconds before <SpellLink id={SPELLS.BESTIAL_WRATH.id} icon /> comes off cooldown, or while it's ready to cast. Also adjusts how <SpellLink id={SPELLS.DIRE_FRENZY_TALENT.id} icon /> uptime and 3stack uptime is calculated</Wrapper>,
    contributors: [Putro],
  },
  {
    date: new Date('2018-01-07'),
    changes: <Wrapper>Adjusted how cast efficiency for <SpellLink id={SPELLS.KILL_COMMAND.id} icon /> was calculated when using <SpellLink id={SPELLS.KILLER_COBRA_TALENT.id} icon /> to show realistic amount of possible casts.</Wrapper>,
    contributors: [Putro],
  },
  {
    date: new Date('2017-12-30'),
    changes: 'Added a time focus capped module, aswell as a focus chart tab',
    contributors: [Putro],
  },
  {
    date: new Date('2017-12-26'),
    changes: 'Added a focus usage chart',
    contributors: [Putro],
  },
  {
    date: new Date('2017-12-26'),
    changes: <Wrapper>Added support for <SpellLink id={SPELLS.DIRE_STABLE_TALENT.id} icon />, <ItemLink id={ITEMS.ROAR_OF_THE_SEVEN_LIONS.id} icon />, <ItemLink id={ITEMS.PARSELS_TONGUE.id} icon />, <ItemLink id={ITEMS.THE_MANTLE_OF_COMMAND.id} icon />, <ItemLink id={ITEMS.ROOTS_OF_SHALADRASSIL.id} icon />, <ItemLink id={ITEMS.CALL_OF_THE_WILD.id} icon />, <ItemLink id={ITEMS.THE_APEX_PREDATORS_CLAW.id} icon /> and <ItemLink id={ITEMS.THE_SHADOW_HUNTERS_VOODOO_MASK.id} icon />.</Wrapper>,
    contributors: [Putro],
  },
  {
    date: new Date('2017-12-24'),
    changes: 'Updated to the new checklist format, and updated AlwaysBeCasting thresholds',
    contributors: [Putro],
  },
  {
    date: new Date('2017-12-22'),
    changes: <Wrapper>Added support for <SpellLink id={SPELLS.DIRE_FRENZY_TALENT.id} icon /> and <SpellLink id={SPELLS.ASPECT_OF_THE_WILD.id} icon /> and gave them suggestions. </Wrapper>,
    contributors: [Putro],
  },
  {
    date: new Date('2017-12-04'),
    changes: 'Added  talents and traits. Moved them into a singular box to improve visibility.',
    contributors: [Putro],
  },
  {
    date: new Date('2017-12-03'),
    changes: 'Upgraded spec completeness to good, added t192p support, added t21 support and added a suggestion for Killer Cobra',
    contributors: [Putro],
  },
  {
    date: new Date('2017-11-01'),
    changes: 'Added Mark of the claw, Bestial Wrath modules, Dire Beast modules, Qapla module, Titan\'s Thunder module, Killer Cobra module.',
    contributors: [Putro],
  },
  {
    date: new Date('2017-10-29'),
    changes: 'Added base files for Beast Mastery.',
    contributors: [Putro],
  },
];
