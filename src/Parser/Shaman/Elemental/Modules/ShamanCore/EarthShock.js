import React from 'react';

import ITEMS from 'common/ITEMS';
import SPELLS from 'common/SPELLS';
import SpellIcon from 'common/SpellIcon';
import SpellLink from 'common/SpellLink';
import ItemLink from 'common/ItemLink';
import RESOURCE_TYPES from 'common/RESOURCE_TYPES';

import Analyzer from 'Parser/Core/Analyzer';
import Combatants from 'Parser/Core/Modules/Combatants';
import Enemies from 'Parser/Core/Modules/Enemies';

import StatisticBox, { STATISTIC_ORDER } from 'Main/StatisticBox';
import { formatNumber } from 'common/format';

class EarthShock extends Analyzer {
  static dependencies = {
    enemies: Enemies,
    combatants: Combatants,
  };

  maelstromSpend = [];
  maelstromSpendInAscendence = [];
  latershock=false;

  on_initialized() {
    this.active = (this.combatants.selected.hasHands(ITEMS.SMOLDERING_HEART.id) && this.combatants.selected.hasFeet(ITEMS.THE_DECEIVERS_BLOOD_PACT.id));
  }

  get avgMaelstromSpend() {
    let spend = this.maelstromSpend.reduce((prev, cur) => {
      return prev + cur;
    }, 0);
    spend /= this.maelstromSpend.length || 1;
    return spend;
  }

  on_byPlayer_cast(event) {
    if (event.ability.guid === SPELLS.EARTH_SHOCK.id && !this.latershock) {
      this.latershock=true;
      if (event.classResources[0].type === RESOURCE_TYPES.MAELSTROM.id){
          if (this.combatants.selected.hasBuff(SPELLS.ASCENDANCE_TALENT_ELEMENTAL.id)) {
            this.maelstromSpendInAscendence.push(event.classResources[0].amount);
          }
          else {
            this.maelstromSpend.push(event.classResources[0].amount);
          }
        }
    }
    if(event.classResources[0].amount < 40 && event.classResources[0].type === RESOURCE_TYPES.MAELSTROM.id) {
      this.latershock=false;
    }
  }

  suggestions(when) {
    if (true) {
      when(Math.abs((70+85)/2-this.avgMaelstromSpend)).isGreaterThan(12.5)
        .addSuggestion((suggest, actual, recommended) => {
          return suggest(<span>Try to cast <SpellLink id={SPELLS.EARTH_SHOCK.id} /> at 70 to 85 Maelstrom when using 
          <ItemLink id={ITEMS.SMOLDERING_HEART.id} /> and <ItemLink id={ITEMS.THE_DECEIVERS_BLOOD_PACT.id} /> together. 
          <SpellLink id={SPELLS.AFTERSHOCK_TALENT.id} /> causes procs from <ItemLink id={ITEMS.THE_DECEIVERS_BLOOD_PACT.id} />  to <em>generate</em> Maelstrom.
          Casting at 70 to 85 Maelstrom allows for a buffer to avoid Maelstrom overflow on chained <ItemLink id={ITEMS.THE_DECEIVERS_BLOOD_PACT.id} />  procs.</span>)
            .icon(SPELLS.EARTH_SHOCK.icon)
            .actual(`Average Maelstrom spent: ${formatNumber(this.avgMaelstromSpend)}`)
            .recommended(`70 to 85 is recommended`)
            .regular(5).major(15);
        });
    }
  }

  statistic() {
    return (
      <StatisticBox
        icon={<SpellIcon id={SPELLS.EARTH_SHOCK.id} />}
        value={`${formatNumber(this.avgMaelstromSpend)}`}
        label="Average Maelstrom spent"
      />
    );
  }
  statisticOrder = STATISTIC_ORDER.OPTIONAL();
}

export default EarthShock;