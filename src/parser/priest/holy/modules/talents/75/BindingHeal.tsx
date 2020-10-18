import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import SPELLS from 'common/SPELLS';
import React from 'react';
import ItemHealingDone from 'interface/ItemHealingDone';
import { formatPercentage, formatThousands } from 'common/format';
import Events, { CastEvent, HealEvent } from 'parser/core/Events';
import Statistic from 'interface/statistics/Statistic';
import STATISTIC_CATEGORY from 'interface/others/STATISTIC_CATEGORY';
import BoringSpellValueText from 'interface/statistics/components/BoringSpellValueText';
import STATISTIC_ORDER from 'interface/others/STATISTIC_ORDER';

// Example Log: /report/PNYB4zgrnR86h7Lc/6-Normal+Zek'voz,+Herald+of+N'zoth/Khadaj
class BindingHeal extends Analyzer {
  bindingHealCasts = 0;
  bindingHealSelfHealing = 0;
  bindingHealSelfOverhealing = 0;
  bindingHealPartyHealing = 0;
  bindingHealPartyOverhealing = 0;

  bindingHealTargets = {};

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(SPELLS.BINDING_HEAL_TALENT.id);
    this.addEventListener(Events.cast.by(SELECTED_PLAYER).spell(SPELLS.BINDING_HEAL_TALENT), this.onCast);
    this.addEventListener(Events.heal.by(SELECTED_PLAYER).spell(SPELLS.BINDING_HEAL_TALENT), this.onHeal);
  }

  get bindingHealHealing() {
    return this.bindingHealSelfHealing + this.bindingHealPartyHealing;
  }

  get bindingHealOverHealing() {
    return this.bindingHealSelfHealing + this.bindingHealPartyHealing;
  }

  getOverhealPercent(healingDone: number, overhealingDone: number) {
    const percent = overhealingDone / (healingDone + overhealingDone);
    return percent;
  }

  onCast(event: CastEvent) {
    this.bindingHealCasts += 1;
  }

  onHeal(event: HealEvent) {
    //this.bindingHealTargets[ev] = event.ability;
    if (event.targetID === this.owner.selectedCombatant._combatantInfo.sourceID) {
      // Self Heal
      if (event.overheal) {
        this.bindingHealSelfOverhealing += event.overheal;
      }
      this.bindingHealSelfHealing += event.amount;
    } else {
      // Party Heal
      if (event.overheal) {
        this.bindingHealPartyOverhealing += event.overheal;
      }
      this.bindingHealPartyHealing += event.amount;
    }
  }

  statistic() {
    return (
      <Statistic
        tooltip={(
          <>
            Casts: {this.bindingHealCasts}<br />
            Self Healing: {formatThousands(this.bindingHealSelfHealing)} ({formatPercentage(this.getOverhealPercent(this.bindingHealSelfHealing, this.bindingHealSelfOverhealing))}% OH)<br />
            Party Healing: {formatThousands(this.bindingHealPartyHealing)} ({formatPercentage(this.getOverhealPercent(this.bindingHealPartyHealing, this.bindingHealPartyOverhealing))}% OH)
          </>
        )}
        size="flexible"
        category={STATISTIC_CATEGORY.TALENTS}
        position={STATISTIC_ORDER.OPTIONAL(5)}
      >
        <BoringSpellValueText spell={SPELLS.BINDING_HEAL_TALENT}>
          <ItemHealingDone amount={this.bindingHealHealing} />
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default BindingHeal;
