import React from 'react';
import Analyzer from 'parser/core/Analyzer';

import SPELLS from 'common/SPELLS';
import HIT_TYPES from 'game/HIT_TYPES';
import { calculateAzeriteEffects } from 'common/stats';
import { formatNumber } from 'common/format';
import TraitStatisticBox, { STATISTIC_ORDER } from 'interface/others/TraitStatisticBox';
import ItemDamageDone from 'interface/others/ItemDamageDone';

/**
 * Elusive Footwork
 *
 * Increases your Blackout Strike damage by X. When your Blackout Strike
 * critically strikes, gain a stack of Mastery: Elusive Brawler.
 *
 * Example Report: https://www.warcraftlogs.com/reports/TfcmpjkbNhq18yBF#fight=4&type=summary&source=14
 */
class ElusiveFootwork extends Analyzer {
  // damage added by traits
  _bonusDamagePerCast = 0;
  _bonusDamage = 0; // sum over all casts

  // stacks gained
  _ebStacksGenerated = 0;

  _casts = 0;
  
  constructor(...args) {
    super(...args);
    if(!this.selectedCombatant.hasTrait(SPELLS.ELUSIVE_FOOTWORK.id)) {
      this.active = false;
      return;
    }

    this._bonusDamagePerCast = this.selectedCombatant.traitsBySpellId[SPELLS.ELUSIVE_FOOTWORK.id]
      .reduce((sum, rank) => sum + calculateAzeriteEffects(SPELLS.ELUSIVE_FOOTWORK.id, rank)[0], 0);
  }

  on_byPlayer_damage(event) {
    if(event.ability.guid !== SPELLS.BLACKOUT_STRIKE.id) {
      return;
    }

    if(event.hitType === HIT_TYPES.CRIT) {
      this._ebStacksGenerated += 1;
    }
    this._bonusDamage += this._expectedBonusDamage(event);
    this._casts += 1;
  }

  // this is an *approximation*. the attackPower field i'm getting is
  // basically always 0, so we're going to only include damage reduction
  // on the target and ignore damage bonuses (e.g. from spec aura or
  // bonuses).
  _expectedBonusDamage(event) {
    const critMultiplier = (event.hitType === HIT_TYPES.CRIT) ? 2 : 1;
    return event.amount / event.unmitigatedAmount * this._bonusDamagePerCast * critMultiplier;
  }

  statistic() {
    return (
      <TraitStatisticBox
        position={STATISTIC_ORDER.OPTIONAL()}
        trait={SPELLS.ELUSIVE_FOOTWORK.id}
        value={(
          <ItemDamageDone amount={this._bonusDamage} />
        )}
        tooltip={`Your Blackout Strike casts each dealt an average ${formatNumber(this._bonusDamage / this._casts)} additional damage.<br/>
            You generated an additional ${this._ebStacksGenerated} stacks of Elusive Brawler.`}
      />
    );
  }
}

export default ElusiveFootwork;
