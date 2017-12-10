import React from 'react';

import ITEMS from 'common/ITEMS';
import SPELLS from 'common/SPELLS';
import ItemLink from 'common/ItemLink';
import { formatPercentage } from 'common/format';
import Wrapper from 'common/Wrapper';

import Analyzer from 'Parser/Core/Analyzer';
import calculateEffectiveHealing from 'Parser/Core/calculateEffectiveHealing';
import Combatants from 'Parser/Core/Modules/Combatants';

const LEGENDARY_VELENS_HEALING_INCREASE = 0.15;

/*
 * Velen's Future Sight -
 * Use: Increase all healing done by 15% and causes 50% of overhealing on players to be redistributed to up to 3 nearby injured allies, for 10 sec. (1 Min, 15 Sec Cooldown)
 */
class Velens extends Analyzer {
  static dependencies = {
    combatants: Combatants,
  };

  healingIncreaseHealing = 0;
  overhealHealing = 0;

  get healing() {
    return this.healingIncreaseHealing + this.overhealHealing;
  }

  on_initialized() {
    this.active = this.combatants.selected.hasTrinket(ITEMS.VELENS_FUTURE_SIGHT.id);
  }

  on_byPlayer_heal(event) {
    this.registerHeal(event);
  }
  on_byPlayer_absorbed(event) {
    this.registerHeal(event);
  }
  registerHeal(event) {
    const spellId = event.ability.guid;
    if (spellId === SPELLS.VELENS_FUTURE_SIGHT_HEAL.id) {
      // This is the overhealing part of Velen's Future Sight, just include its amount and we're done
      this.overhealHealing += event.amount;
      return;
    }

    if (!this.owner.constructor.abilitiesAffectedByHealingIncreases.includes(spellId)) {
      return;
    }
    if (!this.combatants.selected.hasBuff(SPELLS.VELENS_FUTURE_SIGHT_BUFF.id, event.timestamp)) {
      return;
    }

    this.healingIncreaseHealing += calculateEffectiveHealing(event, LEGENDARY_VELENS_HEALING_INCREASE);
  }

  item() {
    return {
      item: ITEMS.VELENS_FUTURE_SIGHT,
      result: (
        <dfn data-tip={`Healing Breakdown -
          <ul>
            <li>Flat Healing Increase: <b>${this.owner.formatItemHealingDone(this.healingIncreaseHealing)}</b></li>
            <li>Overheal Distribution: <b>${this.owner.formatItemHealingDone(this.overhealHealing)}</b></li>
          </ul>
        `}>
          {this.owner.formatItemHealingDone(this.healing)}
        </dfn>
      ),
    };
  }

  get suggestionThresholds() {
    return {
      actual: this.owner.getPercentageOfTotalHealingDone(this.healing),
      isLessThan: true,
      minor: 0.04,
      average: 0.035,
      major: 0.025,
      style: 'percentage',
    };
  }

  suggestions(when) {
    when(this.suggestionThresholds.actual).isLessThan(this.suggestionThresholds.minor)
      .addSuggestion((suggest, actual, recommended) => {
        return suggest(<Wrapper>Your usage of <ItemLink id={ITEMS.VELENS_FUTURE_SIGHT.id} /> can be improved. Try to maximize the amount of healing during the buff without excessively overhealing on purpose, or consider using an easier legendary.</Wrapper>)
          .icon(ITEMS.VELENS_FUTURE_SIGHT.icon)
          .actual(`${actual} healing contributed`)
          .recommended(`>${formatPercentage(recommended)}% is recommended`)
          .regular(this.suggestionThresholds.average).major(this.suggestionThresholds.major);
      });
  }
}

export default Velens;
