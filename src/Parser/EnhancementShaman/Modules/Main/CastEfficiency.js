import React from 'react';

import ITEMS from 'common/ITEMS';
import SPELLS from 'common/SPELLS';

import CoreCastEfficiency from 'Parser/Core/Modules/CastEfficiency';
import getCastEfficiency from 'Parser/Core/getCastEfficiency';

import Tab from 'Main/Tab';

import CastEfficiencyComponent from 'Main/CastEfficiency';


class CastEfficiency extends CoreCastEfficiency {
  static CPM_ABILITIES = [
    ...CoreCastEfficiency.CPM_ABILITIES,
    {
      spell: SPELLS.ASCENDANCE_TALENT_ENHANCEMENT,
      category: CastEfficiency.SPELL_CATEGORIES.COOLDOWNS,
      getCooldown: haste => 180,
      isActive: combatant => combatant.hasTalent(SPELLS.ASCENDANCE_TALENT_ENHANCEMENT.id),
      recommendedCastEfficiency: 1.0,
    },
    {
      spell: SPELLS.DOOM_WINDS,
      category: CastEfficiency.SPELL_CATEGORIES.COOLDOWNS,
      getCooldown: haste => 60,
    },
    {
      spell: SPELLS.FERAL_SPIRIT,
      category: CastEfficiency.SPELL_CATEGORIES.COOLDOWNS,
      getCooldown: haste => 120,
    },
    //is already in Core/CastEfficiency
    /*{
      spell: SPELLS.SUMMON_DREAD_REFLECTION,
      category: SPELL_CATEGORY.COOLDOWNS,
      getCooldown: haste => 45,
      isActive: combatant => combatant.hasTrinket(ITEMS.SPECTER_OF_BETRAYAL.id),
    },
    {
      spell: SPELLS.CEASELESS_TOXIN,
      category: SPELL_CATEGORY.COOLDOWNS,
      getCooldown: haste => 60,//add detection if target has died and reduced cooldown
      isActive: combatant => combatant.hasTrinket(ITEMS.VIAL_OF_CEASELESS_TOXINS.id),
    },*/
    {
      spell: SPELLS.LIGHTNING_BOLT,
      category: CastEfficiency.SPELL_CATEGORIES.ROTATIONAL,
      getCooldown: haste => null, // 1.5 / (1 + haste)
    },
    {
      spell: SPELLS.ROCKBITER,
      category: CastEfficiency.SPELL_CATEGORIES.ROTATIONAL,
      getCooldown: haste => null, // 1.5 / (1 + haste)
    },
    {
      spell: SPELLS.FROSTBRAND,
      category: CastEfficiency.SPELL_CATEGORIES.ROTATIONAL,
      isActive: combatant => combatant.hasTalent(SPELLS.FROSTBRAND.id),
      getCooldown: haste => null, // 1.5 / (1 + haste)
    },
    {
      spell: SPELLS.FLAMETONGUE,
      category: CastEfficiency.SPELL_CATEGORIES.ROTATIONAL,
      getCooldown: haste => null, // 1.5 / (1 + haste)
    },
    {
      spell: SPELLS.STORMSTRIKE,
      category: CastEfficiency.SPELL_CATEGORIES.ROTATIONAL,
      getCooldown: haste => null, // 1.5 / (1 + haste)
    },
    {
      spell: SPELLS.LAVA_LASH,
      category: CastEfficiency.SPELL_CATEGORIES.ROTATIONAL,
      getCooldown: haste => null, // 1.5 / (1 + haste)
    },
    {
      spell: SPELLS.WINDSTRIKE,
      category: CastEfficiency.SPELL_CATEGORIES.ROTATIONAL,
      getCooldown: haste => null, // 1.5 / (1 + haste)
    },
    {
      spell: SPELLS.CRASH_LIGHTNING,
      category: CastEfficiency.SPELL_CATEGORIES.ROTATIONAL_AOE,
      getCooldown: haste => null, // 1.5 / (1 + haste)
    },
  ];

  tab() {
    return {
      title: 'Cast efficiency',
      url: 'cast-efficiency',
      render: () => (
        <Tab title="Cast efficiency">
          <CastEfficiencyComponent
            categories={CastEfficiency.SPELL_CATEGORIES}
            abilities={getCastEfficiency(CastEfficiency.CPM_ABILITIES, this.owner)}
          />
        </Tab>
      ),
    };
  }
}

export default CastEfficiency;
