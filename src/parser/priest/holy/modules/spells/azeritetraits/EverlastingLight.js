import React from 'react';
import Analyzer from 'parser/core/Analyzer';

import SPELLS from 'common/SPELLS';
import TraitStatisticBox, { STATISTIC_ORDER } from 'interface/others/TraitStatisticBox';
import { calculateAzeriteEffects } from 'common/stats';
import { formatThousands } from 'common/format';
import ItemHealingDone from 'interface/ItemHealingDone';

const BASE_MANA = 100000;

// Example Log: https://www.warcraftlogs.com/reports/RH7afcWwN8B3AMV9#fight=3&type=healing
class EverlastingLight extends Analyzer {
  azeriteItemLevel = 0;
  ranks;
  bonus;
  totalHealing = 0;
  totalOverhealing = 0;
  totalHealsCast = 0;
  currentMana = BASE_MANA;

  constructor(...args) {
    super(...args);
    this.active = this.selectedCombatant.hasTrait(SPELLS.EVERLASTING_LIGHT.id);
    this.ranks = this.selectedCombatant.traitRanks(SPELLS.EVERLASTING_LIGHT.id) || [];
    this.bonus = this.ranks.map((rank) => calculateAzeriteEffects(SPELLS.EVERLASTING_LIGHT.id, rank)[0]).reduce((total, bonus) => total + bonus, 0);
  }

  get effectiveHealing() {
    const effectivePercent = (1 - (this.currentMana / BASE_MANA));
    const totalEffective = effectivePercent * this.bonus;
    return totalEffective;
  }

  on_byPlayer_cast(event) {
    const spellId = event.ability.guid;

    if (event.classResources) {
      this.currentMana = event.classResources[0].amount;
    }
    if (spellId === SPELLS.GREATER_HEAL.id) {
      this.totalHealsCast += 1;
    }
  }

  on_byPlayer_heal(event) {
    const spellId = event.ability.guid;
    if (spellId === SPELLS.GREATER_HEAL.id) {
      let amountHealed = this.effectiveHealing;
      let amountOverhealed = 0;

      if (event.overheal) {
        amountOverhealed = Math.min(amountHealed, event.overheal);
        amountHealed -= amountOverhealed;
      }

      this.totalHealing += amountHealed;
      this.totalOverhealing += amountOverhealed;
    }
  }

  statistic() {
    return (
      <TraitStatisticBox
        position={STATISTIC_ORDER.OPTIONAL()}
        trait={SPELLS.EVERLASTING_LIGHT.id}
        value={<ItemHealingDone amount={this.totalHealing} />}
        tooltip={`${formatThousands(this.totalHealing)} Total Healing`}
      />
    );
  }
}

export default EverlastingLight;
