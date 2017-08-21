import React from 'react';

import SpellLink from 'common/SpellLink';
import { formatPercentage } from 'common/format';

import Module from 'Parser/Core/Module';
import getCastEfficiency from 'Parser/Core/getCastEfficiency';

import Tab from 'Main/Tab';
import CastEfficiencyComponent from 'Main/CastEfficiency';

import SPELLS from 'common/SPELLS';
import ITEMS from 'common/ITEMS';

class CastEfficiency extends Module {
  static SPELL_CATEGORIES = [
    {
      ROTATIONAL: 'Rotational Spell',
    },
    {
      ROTATIONAL_AOE: 'Spell (AOE)',
    },
    {
      COOLDOWNS: 'Cooldown',
    },
    {
      OTHERS: 'Spell',
    },
  ];
  static CPM_ABILITIES = [
    //TODO: fix the SPELL_CATEGORIES shenanigans so baseline on-use items can work
    //Shared trinkets and legendaries
    {
      spell: SPELLS.CLEANSING_MATRIX,
      getCooldown: haste => 60,
      isActive: combatant => combatant.hasTrinket(ITEMS.ARCHIVE_OF_FAITH.id),
    },
    {
      spell: SPELLS.GUIDING_HAND,
      charges: 2,
      getCooldown: haste => 120,
      isActive: combatant => combatant.hasTrinket(ITEMS.DECEIVERS_GRAND_DESIGN.id),
    },
    {
      spell: SPELLS.GNAWED_THUMB_RING,
      getCooldown: haste => 180,
      isActive: combatant => combatant.hasFinger(ITEMS.GNAWED_THUMB_RING.id),
    },
    {
      spell: SPELLS.KILJAEDENS_BURNING_WISH_CAST,
      getCooldown: haste => 75,
      isActive: combatant => combatant.hasTrinket(ITEMS.KILJAEDENS_BURNING_WISH.id),
    },
    {
      spell: SPELLS.SPECTRAL_OWL,
      getCooldown: haste => 120,
      isActive: combatant => combatant.hasTrinket(ITEMS.TARNISHED_SENTINEL_MEDALLION.id),
    },
    {
      spell: SPELLS.TOME_OF_UNRAVELING_SANITY_DAMAGE,
      getCooldown: haste => 60,
      isActive: combatant => combatant.hasTrinket(ITEMS.TOME_OF_UNRAVELING_SANITY.id),
    },
    {
      spell: SPELLS.VELENS_FUTURE_SIGHT,
      getCooldown: haste => 75,
      isActive: combatant => combatant.hasTrinket(ITEMS.VELENS_FUTURE_SIGHT.id),
    },
    {
      spell: SPELLS.SUMMON_DREAD_REFLECTION,
      getCooldown: haste => 45,
      isActive: combatant => combatant.hasTrinket(ITEMS.SPECTER_OF_BETRAYAL.id),
    },
    {
      spell: SPELLS.CEASELESS_TOXIN,
      getCooldown: haste => 60,//TODO: add detection if target has died and reduced cooldown
      isActive: combatant => combatant.hasTrinket(ITEMS.VIAL_OF_CEASELESS_TOXINS.id),
    },
  ];

  suggestions(when) {
    const castEfficiency = getCastEfficiency(this.constructor.CPM_ABILITIES, this.owner);
    castEfficiency.forEach(cpm => {
      if (cpm.ability.noSuggestion || cpm.castEfficiency === null) {
        return;
      }
      when(cpm.castEfficiency).isLessThan(cpm.recommendedCastEfficiency)
        .addSuggestion((suggest, actual, recommended) => {
          return suggest(<span>Try to cast <SpellLink id={cpm.ability.spell.id} /> more often. {cpm.ability.extraSuggestion || ''}</span>)
            .icon(cpm.ability.spell.icon)
            .actual(`${cpm.casts} out of ${cpm.maxCasts} possible casts; ${formatPercentage(actual)}% cast efficiency`)
            .recommended(`>${formatPercentage(recommended)}% is recommended`)
            .regular(recommended - 0.05).major(recommended - 0.15).staticImportance(cpm.ability.importance);
        });
    });
  }
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
