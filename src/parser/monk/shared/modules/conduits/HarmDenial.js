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

import { conduitScaling } from '../../../mistweaver/constants';


class HarmDenial extends Analyzer {

  healingIncrease = 0;

  healingBoost = 0;
  bonusDamage = 0;

  /**
   * Expel harm healing is boosted by x%
   */
  constructor(...args) {
    super(...args);

    const conduitRank = this.selectedCombatant.conduitRankBySpellID(SPELLS.HARM_DENIAL.id);
    
    if (!conduitRank) {
      this.active = false;
      return;
    }

    this.healingBoost = conduitScaling(.25, conduitRank);

    this.addEventListener(Events.heal.by(SELECTED_PLAYER).spell([SPELLS.EXPEL_HARM, SPELLS.EXPEL_HARM_TARGET_HEAL]), this.extraHealing);
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
