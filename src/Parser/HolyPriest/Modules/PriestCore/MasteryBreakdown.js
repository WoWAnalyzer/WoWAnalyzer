import React from 'react';
import { STATISTIC_ORDER } from 'Main/StatisticBox';
import ExpandableStatisticBox from 'Main/ExpandableStatisticBox';
import SpellIcon from 'common/SpellIcon';
import { formatPercentage, formatNumber } from 'common/format';

// dependencies
import Combatants from 'Parser/Core/Modules/Combatants';

import SPELLS from 'common/SPELLS';
import Module from 'Parser/Core/Module';
import { ABILITIES_THAT_TRIGGER_MASTERY } from '../../Constants';

class MasteryBreakdown extends Module {
  static dependencies = {
    combatants: Combatants,
  }

  _tickMode = {};
  _healVal = {};
  _maxHealVal = {};
  _masteryActive = {};
  effectiveHealDist = {};
  _eHDbyPlayer = {}; // for potential future features

  healing = 0;

  effectiveHealDistPerc = [];

  on_finished() {
    // There's likely a far better way to do this, but my 2AM brain couldn't find it
    let total = 0;

    let spell;
    for (spell in this.effectiveHealDist) {
      total += this.effectiveHealDist[spell];
    }

    const eHDPerc = {};
    for (spell in this.effectiveHealDist) {
      eHDPerc[spell] = this.effectiveHealDist[spell] / total;
    }

    console.log(eHDPerc);
    // Since JS objects lack order, we need to convert our dictionary to an array
    // to allow for it be ordered for display
    const eHDPArray = Object.keys(eHDPerc).map(function(spell) {
      return [spell, eHDPerc[spell]];
    });
    eHDPArray.sort(function(o1, o2) {
      return o2[1] - o1[1];
    });

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
    this._healVal[tId] = {};
    this._maxHealVal[tId] = {};
  }

  on_byPlayer_heal(event) {
    const spellId = event.ability.guid;
    const tId = event.targetID;
    if (spellId === SPELLS.ECHO_OF_LIGHT.id) {
      // logic for eol itself
      this.healing += event.amount;

      const percOH = event.amount / (event.amount + (event.overheal || 0));
      const tickMode = this._tickMode[tId];

      let spell;
      for (spell in this._healVal[tId]) {
        this.effectiveHealDist = this.effectiveHealDist || {};
        this._eHDbyPlayer[tId] = this._eHDbyPlayer[tId] || {};

        // For potential future Features //
        if (spell in this._eHDbyPlayer[tId]) {
          this._eHDbyPlayer[tId][spell] += this._maxHealVal[tId][spell] * percOH / tickMode;
        } else {
          this._eHDbyPlayer[tId][spell] = this._maxHealVal[tId][spell] * percOH / tickMode;
        }
        // ----------------------------- //

        //console.log(this._maxHealVal[tId]);
        if (spell in this.effectiveHealDist) {
          this.effectiveHealDist[spell] += this._maxHealVal[tId][spell] * percOH / tickMode;
        } else {
          this.effectiveHealDist[spell] = this._maxHealVal[tId][spell] * percOH / tickMode;
        }

        this._healVal[tId][spell] -= (this._maxHealVal[tId][spell] / tickMode);

      }

    } else {
      // logic for eol triggering spells
      if (ABILITIES_THAT_TRIGGER_MASTERY.indexOf(spellId) === -1) {
        return;
      }

      if(this._masteryActive[tId]) {
        this._tickMode[tId] = 3;
      } else {
        this._tickMode[tId] = 2;
      }

      if(!(tId in this._healVal)) {
        this._healVal[tId] = {};
      }

      if(!(tId in this._maxHealVal)) {
        this._maxHealVal[tId] = {};
      }

      if(!(spellId in this._healVal[tId])) {
        this._healVal[tId][spellId] = event.amount;
      } else {
        this._healVal[tId][spellId] += event.amount;
      }
      this._maxHealVal[tId][spellId] = this._healVal[tId][spellId];
    }
  }

  statistic() {
    return (
      <ExpandableStatisticBox
        icon={<SpellIcon id={SPELLS.ECHO_OF_LIGHT.id} />}
        value={`${formatNumber(this.healing)}`}
        label={(
          <dfn data-tip={``}>
            Echo of Light
          </dfn>
        )}
      >
        <table className="table table-condensed">
          <thead>
            <tr>
              <th>Spell</th>
              <th>Amount</th>
              <th>% of EoL</th>
              <th>% of Total</th>
            </tr>
          </thead>
          <tbody>
            {
              this.effectiveHealDistPerc
                .map((item, index) => (
                  <tr key={index}>
                    <th scope="row"><SpellIcon id={item[0]} style={{ height: '2.4em' }}/></th>
                    <td>{ formatNumber(this.healing * item[1]) }</td>
                    <td>{ formatPercentage(item[1]) }%</td>
                    <td>{ formatPercentage(this.owner.getPercentageOfTotalHealingDone(this.healing) * item[1]) }%</td>
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
