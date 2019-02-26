import React from 'react';

import { formatNumber, formatPercentage } from 'common/format';
import SPELLS from 'common/SPELLS';
import { calculateAzeriteEffects } from 'common/stats';
import Analyzer, { SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events from 'parser/core/Events';
import StatTracker from 'parser/shared/modules/StatTracker';
import TraitStatisticBox, { STATISTIC_ORDER } from 'interface/others/TraitStatisticBox';

const DURATION_INCREASE = 2000;

/**
 * Jungle Fury
 * Tiger's Fury increases your critical strike by X and lasts 12 sec. (An increase from the standard 10 seconds)
 */
class JungleFury extends Analyzer {
  static dependencies = {
    statTracker: StatTracker,
  };

  critRating = 0;
  hasPredator = false;
  buffCount = 0;

  constructor(...args) {
    super(...args);
    if (!this.selectedCombatant.hasTrait(SPELLS.JUNGLE_FURY_TRAIT.id)) {
      this.active = false;
      return;
    }
    this.hasPredator = this.selectedCombatant.hasTalent(SPELLS.PREDATOR_TALENT.id);

    this.critRating = this.selectedCombatant.traitsBySpellId[SPELLS.JUNGLE_FURY_TRAIT.id]
      .reduce((sum, rank) => sum + calculateAzeriteEffects(SPELLS.JUNGLE_FURY_TRAIT.id, rank)[0], 0);

    this.addEventListener(Events.removebuff.to(SELECTED_PLAYER).spell(SPELLS.TIGERS_FURY), this._loseTigersFury);

    this.statTracker.add(SPELLS.JUNGLE_FURY_BUFF.id, {
      crit: this.critRating,
    });
  }

  _loseTigersFury(event) {
    // Count how often the player benefits from the increased duration by looking for the buff dropping. Makes sure pre-combat casts are included and avoids cases where the extra time would have been after the fight ended.
    if (this.hasPredator) {
      // The Predator talent complicates calculating how much extra uptime was provided by this trait. It is possible to do, but as the talent is currently rarely taken I'll skip the work for now.
      return;
    }
    this.buffCount += 1;
  }

  get buffUptime() {
    return this.selectedCombatant.getBuffUptime(SPELLS.JUNGLE_FURY_BUFF.id) / this.owner.fightDuration;
  }

  get averageCritRating(){
    return this.buffUptime * this.critRating;
  }

  statistic() {
    const timeComment = this.hasPredator ? '' : `<br />The trait provided you with an extra <b>${(this.buffCount * DURATION_INCREASE / 1000).toFixed(0)}</b> seconds of Tiger's Fury over the course of this fight.`;
    return (
      <TraitStatisticBox
        position={STATISTIC_ORDER.OPTIONAL()}
        trait={SPELLS.JUNGLE_FURY_TRAIT.id}
        value={(
          <>
            {formatPercentage(this.buffUptime)}% uptime <br />
            {formatNumber(this.averageCritRating)} average Crit
          </>
        )}
        tooltip={`Jungle Fury grants <b>${this.critRating}</b> critical strike rating while Tiger's Fury is active.${timeComment}`}
      />
    );
  }
}

export default JungleFury;
