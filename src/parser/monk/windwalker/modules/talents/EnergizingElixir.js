import React from 'react';

import SPELLS from 'common/SPELLS';
import SpellIcon from 'common/SpellIcon';
import RESOURCE_TYPES from 'game/RESOURCE_TYPES';
import StatisticBox, { STATISTIC_ORDER } from 'interface/others/StatisticBox';

import Analyzer from 'parser/core/Analyzer';

class EnergizingElixir extends Analyzer {
  energyGained = 0;
  energyWasted = 0;
  eeCasts = 0;

  constructor(...args) {
    super(...args);
    this.active = this.selectedCombatant.hasTalent(SPELLS.ENERGIZING_ELIXIR_TALENT.id);
  }

  on_byPlayer_cast(event) {
    const spellId = event.ability.guid;
    if (spellId !== SPELLS.ENERGIZING_ELIXIR_TALENT.id) {
      return;
    }
    this.eeCasts += 1;
  }

  /**
   * Calculate the amount of Energy gained and wasted
   * for each cast event of Energizing Elixir.
   */
  on_toPlayer_energize(event) {
    const spellId = event.ability.guid;
    if (spellId !== SPELLS.ENERGIZING_ELIXIR_TALENT.id) {
      return;
    }
    if (event.resourceChangeType === RESOURCE_TYPES.ENERGY.id) {
      this.energyWasted += event.waste;
      this.energyGained += event.resourceChange - event.waste;
    }
  }

  statistic() {
    return (
      <StatisticBox
        position={STATISTIC_ORDER.CORE(7)}
        icon={<SpellIcon id={SPELLS.ENERGIZING_ELIXIR_TALENT.id} />}
        value={this.energyGained}
        label="Energy gained"
        tooltip={`from ${this.eeCasts} Energizing Elixir Casts`}
      />
    );
  }
}
  export default EnergizingElixir;
