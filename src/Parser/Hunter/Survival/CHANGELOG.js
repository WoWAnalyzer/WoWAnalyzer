import React from 'react';

import { Putro } from 'CONTRIBUTORS';
import Wrapper from 'common/Wrapper';
import SpellLink from 'common/SpellLink';
import SPELLS from 'common/SPELLS';
import ITEMS from 'common/ITEMS';
import ItemLink from 'common/ItemLink';

export default [
  {
    date: new Date('2018-04-22'),
    changes: <Wrapper>Implements the checklist for Survival. Fixes a display bug with <SpellLink id={SPELLS.ASPECT_OF_THE_EAGLE.id} />.</Wrapper>,
    contributors: [Putro],
  },
  {
    date: new Date('2018-04-10'),
    changes: <Wrapper>Adds a <SpellLink id={SPELLS.ASPECT_OF_THE_EAGLE.id} /> module to provide suggestions with poor usage, and also updates <SpellLink id={SPELLS.MOKNATHAL_TACTICS.id} /> module to be more accurate when displaying refreshes.</Wrapper>,
    contributors: [Putro],
  },
  {
    date: new Date('2018-04-05'),
    changes: <Wrapper>Added tracking for <SpellLink id={SPELLS.ON_THE_TRAIL_DAMAGE.id} icon /> and <SpellLink id={SPELLS.LACERATE.id} icon /> to help identify when you're casting this too much. Added additional refreshing information into <SpellLink id={SPELLS.MOKNATHAL_TACTICS.id} icon /> module, aswell as average time remaining on <SpellLink id={SPELLS.MONGOOSE_FURY.id} icon /> upon using <SpellLink id={SPELLS.FURY_OF_THE_EAGLE_TRAIT.id} icon /> and other minor behind the scenes updates. </Wrapper>,
    contributors: [Putro],
  },
  {
    date: new Date('2018-02-20'),
    changes: <Wrapper>Spring cleaning in many modules. Added icons to Focus Usage modules and elsewhere around the analyzer and added support for <SpellLink id={SPELLS.CALTROPS_TALENT.id} />.</Wrapper>,
    contributors: [Putro],
  },
  {
    date: new Date('2018-02-14'),
    changes: <Wrapper>Added a module for <SpellLink id={SPELLS.FURY_OF_THE_EAGLE_TRAIT.id} />.</Wrapper>,
    contributors: [Putro],
  },
  {
    date: new Date('2018-02-12'),
    changes: <Wrapper>Added modules for <SpellLink id={SPELLS.MORTAL_WOUNDS_TALENT.id} /> and merged <SpellLink id={SPELLS.CARVE.id} /> and <SpellLink id={SPELLS.BUTCHERY_TALENT.id} />.</Wrapper>,
    contributors: [Putro],
  },
  {
    date: new Date('2018-02-12'),
    changes: <Wrapper>Added support for the most prominent traits into the listbox <SpellLink id={SPELLS.ASPECT_OF_THE_SKYLORD_TRAIT.id} />, <SpellLink id={SPELLS.EAGLES_BITE_TRAIT.id} />, <SpellLink id={SPELLS.ECHOES_OF_OHNARA_TRAIT.id} />, <SpellLink id={SPELLS.TALON_BOND_TRAIT.id} />, <SpellLink id={SPELLS.TALON_STRIKE_TRAIT.id} />. </Wrapper>,
    contributors: [Putro],
  },
  {
    date: new Date('2018-02-11'),
    changes: <Wrapper>Added support for <SpellLink id={SPELLS.ASPECT_OF_THE_BEAST_TALENT.id} />, <SpellLink id={SPELLS.SERPENT_STING_TALENT.id} />, <SpellLink id={SPELLS.A_MURDER_OF_CROWS_TALENT_SURVIVAL.id} />, <SpellLink id={SPELLS.DRAGONSFIRE_GRENADE_TALENT.id} />, <SpellLink id={SPELLS.THROWING_AXES_TALENT.id} /> into the Talents/Trait listbox.</Wrapper>,
    contributors: [Putro],
  },
  {
    date: new Date('2018-02-11'),
    changes: <Wrapper>Added a preliminary Talents and Traits list which will include damage information about various talents and traits as they get implemented. Implemented modules for <SpellLink id={SPELLS.STEEL_TRAP_TALENT.id} />, <SpellLink id={SPELLS.EXPLOSIVE_TRAP_CAST.id} />, <SpellLink id={SPELLS.CALTROPS_TALENT.id} /> and added prepull handling for all three. </Wrapper>,
    contributors: [Putro],
  },
  {
    date: new Date('2018-02-05'),
    changes: <Wrapper>Added additional information to the <ItemLink id={ITEMS.CALL_OF_THE_WILD.id} /> module, to show cooldown reduction on the various affected spells. </Wrapper>,
    contributors: [Putro],
  },
  {
    date: new Date('2018-02-02'),
    changes: <Wrapper>Added a module for tracking <SpellLink id={SPELLS.SPITTING_COBRA_TALENT.id} />, and ensure cast efficiency works properly for the talent even if precast. </Wrapper>,
    contributors: [Putro],
  },
  {
    date: new Date('2018-02-02'),
    changes: <Wrapper>Added support for <ItemLink id={ITEMS.BUTCHERS_BONE_APRON.id} />, <ItemLink id={ITEMS.FRIZZOS_FINGERTRAP.id} />, <ItemLink id={ITEMS.HELBRINE_ROPE_OF_THE_MIST_MARAUDER.id} />, <ItemLink id={ITEMS.NESINGWARYS_TRAPPING_TREADS.id} />, <ItemLink id={ITEMS.UNSEEN_PREDATORS_CLOAK.id} />.</Wrapper>,
    contributors: [Putro],
  },
  {
    date: new Date('2018-01-31'),
    changes: <Wrapper>Added a module for tracking <SpellLink id={SPELLS.WAY_OF_THE_MOKNATHAL_TALENT.id} />. </Wrapper>,
    contributors: [Putro],
  },
  {
    date: new Date('2018-01-30'),
    changes: <Wrapper>Added two statistic modules for <SpellLink id={SPELLS.MONGOOSE_FURY.id} /></Wrapper>,
    contributors: [Putro],
  },
  {
    date: new Date('2018-01-30'),
    changes: 'Added a focus usage chart to track what you\'re spending your focus on',
    contributors: [Putro],
  },
  {
    date: new Date('2018-01-18'),
    changes: <Wrapper>Added support for <SpellLink id={SPELLS.HUNTER_SV_T20_2P_BONUS.id} />, <SpellLink id={SPELLS.HUNTER_SV_T20_4P_BONUS.id} />, <SpellLink id={SPELLS.HUNTER_SV_T21_2P_BONUS.id} />, <SpellLink id={SPELLS.HUNTER_SV_T21_4P_BONUS.id} />.</Wrapper>,
    contributors: [Putro],
  },
  {
    date: new Date('2018-01-17'),
    changes: 'Initial support of survival.',
    contributors: [Putro],
  },
];
