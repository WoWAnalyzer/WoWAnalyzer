import React from 'react';
import { formatPercentage } from 'common/format';
import SpellIcon from 'common/SpellIcon';
import SpellLink from 'common/SpellLink';
import StatisticBox, { STATISTIC_ORDER } from 'Main/StatisticBox';
import Module from 'Parser/Core/Module';
import ITEMS from 'common/ITEMS';
import SPELLS from 'common/SPELLS';
import Combatants from 'Parser/Core/Modules/Combatants';

class EmeraldDreamcatcher extends Module {
  static dependencies = {
    combatants: Combatants,
  };

  isEDBuff(event) {
    const spellId = event.ability.guid;
    return spellId === SPELLS.ED_BUFF.id;
  }

  on_initialized() {
    this.active = this.combatants.selected.hasHead(ITEMS.EMERALD_DREAMCATCHER.id);
  }

  dreamcatcherBuffDropped = 0;
  lastEDDropTime = 0;

  on_toPlayer_removebuff(event) {
    if (!this.isEDBuff(event)) { return; }

    if (event.timestamp !== this.lastEDDropTime){
        this.dreamcatcherBuffDropped++;
        this.lastEDDropTime = event.timestamp;
    }
  }

  on_finished() {
    
  }

  suggestions(when) {
    const buffDropsPerMinute = (this.dreamcatcherBuffDropped * 60) / (this.owner.fightDuration * 1000);

    when(buffDropsPerMinute).isGreaterThan(0)
      .addSuggestion((suggest, actual, recommended) => {
        return suggest(<span> You shouldnt drop your <SpellLink id={SPELLS.ED_BUFF.id} /> at any time, </span>)
          .icon(SPELLS.MOONFIRE_BEAR.icon)
          .actual(`${actual} times the buff dropped`)
          .recommended(`${recommended} times is recommended`)
          .regular(recommended + 0.6).major(recommended + 1);
      });
  }

  statistic() {
    return (
      <StatisticBox
        icon={<SpellIcon id={SPELLS.MOONFIRE_BEAR.id} />}
        value={`${this.dreamcatcherBuffDropped}`}
        label="ED buff dropped"
      />
    );
  }
  statisticOrder = STATISTIC_ORDER.CORE(6);
}

export default EmeraldDreamcatcher;
