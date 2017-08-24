import React from 'react';

import ITEMS from 'common/ITEMS';
import SPELLS from 'common/SPELLS';
import ItemLink from 'common/ItemLink';
import { formatPercentage } from 'common/format';

import Module from 'Parser/Core/Module';
import calculateEffectiveHealing from 'Parser/Core/calculateEffectiveHealing';

const LEGENDARY_VELENS_HEAL_SPELL_ID = 235967;
const LEGENDARY_VELENS_HEALING_INCREASE = 0.15;

class Velens extends Module {
  static SUGGESTION_VELENS_BREAKPOINT = 0.045;

  healingIncreaseHealing = 0;
  overhealHealing = 0;
  get healing() {
    return this.healingIncreaseHealing + this.overhealHealing;
  }

  on_initialized() {
    this.active = this.owner.selectedCombatant.hasTrinket(ITEMS.VELENS_FUTURE_SIGHT.id);
  }

  on_byPlayer_heal(event) {
    this.registerHeal(event);
  }
  on_byPlayer_absorbed(event) {
    this.registerHeal(event);
  }
  registerHeal(event) {
    const spellId = event.ability.guid;
    if (this.owner.constructor.abilitiesAffectedByHealingIncreases.indexOf(spellId) === -1 && spellId !== LEGENDARY_VELENS_HEAL_SPELL_ID) {
      return;
    }

    if (spellId === LEGENDARY_VELENS_HEAL_SPELL_ID) {
      // This is the overhealing part of Velen's Future Sight, just include its amount and we're done
      this.overhealHealing += event.amount;
      return;
    }

    if (!this.owner.selectedCombatant.hasBuff(SPELLS.VELENS_FUTURE_SIGHT.id, event.timestamp)) {
      return;
    }

    this.healingIncreaseHealing += calculateEffectiveHealing(event, LEGENDARY_VELENS_HEALING_INCREASE);
  }

  item() {
    return {
      item: ITEMS.VELENS_FUTURE_SIGHT,
      result: (
        <dfn data-tip={`The effective healing contributed by the Velen's Future Sight use effect. ${formatPercentage(this.owner.getPercentageOfTotalHealingDone(this.healingIncreaseHealing))}% of total healing was contributed by the 15% healing increase and ${formatPercentage(this.owner.getPercentageOfTotalHealingDone(this.overhealHealing))}% of total healing was contributed by the overhealing distribution.`}>
          {this.owner.formatItemHealingDone(this.healing)}
        </dfn>
      ),
    };
  }
  suggestions(when) {
    when(this.owner.getPercentageOfTotalHealingDone(this.healing)).isLessThan(this.constructor.SUGGESTION_VELENS_BREAKPOINT)
      .addSuggestion((suggest, actual, recommended) => {
        return suggest(<span>Your usage of <ItemLink id={ITEMS.VELENS_FUTURE_SIGHT.id} /> can be improved. Try to maximize the amount of healing during the buff without excessively overhealing on purpose, or consider using an easier legendary.</span>)
          .icon(ITEMS.VELENS_FUTURE_SIGHT.icon)
          .actual(`${this.owner.formatItemHealingDone(this.healing)} healing contributed`)
          .recommended(`>${formatPercentage(recommended)}% is recommended`)
          .regular(recommended - 0.005).major(recommended - 0.015);
      });
  }
}

export default Velens;
