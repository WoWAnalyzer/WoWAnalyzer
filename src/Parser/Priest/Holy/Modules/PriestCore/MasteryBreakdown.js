import React from 'react';
import { STATISTIC_ORDER } from 'Main/StatisticBox';
import ExpandableStatisticBox from 'Main/ExpandableStatisticBox';
import SpellIcon from 'common/SpellIcon';
import { formatNumber, formatPercentage } from 'common/format';
// dependencies
import Combatants from 'Parser/Core/Modules/Combatants';

import SPELLS from 'common/SPELLS';
import Analyzer from 'Parser/Core/Analyzer';
import { ABILITIES_THAT_TRIGGER_MASTERY } from '../../Constants';

class MasteryBreakdown extends Analyzer {
  static dependencies = {
    combatants: Combatants,
  };

  _tickMode = {};
  _healValByTargetId = {};
  _maxHealVal = {};
  _masteryActive = {};
  effectiveHealDist = {};
  effectiveOverhealDist = {};
  _eHDbyPlayer = {}; // for potential future features

  healing = 0;

  effectiveHealDistPerc = [];

  on_finished() {
    // There's likely a far better way to do this, but my 2AM brain couldn't find it
    let total = 0;
    delete this.effectiveHealDist[SPELLS.RENEW.id]; // see the comment at line ~150 for why this happens

    Object.keys(this.effectiveHealDist).forEach((spell) => {
      total += this.effectiveHealDist[spell];
    });

    const eHDPerc = {};
    Object.keys(this.effectiveHealDist).forEach((spell) => {
      eHDPerc[spell] = this.effectiveHealDist[spell] / total;
    });

    const eOHD = {};
    Object.keys(this.effectiveHealDist).forEach((spell) => {
      eOHD[spell] = this.effectiveOverhealDist[spell] / (this.effectiveHealDist[spell] + this.effectiveOverhealDist[spell]);
    });

    // Since JS objects lack order, we need to convert our dictionary to an array
    // to allow for it be ordered for display
    const eHDPArray = Object.keys(eHDPerc).map(spell => [spell, eHDPerc[spell], eOHD[spell]]);
    eHDPArray.sort((o1, o2) => o2[1] - o1[1]);

    this.effectiveHealDistPerc = eHDPArray;
  }

  on_byPlayer_applybuff(event) {
    const spellId = event.ability.guid;
    const tId = event.targetID;
    if (spellId !== SPELLS.ECHO_OF_LIGHT.id) {
      return;
    }

    this._masteryActive[tId] = true;
  }

  on_byPlayer_removebuff(event) {
    const spellId = event.ability.guid;
    const tId = event.targetID;
    if (spellId !== SPELLS.ECHO_OF_LIGHT.id) {
      return;
    }

    this._masteryActive[tId] = false;
    this._healValByTargetId[tId] = {};
    this._maxHealVal[tId] = {};
  }

  on_byPlayer_heal(event) {
    const spellId = event.ability.guid;
    const tId = event.targetID;
    if (spellId === SPELLS.ECHO_OF_LIGHT.id) {
      // logic for eol itself
      this.healing += (event.amount + (event.absorbed || 0));
      this.effectiveHealDist = this.effectiveHealDist || {};

      const percH = (event.amount + (event.absorbed || 0)) / (event.amount + (event.absorbed || 0) + (event.overheal || 0));
      const tickMode = this._tickMode[tId];


      if (this._healValByTargetId[tId] === undefined) {
        // If we have a spell that triggers Echo of Light, but is not known of in CONSTANTS.js, then we
        // will potentially end up with a situation where that EoL ticks but there is nothing stored in the
        // EoL data table. This fixes that issue.
        return;
      }

      Object.keys(this._healValByTargetId[tId]).forEach((spell) => {
        // For potential future Features //
        // if (spell in this._eHDbyPlayer[tId]) {
        //   this._eHDbyPlayer[tId][spell] += this._maxHealVal[tId][spell] * percOH / tickMode;
        // } else {
        //   this._eHDbyPlayer[tId][spell] = this._maxHealVal[tId][spell] * percOH / tickMode;
        // }
        // ----------------------------- //

        if (this.effectiveHealDist[spell] !== undefined) {
          this.effectiveHealDist[spell] += (this._maxHealVal[tId][spell]) * percH / tickMode;
          this.effectiveOverhealDist[spell] += (this._maxHealVal[tId][spell]) * (1 - percH) / tickMode;
        } else {
          this.effectiveHealDist[spell] = (this._maxHealVal[tId][spell]) * percH / tickMode;
          this.effectiveOverhealDist[spell] = (this._maxHealVal[tId][spell]) * (1 - percH) / tickMode;
        }

        this._healValByTargetId[tId][spell] -= (this._maxHealVal[tId][spell] / tickMode);

        // There's a rare issue that can cause the healVal allocation to dip to a negative value
        // I'm not sure of the cause but it seems like it is due to an incorrect tickMode
        // value. Likely something to do with events on the same timestamp (or just some bad
        // logic in this file) but the value is much more accurate with this tweak
        if (this._healValByTargetId[tId][spell] < 0) {
          this._healValByTargetId[tId][spell] = 0;
        }
      });
    } else {
      // logic for eol triggering spells
      if (!ABILITIES_THAT_TRIGGER_MASTERY.includes(spellId)) {
        return;
      }

      if (this._masteryActive[tId]) {
        this._tickMode[tId] = 3;
      } else {
        this._tickMode[tId] = 2;
      }

      if (this._healValByTargetId[tId] === undefined) {
        this._healValByTargetId[tId] = {};
      }

      if (this._maxHealVal[tId] === undefined) {
        this._maxHealVal[tId] = {};
      }

      let effectiveHealing = event.amount + (event.absorbed || 0) + (event.overheal || 0);
      if (spellId === SPELLS.RENEW.id) {
        // due to renew only applying off of initial tick and not from periodic ticks
        // and both of them having identical spell IDs, I chose to negate renew's mastery
        // value since the current meta leads us towards never hard-casting renew anyway
        // which means the mastery value for renew would be miniscule anyway. We uninclude
        // the value in output for this reason as well.

        // (but I want to include it anyway, that way I can get the "unknown spell" warning to
        //  work optimally and let users report unknown spells)

        effectiveHealing = 0;
      }

      if (this._healValByTargetId[tId][spellId] === undefined) {
        this._healValByTargetId[tId][spellId] = effectiveHealing;
      } else {
        this._healValByTargetId[tId][spellId] += effectiveHealing;
      }
      this._maxHealVal[tId][spellId] = this._healValByTargetId[tId][spellId];
    }
  }

  statistic() {
    const percOfTotalHealingDone = this.owner.getPercentageOfTotalHealingDone(this.healing);
    return (
      <ExpandableStatisticBox
        icon={<SpellIcon id={SPELLS.ECHO_OF_LIGHT.id} />}
        value={`${formatNumber(this.healing)}`}
        label={(
          <dfn data-tip={`Echo of Light healing breakdown. As our mastery is often very finicky, this could end up wrong in various situations. Please report any logs that seem strange to @enragednuke on the WoWAnalyzer discord.<br/><br/>
            <strong>Please do note this is not 100% accurate.</strong> It is probably around 90% accurate. <br/><br/>
            Also, a mastery value can be more than just "healing done times mastery percent" because Echo of Light is based off raw healing. If the heal itself overheals, but the mastery does not, it can surpass that assumed "limit". Don't use this as a reason for a "strange log" unless something is absurdly higher than its effective healing.`}
          >
            Echo of Light
          </dfn>
        )}
      >
        <div>
          Values under 1% of total (and Renew) are omitted.
        </div>
        <table className="table table-condensed">
          <thead>
            <tr>
              <th>Spell</th>
              <th>Amount</th>
              <th>% of Total</th>
              <th>% OH</th>
            </tr>
          </thead>
          <tbody>
            {
              this.effectiveHealDistPerc
                .filter(item => (percOfTotalHealingDone * item[1]) > 0.01)
                .map((item, index) => (
                  <tr key={index}>
                    <th scope="row"><SpellIcon id={item[0]} style={{ height: '2.4em' }} /></th>
                    <td>{formatNumber(this.healing * item[1])}</td>
                    <td>{formatPercentage(percOfTotalHealingDone * item[1])}%</td>
                    <td>{formatPercentage(item[2])}%</td>
                  </tr>
                ))
            }

          </tbody>
        </table>
      </ExpandableStatisticBox>
    );
  }

  statisticOrder = STATISTIC_ORDER.CORE(2);
}

export default MasteryBreakdown;
