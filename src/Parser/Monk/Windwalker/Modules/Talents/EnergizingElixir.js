import React from 'react';

import SPELLS from 'common/SPELLS';
import SpellIcon from 'common/SpellIcon';
import RESOURCE_TYPES from 'common/RESOURCE_TYPES';
import StatisticBox from 'Main/StatisticBox';

import Combatants from 'Parser/Core/Modules/Combatants';

import Analyzer from 'Parser/Core/Analyzer';

class EnergizingElixir extends Analyzer {
  static dependencies = {
    combatants: Combatants,
  };
  chiGained = 0;
  energyGained = 0;
  energyWasted = 0;
  chiSaved = 0;
  eeCasts = 0;

  on_initialized() {
    this.active = this.combatants.selected.hasTalent(SPELLS.ENERGIZING_ELIXIR_TALENT.id);
  }

  on_byPlayer_cast(event) {
    const spellId = event.ability.guid;
    if (spellId !== SPELLS.ENERGIZING_ELIXIR_TALENT.id) {
      return;
    }
    this.eeCasts += 1;
  }

  /**
   * Calculate the amount of Energy and Chi gained and wasted
   * for each cast event of Energizing Elixir.
   */
  on_toPlayer_energize(event) {
    const spellId = event.ability.guid;
    if (spellId === SPELLS.ENERGIZING_ELIXIR_TALENT.id) {
      if (event.resourceChangeType === RESOURCE_TYPES.ENERGY.id) {
        this.energyWasted += event.waste;
        this.energyGained += event.resourceChange - event.waste;
      }
      if (event.resourceChangeType === RESOURCE_TYPES.CHI.id) {
        this.chiWasted += event.waste;
        this.chiGained += event.resourceChange - event.waste;
      }
    }
  }

  statistic() {
    return (<StatisticBox icon={<SpellIcon id={SPELLS.ENERGIZING_ELIXIR_TALENT.id}/>}
      value={this.energyGained}
      label={(
        <dfn data-tip={`from ${this.eeCasts} Energizing Elixir Casts`}>
          Energy gained
        </dfn>
        )}
        />
      );
    }
  }
  export default EnergizingElixir;
