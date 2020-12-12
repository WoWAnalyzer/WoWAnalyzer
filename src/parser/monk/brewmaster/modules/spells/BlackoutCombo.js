import React from 'react';

import Analyzer, { SELECTED_PLAYER } from 'parser/core/Analyzer';
import SPELLS from 'common/SPELLS';
import SpellLink from 'common/SpellLink';
import SpellIcon from 'common/SpellIcon';
import { formatPercentage } from 'common/format';
import STATISTIC_ORDER from 'interface/others/STATISTIC_ORDER';
import Statistic from 'interface/statistics/Statistic';
import BoringValue from 'interface/statistics/components/BoringValueText';
import { t } from '@lingui/macro';

import Events from 'parser/core/Events';

import { SPELLS_WHICH_REMOVE_BOC } from '../../constants';

const debug = false;
const BOC_DURATION = 15000;

class BlackoutCombo extends Analyzer {
  get dpsWasteThreshold() {
    if (!this.active) {
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

  blackoutComboConsumed = 0;
  blackoutComboBuffs = 0;
  lastBlackoutComboCast = 0;
  spellsBOCWasUsedOn = {};
  statisticOrder = STATISTIC_ORDER.OPTIONAL();

  constructor(...args) {
    super(...args);
    this.active = this.selectedCombatant.hasTalent(SPELLS.BLACKOUT_COMBO_TALENT.id);
    this.addEventListener(Events.applybuff.by(SELECTED_PLAYER).spell(SPELLS.BLACKOUT_COMBO_BUFF), this.onApplyBuff);
    this.addEventListener(Events.refreshbuff.by(SELECTED_PLAYER).spell(SPELLS.BLACKOUT_COMBO_BUFF), this.onRefreshBuff);
    this.addEventListener(Events.cast.by(SELECTED_PLAYER).spell(SPELLS_WHICH_REMOVE_BOC), this.onCast);
  }

  onApplyBuff(event) {
    debug && console.log('Blackout combo applied');
    this.blackoutComboBuffs += 1;
    this.lastBlackoutComboCast = event.timestamp;
  }

  onRefreshBuff(event) {
    debug && console.log('Blackout combo refreshed');
    this.blackoutComboBuffs += 1;
    this.lastBlackoutComboCast = event.timestamp;
  }

  onCast(event) {
    const spellId = event.ability.guid;
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
      .addSuggestion((suggest, actual, recommended) => suggest(<span>You wasted {formatPercentage(actual)}% of your <SpellLink id={SPELLS.BLACKOUT_COMBO_BUFF.id} /> procs. Try to use the procs as soon as you get them so they are not overwritten.</span>)
        .icon(SPELLS.BLACKOUT_COMBO_BUFF.icon)
        .actual(t({
      id: "monk.brewmaster.suggestions.blackoutCombo.wasted",
      message: `${formatPercentage(actual)}% unused`
    }))
        .recommended(`${Math.round(formatPercentage(recommended))}% or less is recommended`)
        .regular(recommended + 0.1).major(recommended + 0.2));
  }

  statistic() {
    const wastedPerc = (this.blackoutComboBuffs - this.blackoutComboConsumed) / this.blackoutComboBuffs;

    return (
      <Statistic
        position={STATISTIC_ORDER.OPTIONAL()}
        size="flexible"
        tooltip={(
          <>
            You got total <strong>{this.blackoutComboBuffs}</strong> Blackout Combo procs and used <strong>{this.blackoutComboConsumed}</strong> of them.<br />
            Blackout combo buff usage:
            <ul>
              {Object.keys(this.spellsBOCWasUsedOn)
                .sort((a, b) => this.spellsBOCWasUsedOn[b] - this.spellsBOCWasUsedOn[a])
                .map(type => (
                  <li key={type}><em>{SPELLS[type].name || 'Unknown'}</em> was used {this.spellsBOCWasUsedOn[type]} time{this.spellsBOCWasUsedOn[type] === 1 ? '' : 's'} ({formatPercentage(this.spellsBOCWasUsedOn[type] / this.blackoutComboConsumed)}%)</li>),
                )}
            </ul>
          </>
        )}
      >
        <BoringValue label={<><SpellIcon id={SPELLS.BLACKOUT_COMBO_BUFF.id} /> Wasted Blackout Combo</>}>
          <>
            {formatPercentage(wastedPerc)}%
          </>
        </BoringValue>
      </Statistic>
    );
  }
}

export default BlackoutCombo;
