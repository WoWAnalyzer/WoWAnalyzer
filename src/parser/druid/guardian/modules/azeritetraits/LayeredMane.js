import React from 'react';

import { formatPercentage } from 'common/format';
import Analyzer from 'parser/core/Analyzer';
import TraitStatisticBox, { STATISTIC_ORDER } from 'interface/others/TraitStatisticBox';
import SPELLS from 'common/SPELLS';
import { calculateAzeriteEffects } from 'common/stats';
import StatTracker from 'parser/shared/modules/StatTracker';

export function layeredManeStats(combatant) {
  if (!combatant.hasTrait(SPELLS.LAYERED_MANE.id)) {
    return 0;
  }

  return combatant.traitsBySpellId[SPELLS.LAYERED_MANE.id]
    .reduce((total, ilevel) => total + calculateAzeriteEffects(SPELLS.LAYERED_MANE.id, ilevel)[0], 0);
}

class LayeredMane extends Analyzer {
  static dependencies = {
    statTracker: StatTracker,
  };

  agility = 0;
  _totalCasts = 0;
  _totalStacks = 0;

  constructor(...args) {
    super(...args);
    this.active = this.selectedCombatant.hasTrait(SPELLS.LAYERED_MANE.id);
    if (!this.active) return;

    this.agility = layeredManeStats(this.selectedCombatant);
    this.statTracker.add(SPELLS.IRONFUR.id, { agility: this.agility });
  }

  on_byPlayer_applybuffstack(event) {
    if (event.ability.guid === SPELLS.IRONFUR.id) {
      this._totalStacks += 1;
    }
  }

  on_byPlayer_applybuff(event) {
    if (event.ability.guid === SPELLS.IRONFUR.id) {
      this._totalStacks += 1;
    }
  }

  on_byPlayer_cast(event) {
    if (event.ability.guid === SPELLS.IRONFUR.id) {
      this._totalCasts += 1;
    }
  }

  get bonusStacks() {
    return this._totalStacks - this._totalCasts;
  }

  get averageStacks() {
    return this.selectedCombatant.getStackWeightedBuffUptime(SPELLS.IRONFUR.id) / this.owner.fightDuration;
  }

  get averageAgility() {
    return this.averageStacks * this.agility;
  }

  statistic() {
    return (
      <TraitStatisticBox
        position={STATISTIC_ORDER.OPTIONAL()}
        trait={SPELLS.LAYERED_MANE.id}
        value={(
          <>
            {formatPercentage(this.bonusStacks / this._totalStacks)}% Bonus Stacks<br />
            {this.averageAgility.toFixed(0)} Agility
          </>
        )}
        tooltip={`You cast Ironfur ${this._totalCasts} times and gained ${this._totalStacks} stacks, for ${this.bonusStacks} additional stacks (${formatPercentage(this.bonusStacks / this._totalStacks)}% proc rate).<br />
            Your Layered Mane(s) granted <b>${this.agility} Agility</b> per stack of Ironfur, and you averaged ${this.averageStacks.toFixed(2)} stacks.`}
      />
    );
  }
}

export default LayeredMane;
