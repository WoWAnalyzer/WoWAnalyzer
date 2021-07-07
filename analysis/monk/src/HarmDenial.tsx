import SPELLS from 'common/SPELLS';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import calculateEffectiveHealing from 'parser/core/calculateEffectiveHealing';
import conduitScaling from 'parser/core/conduitScaling';
import Events, { HealEvent } from 'parser/core/Events';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import ItemDamageDone from 'parser/ui/ItemDamageDone';
import ItemHealingDone from 'parser/ui/ItemHealingDone';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';
import React from 'react';

class HarmDenial extends Analyzer {
  healingIncrease = 0;
  healingBoost = 0;
  bonusDamage = 0;

  /**
   * Expel harm healing is boosted by x%
   */
  constructor(options: Options) {
    super(options);

    const conduitRank = this.selectedCombatant.conduitRankBySpellID(SPELLS.HARM_DENIAL.id);

    if (!conduitRank) {
      this.active = false;
      return;
    }

    this.healingBoost = conduitScaling(0.25, conduitRank);

    this.addEventListener(
      Events.heal.by(SELECTED_PLAYER).spell([SPELLS.EXPEL_HARM, SPELLS.EXPEL_HARM_TARGET_HEAL]),
      this.extraHealing,
    );
  }

  extraHealing(event: HealEvent) {
    const bonusHealing = calculateEffectiveHealing(event, this.healingBoost) || 0;
    this.healingIncrease += bonusHealing;
    this.bonusDamage += bonusHealing * 0.1;
  }

  statistic() {
    return (
      <Statistic
        position={STATISTIC_ORDER.OPTIONAL(13)}
        size="flexible"
        category={STATISTIC_CATEGORY.COVENANTS}
      >
        <BoringSpellValueText spellId={SPELLS.HARM_DENIAL.id}>
          <ItemDamageDone amount={this.bonusDamage} />
          <br />
          <ItemHealingDone amount={this.healingIncrease} />
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default HarmDenial;
