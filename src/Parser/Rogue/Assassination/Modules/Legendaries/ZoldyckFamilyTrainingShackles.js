import React from 'react';

import SPELLS from 'common/SPELLS';
import ITEMS from 'common/ITEMS';

import Analyzer from 'Parser/Core/Analyzer';
import { formatNumber } from 'common/format';
import calculateEffectiveDamage from 'Parser/Core/calculateEffectiveDamage';
import ItemDamageDone from 'Main/ItemDamageDone';

const POISONS_AND_BLEEDS = [
  SPELLS.DEADLY_POISON_PROC.id,
  SPELLS.DEADLY_POISON_DOT.id,
  SPELLS.POISON_BOMB.id,
  SPELLS.POISON_KNIVES.id,
  SPELLS.ENVENOM.id,
  SPELLS.POISONED_KNIFE.id, 
  SPELLS.TOXIC_BLADE_TALENT.id,
  SPELLS.GARROTE.id,
  SPELLS.RUPTURE.id,
];

const ZOLDYCK_FAMILY_TRAINING_SHACKLES = {
  INCREASE: .3,
  HEALTH_PERCENT: .3,
};

/**
 * Equip: Your Poisons and Bleeds deal 30% increased damage to targets below 30% health.
 */
class ZoldyckFamilyTrainingShackles extends Analyzer {
  bonusDamage = 0;

  constructor(...args) {
    super(...args);
    this.active = this.selectedCombatant.hasWrists(ITEMS.ZOLDYCK_FAMILY_TRAINING_SHACKLES.id);
  }

  on_byPlayer_damage(event) {
    const spellId = event.ability.guid;
    if(!POISONS_AND_BLEEDS.includes(spellId)) {
      return;
    }
    if(this.healthPercent(event.hitPoints, event.maxHitPoints) < ZOLDYCK_FAMILY_TRAINING_SHACKLES.HEALTH_PERCENT) {
      this.bonusDamage += calculateEffectiveDamage(event, ZOLDYCK_FAMILY_TRAINING_SHACKLES.INCREASE);
    }
  }

  healthPercent(currentHealth, maxHealth) {
    return currentHealth / maxHealth;
  }

  item() {
    return {
      item: ITEMS.ZOLDYCK_FAMILY_TRAINING_SHACKLES,
      result: (
        <dfn data-tip={`Total Damage Contributed: <b>${formatNumber(this.bonusDamage)}</b>`}>
          <ItemDamageDone amount={this.bonusDamage} />
        </dfn>
      ),
    };
  }
}

export default ZoldyckFamilyTrainingShackles;
