import React from 'react';

import Module from 'Parser/Core/Module';
import SPELLS from 'common/SPELLS';
import SpellLink from 'common/SpellLink';
import SpellIcon from 'common/SpellIcon';
import { formatPercentage } from 'common/format';
import StatisticBox, { STATISTIC_ORDER } from 'Main/StatisticBox';
import { SPELLS_WHICH_REMOVE_BOC } from '../../Constants';

const debug = false;
const BOC_DURATION = 15000;

class BlackoutCombo extends Module {
  blackoutComboConsumed = 0;
  blackoutComboWasted = 0;
  blackoutComboBuffs = 0;
  lastBlackoutComboCast = 0;

  on_initialized() {
    this.active = this.owner.selectedCombatant.hasTalent(SPELLS.BLACKOUT_COMBO_TALENT.id);
  }
  
  on_byPlayer_applybuff(event) {
    const spellId = event.ability.guid;
    if (SPELLS.BLACKOUT_COMBO_BUFF.id === spellId) {
      debug && console.log('Blackout combo applied');
      this.blackoutComboBuffs++;
      this.lastBlackoutComboCast = event.timestamp;
    }
  }

  on_byPlayer_refreshbuff(event) {
    const spellId = event.ability.guid;
    if (SPELLS.BLACKOUT_COMBO_BUFF.id === spellId) {
      debug && console.log('Blackout combo refreshed');
      this.blackoutComboBuffs++;
      this.blackoutComboWasted++;
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
      this.blackoutComboConsumed++;
    }
    this.lastBlackoutComboCast = 0;
  }

  suggestions(when) {
    const wastedPerc = this.blackoutComboWasted / this.blackoutComboBuffs;
    
    when(wastedPerc).isGreaterThan(0.3)
      .addSuggestion((suggest, actual, recommended) => {
        return suggest(<span>You wasted {formatPercentage(actual)}% of your <SpellLink id={SPELLS.BLACKOUT_COMBO_BUFF.id} /> procs. Try to use the procs as soon as you get them so they are not overwritten.</span>)
          .icon(SPELLS.BLACKOUT_COMBO_BUFF.icon)
          .actual(`${formatPercentage(actual)}% unused`)
          .recommended(`${Math.round(formatPercentage(recommended))}% or less is recommended`)
          .regular(recommended + 0.15).major(recommended + 0.3);
      });
  }

  statistic() {
    const wastedPerc = this.blackoutComboWasted / this.blackoutComboBuffs;
    
    return (
      <StatisticBox
        icon={<SpellIcon id={SPELLS.BLACKOUT_COMBO_BUFF.id} />}
        value={`${formatPercentage(wastedPerc)}%`}
        label='Wasted blackout combo'
        tooltip={`You got total <b>${this.blackoutComboBuffs}</b> blackout combo procs procs and used <b>${this.blackoutComboConsumed}</b> of them.`}
      />
    );
  }
  statisticOrder = STATISTIC_ORDER.OPTIONAL();
}

export default BlackoutCombo;
