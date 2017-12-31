import React from 'react';
import SpellIcon from 'common/SpellIcon';
import SpellLink from 'common/SpellLink';
import StatisticBox, { STATISTIC_ORDER } from 'Main/StatisticBox';
import Analyzer from 'Parser/Core/Analyzer';
import ITEMS from 'common/ITEMS';
import SPELLS from 'common/SPELLS';
import Combatants from 'Parser/Core/Modules/Combatants';

class TheEmeraldDreamcatcher extends Analyzer {
  static dependencies = {
    combatants: Combatants,
  };

  isEDBuff(event) {
    const spellId = event.ability.guid;
    return spellId === SPELLS.THE_EMERALD_DREAMCATCHER_BUFF.id;
  }

  on_initialized() {
    this.active = this.combatants.selected.hasHead(ITEMS.THE_EMERALD_DREAMCATCHER.id);
  }

  dreamcatcherBuffDropped = 0;

  on_toPlayer_removebuff(event) {
    if (this.isEDBuff(event)) {
      this.dreamcatcherBuffDropped++;
    }
  }

  suggestions(when) {
    const buffDropsPerMinute = Math.round((((this.dreamcatcherBuffDropped) / (this.owner.fightDuration / 1000)) * 60)*10) / 10;

    when(buffDropsPerMinute).isGreaterThan(0)
      .addSuggestion((suggest, actual, recommended) => {
        return suggest(<span> You dropped the <SpellLink id={SPELLS.THE_EMERALD_DREAMCATCHER_BUFF.id} /> buff {this.dreamcatcherBuffDropped} times. Try to keep it up at all times. For more information consult <a href='http://goo.gl/mH8NVj' target='_blank' rel='noopener noreferrer'>the guide on ED usage</a>.</span>)
          .icon(SPELLS.THE_EMERALD_DREAMCATCHER_BUFF.icon)
          .actual(`The buff dropped ${actual} times per minute`)
          .recommended(`${recommended} times per minute is recommended`)
          .regular(recommended + 1).major(recommended + 1.5);
      });
  }

  statistic() {
    return (
      <StatisticBox
        icon={<SpellIcon id={SPELLS.THE_EMERALD_DREAMCATCHER_BUFF.id} />}
        value={this.dreamcatcherBuffDropped}
        label="Times ED buff dropped"
      />
    );
  }
  statisticOrder = STATISTIC_ORDER.CORE(11);
}

export default TheEmeraldDreamcatcher;
