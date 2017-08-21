import React from 'react';

import ITEMS from 'common/ITEMS';
import SPELLS from 'common/SPELLS';

import CoreCastEfficiency from 'Parser/Core/Modules/CastEfficiency';
import getCastEfficiency from 'Parser/Core/getCastEfficiency';

import Tab from 'Main/Tab';

import CastEfficiencyComponent from './CastEfficiencyComponent';

const SPELL_CATEGORY = {
  ROTATIONAL: 'Spell',
  ROTATIONAL_AOE: 'Spell (AOE)',
  DOTS: 'Dot',
  COOLDOWNS: 'Cooldown',
};

class CastEfficiency extends CoreCastEfficiency {
  static CPM_ABILITIES = [
    {
      spell: SPELLS.LAVA_BURST,
      charges: 2,
      category: SPELL_CATEGORY.ROTATIONAL,
      getCooldown: haste => null, // haste => 8 / (1 + haste)
      // TODO: Add Cooldown with stacks and Lava Surge procs
    },
    {
      spell: SPELLS.LIGHTNING_BOLT,
      category: SPELL_CATEGORY.ROTATIONAL,
      getCooldown: haste => null, // 1.5 / (1 + haste)
    },
    {
      spell: SPELLS.LIQUID_MAGMA_TOTEM,
      category: SPELL_CATEGORY.ROTATIONAL_AOE,
      isActive: combatant => combatant.hasTalent(SPELLS.LIQUID_MAGMA_TOTEM.id),
      getCooldown: haste => null,
    },
    {
      spell: SPELLS.CHAIN_LIGHTNING,
      category: SPELL_CATEGORY.ROTATIONAL_AOE,
      getCooldown: haste => null, // 2 / (1 + haste)
    },
    {
      spell: SPELLS.EARTHQUAKE,
      category: SPELL_CATEGORY.ROTATIONAL_AOE,
      getCooldown: haste => null,
    },
    {
      spell: SPELLS.ELEMENTAL_BLAST,
      category: SPELL_CATEGORY.ROTATIONAL,
      isActive: combatant => combatant.hasTalent(SPELLS.ELEMENTAL_BLAST.id),
      getCooldown: haste => 12,
      recommendedCastEfficiency: 0.6,
    },
    {
      spell: SPELLS.ASCENDANCE,
      category: SPELL_CATEGORY.COOLDOWNS,
      getCooldown: haste => 180,
      isActive: combatant => combatant.hasTalent(SPELLS.ASCENDANCE.id),
      recommendedCastEfficiency: 1.0,
    },
    {
      spell: SPELLS.STORMKEEPER,
      category: SPELL_CATEGORY.COOLDOWNS,
      getCooldown: haste => 60,
    },
    {
      spell: SPELLS.FIRE_ELEMENTAL,
      category: SPELL_CATEGORY.COOLDOWNS,
      getCooldown: haste => 60 * 5, // TODO: Add Elementalist -> Lava Burst cast ^= -2 sec cd
      recommendedCastEfficiency: 1.0,
    },
    {
      spell: SPELLS.VELENS_FUTURE_SIGHT,
      category: SPELL_CATEGORY.COOLDOWNS,
      getCooldown: haste => 75,
      isActive: combatant => combatant.hasTrinket(ITEMS.VELENS_FUTURE_SIGHT.id),
    },
    {
      spell: SPELLS.GNAWED_THUMB_RING,
      category: SPELL_CATEGORY.COOLDOWNS,
      getCooldown: haste => 180,
      isActive: combatant => combatant.hasFinger(ITEMS.GNAWED_THUMB_RING.id),
    },
    {
      spell: SPELLS.FLAME_SHOCK,
      category: SPELL_CATEGORY.DOTS,
      getCooldown: haste => null,
    },
    {
      spell: SPELLS.FROST_SHOCK,
      category: SPELL_CATEGORY.DOTS,
      getCooldown: haste => null,
    },
  ];
  static SPELL_CATEGORIES = SPELL_CATEGORY;

  tab() {
    return {
      title: 'Cast efficiency',
      url: 'cast-efficiency',
      render: () => (
        <Tab title="Cast efficiency">
          <CastEfficiencyComponent
            categories={this.constructor.SPELL_CATEGORIES}
            abilities={getCastEfficiency(this.constructor.CPM_ABILITIES, this.owner)}
          />
        </Tab>
      ),
    };
  }
}

export default CastEfficiency;
