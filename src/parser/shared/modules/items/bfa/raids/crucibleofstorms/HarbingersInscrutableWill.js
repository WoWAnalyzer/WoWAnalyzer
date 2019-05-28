import React from 'react';

import { formatNumber, formatDuration, formatPercentage } from 'common/format';

import SPELLS from 'common/SPELLS/index';
import ITEMS from 'common/ITEMS/index';

import Analyzer, { SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events from 'parser/core/Events';
import ItemStatistic from 'interface/statistics/ItemStatistic';
import ItemDamageDone from 'interface/others/ItemDamageDone';
import BoringItemValueText from 'interface/statistics/components/BoringItemValueText';
import UptimeIcon from 'interface/icons/Uptime';
import { TooltipElement } from 'common/Tooltip';
import ItemLink from 'common/ItemLink';
import SpellLink from 'common/SpellLink';

//Example Log: https://www.warcraftlogs.com/reports/KkB8jL1HpwxV7NtT#fight=4&source=136

class HarbingersInscrutableWill extends Analyzer {

  hits = 0;
  silences = 0;
  damage = 0;

  constructor(...args) {
    super(...args);
    this.active = this.selectedCombatant.hasTrinket(ITEMS.HARBINGERS_INSCRUTABLE_WILL.id);
    if(!this.active) {
      return;
    }
    this.addEventListener(Events.damage.by(SELECTED_PLAYER).spell(SPELLS.OBLIVION_SPEAR_DAMAGE), this._damage);
    this.addEventListener(Events.applydebuff.to(SELECTED_PLAYER).spell(SPELLS.OBLIVION_SPEAR_SILENCE), this._silence);
  }

  _damage(event) {
    this.hits += 1;
    this.damage += (event.amount || 0) + (event.absorbed || 0);
  }

  _silence(event) {
    this.silences += 1;
  }

  get silenceUptime() {
    return this.selectedCombatant.getBuffUptime(SPELLS.OBLIVION_SPEAR_SILENCE.id);
  }

  statistic() {
    return (
      <ItemStatistic
        size="flexible"
      >
        <BoringItemValueText item={ITEMS.HARBINGERS_INSCRUTABLE_WILL}>
          <TooltipElement content={`Damage done: ${formatNumber(this.damage)}`}>
            <ItemDamageDone amount={this.damage} />
          </TooltipElement>
          <TooltipElement content={`Silenced ${this.silences} time${this.silences !== 1 && 's'}`}>
            <UptimeIcon /> {(this.silenceUptime / 1000).toFixed(0)} s <small>spent silenced</small>
          </TooltipElement>
        </BoringItemValueText>
      </ItemStatistic>
    );
  }

  get suggestedSilences() {
    return {
      actual: this.silences / this.hits,
      isGreaterThanOrEqual: {
        minor: 0.10,
        average: 0.20,
        major: 0.25,
      },
      style: 'number',
    };
  }

  suggestions(when) {
    when(this.suggestedSilences).addSuggestion((suggest, actual, recommended) => {
      return suggest(
        <>
          You are getting silenced by <SpellLink id={SPELLS.OBLIVION_SPEAR_SILENCE.id} />. Try to dodge <ItemLink id={ITEMS.HARBINGERS_INSCRUTABLE_WILL.id} />'s spears to avoid the silence.
        </>
      )
        .icon(ITEMS.HARBINGERS_INSCRUTABLE_WILL.icon)
        .actual(`You got silenced by ${formatPercentage(actual)}% of spears.`)
        .recommended(`<10% is recommended`);
    });
  }

}

export default HarbingersInscrutableWill;
