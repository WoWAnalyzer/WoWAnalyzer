import React from 'react';
import ItemLink from 'common/ItemLink';
import SpellLink from 'common/SpellLink';
import Analyzer from 'Parser/Core/Analyzer';
import ITEMS from 'common/ITEMS';
import SPELLS from 'common/SPELLS';
import Combatants from 'Parser/Core/Modules/Combatants';
import Wrapper from 'common/Wrapper';
import { formatNumber } from 'common/format';

class TheEmeraldDreamcatcher extends Analyzer {
  static dependencies = {
    combatants: Combatants,
  };

  dreamcatcherBuffDropped = 0;
  totalCasts = 0;
  discounts = 0;

  isEDBuff(event) {
    const spellId = event.ability.guid;
    return spellId === SPELLS.THE_EMERALD_DREAMCATCHER.id;
  }

  on_initialized() {
    this.active = this.combatants.selected.hasHead(ITEMS.THE_EMERALD_DREAMCATCHER.id);
  }

  on_toPlayer_removebuff(event) {
    if (event.ability.guid === SPELLS.THE_EMERALD_DREAMCATCHER.id) {
      this.dreamcatcherBuffDropped++;
    }
  }
  on_byPlayer_cast(event) {
    if (event.ability.guid !== SPELLS.STARSURGE_MOONKIN.id){
      return;
    } 
    this.totalCasts++;
    const buff = this.combatants.selected.getBuff(SPELLS.THE_EMERALD_DREAMCATCHER.id);
    if (buff){
      this.discounts += buff.stacks;
    }
  }

  get buffDropped(){
    return this.dreamcatcherBuffDropped;
  }

  get buffDropsPerMinute(){
    return this.dreamcatcherBuffDropped / this.owner.fightDuration * 1000 * 60;
  }

  get averageDiscount(){
    return this.discounts / this.totalCasts * 5;
  }

  get suggestionThresholds() {
    return {
      actual: this.buffDropsPerMinute,
      isGreaterThan: {
        minor: 0,
        average: 1,
        major: 2,
      },
      style: 'number',
    };
  }
  
  suggestions(when) {
    when(this.suggestionThresholds).addSuggestion((suggest, actual, recommended) => {
      return suggest(<Wrapper>You dropped the <ItemLink id={ITEMS.THE_EMERALD_DREAMCATCHER.id} /> buff {actual.toFixed(2)} times per minute. Try to keep it up at all times. For more information consult <a href='http://goo.gl/mH8NVj' target='_blank' rel='noopener noreferrer'>the guide on ED usage</a>.</Wrapper>)
        .icon(ITEMS.THE_EMERALD_DREAMCATCHER.icon)
        .actual(`${actual.toFixed(2)} buffs dropped times per minute`)
        .recommended(`>${actual.toFixed(2)} is recommended`);
    });
  }

  item() {
    return {
      item: ITEMS.THE_EMERALD_DREAMCATCHER,
      result: (
        <dfn
          data-tip={`
            You dropped the buff ${this.buffDropped} times over the duration of the encounter.
          `}
        >
          <Wrapper>Average <SpellLink id={SPELLS.STARSURGE_MOONKIN.id}/> cast reduced by {this.averageDiscount.toFixed(2)}</Wrapper>
        </dfn>
      ),
    };
  }

}

export default TheEmeraldDreamcatcher;
