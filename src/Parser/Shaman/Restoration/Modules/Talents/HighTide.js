import React from 'react';

import SpellLink from 'common/SpellLink';
import SPELLS from 'common/SPELLS';
import { formatPercentage } from 'common/format';

import Analyzer from 'Parser/Core/Analyzer';
import Combatants from 'Parser/Core/Modules/Combatants';
import calculateEffectiveHealing from 'Parser/Core/calculateEffectiveHealing';

const HEAL_WINDOW_MS = 100;
const bounceReduction = 0.7;
const bounceReductionHighTide = 0.85;

class HighTide extends Analyzer {
  static dependencies = {
    combatants: Combatants,
  };
  healing = 0;
  chainHealBounce = 0;
  chainHealTimestamp = 0;
  chainHealFeedBounce = 0;
  chainHealFeedTimestamp = 0;

  on_initialized() {
    this.active = this.combatants.selected.hasTalent(SPELLS.HIGH_TIDE_TALENT.id);
  }

  on_byPlayer_heal(event) {
    const spellId = event.ability.guid;

    if (spellId !== SPELLS.CHAIN_HEAL.id) {
      return;
    }

    // resets the bounces to 0 if its a new chain heal, can't use the cast event for this as its often somewhere in the middle of the healing events
    if(!this.chainHealTimestamp || event.timestamp - this.chainHealTimestamp > HEAL_WINDOW_MS) {
      this.chainHealTimestamp = event.timestamp;
      this.chainHealBounce = 0;
    }

    const FACTOR_CONTRIBUTED_BY_HT_HIT = (1-(Math.pow(bounceReduction,this.chainHealBounce) / Math.pow(bounceReductionHighTide,this.chainHealBounce)));

    if(this.chainHealBounce === 4) {
      this.healing += event.amount;
    } else {
      this.healing += calculateEffectiveHealing(event, FACTOR_CONTRIBUTED_BY_HT_HIT);
    }

    this.chainHealBounce++;
  }

  on_feed_heal(event) {
    const spellId = event.ability.guid;

    if (spellId !== SPELLS.CHAIN_HEAL.id) {
      return;
    }

    if(!this.chainHealFeedTimestamp || event.timestamp - this.chainHealFeedTimestamp > HEAL_WINDOW_MS) {
      this.chainHealFeedTimestamp = event.timestamp;
      this.chainHealFeedBounce = 0;
    }

    const FACTOR_CONTRIBUTED_BY_HT_HIT = (1-(Math.pow(bounceReduction,this.chainHealFeedBounce) / Math.pow(bounceReductionHighTide,this.chainHealBounce)));

    if(this.chainHealFeedBounce === 4) {
      this.healing += event.feed;
    } else {
      this.healing += event.feed * FACTOR_CONTRIBUTED_BY_HT_HIT;
    }

    this.chainHealFeedBounce++;
  }
  

  subStatistic() {
    return (
      <div className="flex">
        <div className="flex-main">
          <SpellLink id={SPELLS.HIGH_TIDE_TALENT.id} />
        </div>
        <div className="flex-sub text-right">
          {formatPercentage(this.owner.getPercentageOfTotalHealingDone(this.healing))} %
        </div>
      </div>
    );
  }

}

export default HighTide;

