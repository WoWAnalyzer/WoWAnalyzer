import React from 'react';

import Analyzer from 'Parser/Core/Analyzer';
import SPELLS from 'common/SPELLS';
import SpellLink from 'common/SpellLink';
import SpellIcon from 'common/SpellIcon';
import { formatPercentage } from 'common/format';
import StatisticBox, { STATISTIC_ORDER } from 'Main/StatisticBox';
import Combatants from 'Parser/Core/Modules/Combatants';
import { SPELLS_WHICH_REMOVE_BOC } from '../../Constants';

const debug = false;
const BOC_DURATION = 15000;

class BlackoutCombo extends Analyzer {
  static dependencies = {
    combatants: Combatants,
  }

  blackoutComboConsumed = 0;
  blackoutComboBuffs = 0;
  lastBlackoutComboCast = 0;
  spellsBOCWasUsedOn = {};

  get dpsWasteThreshold() {
    if(!this.active) {
      return null;
    }
    return {
      actual: this.spellsBOCWasUsedOn[SPELLS.TIGER_PALM.id] / this.blackoutComboBuffs,
      isLessThan: {
        minor: 0.95,
        average: 0.9,
        major: 0.85,
      },
      style: 'percentage',
    };
  }

  on_initialized() {
    this.active = this.combatants.selected.hasTalent(SPELLS.BLACKOUT_COMBO_TALENT.id);
  }

  on_byPlayer_applybuff(event) {
    const spellId = event.ability.guid;
    if (spellId === SPELLS.BLACKOUT_COMBO_BUFF.id) {
      debug && console.log('Blackout combo applied');
      this.blackoutComboBuffs += 1;
      this.lastBlackoutComboCast = event.timestamp;
    }
  }

  on_byPlayer_refreshbuff(event) {
    const spellId = event.ability.guid;
    if (spellId === SPELLS.BLACKOUT_COMBO_BUFF.id) {
      debug && console.log('Blackout combo refreshed');
      this.blackoutComboBuffs += 1;
      this.lastBlackoutComboCast = event.timestamp;
    }
  }

  on_byPlayer_cast(event) {
    const spellId = event.ability.guid;
    if (SPELLS_WHICH_REMOVE_BOC.indexOf(spellId) === -1) {
      return;
    }
    // BOC should be up
    if (this.lastBlackoutComboCast > 0 && this.lastBlackoutComboCast + BOC_DURATION > event.timestamp) {
      this.blackoutComboConsumed += 1;
      if (this.spellsBOCWasUsedOn[spellId] === undefined) {
        this.spellsBOCWasUsedOn[spellId] = 0;
      }
      this.spellsBOCWasUsedOn[spellId] += 1;
    }
    this.lastBlackoutComboCast = 0;
  }

  suggestions(when) {
    const wastedPerc = (this.blackoutComboBuffs - this.blackoutComboConsumed) / this.blackoutComboBuffs;

    when(wastedPerc).isGreaterThan(0.1)
      .addSuggestion((suggest, actual, recommended) => {
        return suggest(<span>You wasted {formatPercentage(actual)}% of your <SpellLink id={SPELLS.BLACKOUT_COMBO_BUFF.id} /> procs. Try to use the procs as soon as you get them so they are not overwritten.</span>)
          .icon(SPELLS.BLACKOUT_COMBO_BUFF.icon)
          .actual(`${formatPercentage(actual)}% unused`)
          .recommended(`${Math.round(formatPercentage(recommended))}% or less is recommended`)
          .regular(recommended + 0.1).major(recommended + 0.2);
      });
  }

  statistic() {
    const wastedPerc = (this.blackoutComboBuffs - this.blackoutComboConsumed) / this.blackoutComboBuffs;

    return (
      <StatisticBox
        icon={<SpellIcon id={SPELLS.BLACKOUT_COMBO_BUFF.id} />}
        value={`${formatPercentage(wastedPerc)}%`}
        label="Wasted blackout combo"
        tooltip={`You got total <b>${this.blackoutComboBuffs}</b> blackout combo procs procs and used <b>${this.blackoutComboConsumed}</b> of them.

        Blackout combo buff usage:
          <ul>
            ${Object.keys(this.spellsBOCWasUsedOn)
            .sort((a, b) => this.spellsBOCWasUsedOn[b] - this.spellsBOCWasUsedOn[a])
            .map(type => `<li><i>${SPELLS[type].name || 'Unknown'}</i> was used ${this.spellsBOCWasUsedOn[type]} time${this.spellsBOCWasUsedOn[type] === 1 ? '' : 's'} (${formatPercentage(this.spellsBOCWasUsedOn[type] / this.blackoutComboConsumed)}%)</li>`)
            .join('')}
          </ul>`}
      />
    );
  }
  statisticOrder = STATISTIC_ORDER.OPTIONAL();
}

export default BlackoutCombo;
