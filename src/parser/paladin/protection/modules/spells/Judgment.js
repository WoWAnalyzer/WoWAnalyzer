import React from 'react';
import SPELLS from 'common/SPELLS';

import StatisticBox from 'interface/others/StatisticBox';
import SpellIcon from 'common/SpellIcon';
import Analyzer from 'parser/core/Analyzer';
import AbilityTracker from 'parser/shared/modules/AbilityTracker';
import SpellUsable from 'parser/shared/modules/SpellUsable';
import HIT_TYPES from 'game/HIT_TYPES';
import { formatNumber, formatPercentage } from 'common/format';

const REDUCTION_TIME_REGULAR = 2000; // ms
const REDUCTION_TIME_CRIT = 4000; // ms

/**
 * Judgment
 * Judges the target dealing (250% of Spell power) Holy damage, and reducing the remaining cooldown on Shield of the Righteous by 2 sec, or 4 sec on a critical strike.
 */
class Judgment extends Analyzer {
  _totalCdr = 0;
  _wastedCdr = 0;

  _casts = 0;
  _crits = 0;

  static dependencies = {
    abilityTracker: AbilityTracker,
    spellUsable: SpellUsable,
  };

  on_byPlayer_damage(event) {
    const spellId = event.ability.guid;
    if (spellId !== SPELLS.JUDGMENT_CAST_PROTECTION.id) {
      return;
    }

    this._casts += 1;

    const isCrit = event.hitType === HIT_TYPES.CRIT || event.hitType === HIT_TYPES.BLOCKED_CRIT;
    this._crits += isCrit ? 1 : 0;

    if (this.spellUsable.isOnCooldown(SPELLS.SHIELD_OF_THE_RIGHTEOUS.id)) {
      // Nope, I did not verify if blocked crits count as crits for this trait, I just assumed it. Please do test if you can and report back or fix this comment.
      // Confirmed: Blocked crits count as crits.
      const reduction = isCrit ? REDUCTION_TIME_CRIT : REDUCTION_TIME_REGULAR;
      const actualReduction = this.spellUsable.reduceCooldown(SPELLS.SHIELD_OF_THE_RIGHTEOUS.id, reduction);
      this._totalCdr += actualReduction;
      this._wastedCdr += reduction - actualReduction;
    }
  }

  get cdrPercentage() {
    return this._totalCdr / (this.owner.fightDuration + this._totalCdr);
  }

  statistic() {
    return (
      <StatisticBox
        icon={<SpellIcon id={SPELLS.SHIELD_OF_THE_RIGHTEOUS.id} />}
        label="Effective SotR CDR"
        value={`${formatPercentage(this.cdrPercentage)}%`}
        tooltip={`Your Judgment casts reduced the cooldown of Shield of the Righteous by <b>${formatNumber(this._totalCdr / 1000)}s</b> over ${formatNumber(this._casts)} casts, ${formatNumber(this._crits)} of which were critical strikes.<br/>
            You wasted <b>${formatNumber(this._wastedCdr / 1000)}s</b> of cooldown reduction.`}
          />
    );
  }
}

export default Judgment;
