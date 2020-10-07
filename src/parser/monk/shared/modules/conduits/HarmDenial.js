import React from 'react';

import SPELLS from 'common/SPELLS';
import calculateEffectiveHealing from 'parser/core/calculateEffectiveHealing';
import Analyzer, { SELECTED_PLAYER } from 'parser/core/Analyzer';
import Statistic from 'interface/statistics/Statistic';
import STATISTIC_ORDER from 'interface/others/STATISTIC_ORDER';
import STATISTIC_CATEGORY from 'interface/others/STATISTIC_CATEGORY';
import ItemDamageDone from 'interface/ItemDamageDone';
import ItemHealingDone from 'interface/ItemHealingDone';
import Events from 'parser/core/Events';

import BoringSpellValueText from 'interface/statistics/components/BoringSpellValueText';

class HarmDenial extends Analyzer {

  healingIncrease = 0;

  healingBoost = 0;
  bonusDamage = 0;

  /**
   * Expel harm healing is boosted by x%
   */
  constructor(...args) {
    super(...args);
    this.active = false;//FIXME actually check if they have the conduit
    if (!this.active) {
      return;
    }

    this.healingBoost = .2;

    this.addEventListener(Events.heal.by(SELECTED_PLAYER).spell(SPELLS.EXPEL_HARM), this.extraHealing);
  }

  extraHealing(event) {
    const bonusHealing = calculateEffectiveHealing(event, this.healingBoost) || 0;
    this.healingIncrease += bonusHealing;
    this.bonusDamage += bonusHealing * .1;
  }

  statistic() {
    return (
      <Statistic
        position={STATISTIC_ORDER.OPTIONAL(13)}
        size="flexible"
        category={STATISTIC_CATEGORY.COVENANTS}
      >
        <BoringSpellValueText spell={SPELLS.HARM_DENIAL}>
          <ItemDamageDone amount={this.bonusDamage} /><br />
          <ItemHealingDone amount={this.healingIncrease} />
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default HarmDenial;
