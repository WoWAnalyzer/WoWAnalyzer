import React from 'react';
import SPELLS from 'common/SPELLS/index';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import ItemHealingDone from 'interface/ItemHealingDone';
import Statistic from 'interface/statistics/Statistic';
import Events, { ApplyBuffEvent, HealEvent, RemoveBuffEvent } from 'parser/core/Events';
import STATISTIC_CATEGORY from 'interface/others/STATISTIC_CATEGORY';
import BoringSpellValueText from 'interface/statistics/components/BoringSpellValueText';
import STATISTIC_ORDER from 'interface/others/STATISTIC_ORDER';
import { formatNumber, formatPercentage } from 'common/format';

const RENEWED_FAITH_MULTIPLIER = 1.1;

class RenewedFaith extends Analyzer {
  renewTracker: { [combatantId: number]: boolean } = {};
  rawAdditionalHealing: number = 0;
  effectiveAdditionalHealing: number = 0;
  overhealing: number = 0;

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(SPELLS.RENEWED_FAITH_TALENT.id);

    this.addEventListener(Events.applybuff.by(SELECTED_PLAYER).spell(SPELLS.RENEW), this.onRenewApplication);
    this.addEventListener(Events.removebuff.by(SELECTED_PLAYER).spell(SPELLS.RENEW), this.onRenewRemoval);
    this.addEventListener(Events.heal.by(SELECTED_PLAYER), this.onHeal);
  }

  get percentOverhealing() {
    if (this.rawAdditionalHealing === 0) {
      return 0;
    }
    return this.overhealing / this.rawAdditionalHealing;
  }

  onRenewApplication(event: ApplyBuffEvent) {
    this.renewTracker[event.targetID] = true;
  }

  onRenewRemoval(event: RemoveBuffEvent) {
    this.renewTracker[event.targetID] = false;
  }

  onHeal(event: HealEvent) {
    // If the character that you are healing has renew on them...
    if (this.renewTracker[event.targetID]) {
      // Calculate the amount of healing that we can attribute to this talent.
      const rawHealAmount = event.amount - (event.amount / RENEWED_FAITH_MULTIPLIER);
      let effectiveHealAmount = rawHealAmount - (event.overheal || 0);
      // If we overhealed more than 100% of the contribution of RF, the effective heal is 0.
      if (effectiveHealAmount < 0) {
        effectiveHealAmount = 0;
      }
      const overhealAmount = rawHealAmount - effectiveHealAmount;

      this.rawAdditionalHealing += rawHealAmount;
      this.effectiveAdditionalHealing += effectiveHealAmount;
      this.overhealing += overhealAmount;
    }
  }

  statistic() {
    return (
      <Statistic
        tooltip={(<>
          Total Healing: {formatNumber(this.rawAdditionalHealing)} ({formatPercentage(this.percentOverhealing)}% OH)
        </>)}
        size="flexible"
        category={STATISTIC_CATEGORY.TALENTS}
        position={STATISTIC_ORDER.OPTIONAL(1)}
      >
        <BoringSpellValueText spell={SPELLS.RENEWED_FAITH_TALENT}>
          <ItemHealingDone amount={this.effectiveAdditionalHealing} />
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default RenewedFaith;
