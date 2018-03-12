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

  maelstromSpendOutAscendence = [];
  maelstromSpendInAscendence = [];
  latershock = false;
  gambling = false;
  active = false;

  on_initialized() {
    this.gambling = (this.combatants.selected.hasTalent(SPELLS.AFTERSHOCK_TALENT.id) && this.combatants.selected.hasHands(ITEMS.SMOLDERING_HEART.id) && this.combatants.selected.hasFeet(ITEMS.THE_DECEIVERS_BLOOD_PACT.id));
    this.pseudogambling = (this.combatants.selected.hasTalent(SPELLS.AFTERSHOCK_TALENT.id) && this.combatants.selected.hasShoulder(ITEMS.ECHOES_OF_THE_GREAT_SUNDERING.id) && this.combatants.selected.hasFeet(ITEMS.THE_DECEIVERS_BLOOD_PACT.id));
  }

  get avgMaelstromSpendOutOfAsc() {
    let spend = this.maelstromSpendOutAscendence.reduce((prev, cur) => prev + cur, 0);
    spend /= this.maelstromSpendOutAscendence.length || 1;
    return spend;
  }
  get avgMaelstromSpendInAsc() {
    let spend = this.maelstromSpendInAscendence.reduce((prev, cur) => prev + cur, 0);
    spend /= this.maelstromSpendInAscendence.length || 1;
    return spend;
  }

  on_byPlayer_cast(event) {
    if (event.ability.guid === SPELLS.EARTH_SHOCK.id && !this.latershock) {
      this.active = true;
      this.latershock = true;
      if (event.classResources[0].type === RESOURCE_TYPES.MAELSTROM.id) {
        if (this.combatants.selected.hasBuff(SPELLS.ASCENDANCE_TALENT_ELEMENTAL.id, event.timestamp)) {
          this.maelstromSpendInAscendence.push(event.classResources[0].amount);
        }
        else {
          this.maelstromSpendOutAscendence.push(event.classResources[0].amount);
        }
      }
    }
    if (!event.classResources) {
      return;
    }
    if (event.classResources[0].amount < 40 && (event.classResources[0].type === RESOURCE_TYPES.MAELSTROM.id)) {
      this.latershock = false;
    }
  }

  get inAscSuggestionThreshold() {
    return {
      actual: this.avgMaelstromSpendInAsc,
      isLessThan: {
        minor: 111,
        average: 105,
        major: 95,
      },
      style: 'number',
    };
  }

  get outAscSuggestionThreshold() {
    if (this.gambling) {
      return {
        actual: Math.abs(this.avgMaelstromSpendOutOfAsc - 77.5),
        isGreaterThan: {
          minor: 12.5,
          average: 17.5,
          major: 25,
        },
        style: 'number',
      };
    }
    else if (this.pseudogambling) {
      return {
        actual: Math.abs(this.avgMaelstromSpendOutOfAsc - 87.5),
        isGreaterThan: {
          minor: 12.5,
          average: 17.5,
          major: 25,
        },
        style: 'number',
      };
    }
    else {
      return {
        actual: this.avgMaelstromSpendOutOfAsc,
        isLessThan: {
          minor: 111,
          average: 100,
          major: 90,
        },
        style: 'number',
      };
    }
  }

  suggestions(when) {
    if (this.gambling && this.avgMaelstromSpendOutOfAsc > 0) {
      when(this.outAscSuggestionThreshold)
        .addSuggestion((suggest) => {
          return suggest(<span>Try to cast <SpellLink id={SPELLS.EARTH_SHOCK.id} /> at 70 to 85 Maelstrom when using
          <ItemLink id={ITEMS.SMOLDERING_HEART.id} /> and <ItemLink id={ITEMS.THE_DECEIVERS_BLOOD_PACT.id} /> together.
          <SpellLink id={SPELLS.AFTERSHOCK_TALENT.id} /> causes procs from <ItemLink id={ITEMS.THE_DECEIVERS_BLOOD_PACT.id} />  to <em>generate</em> Maelstrom.
          Casting at 70 to 85 Maelstrom allows for a buffer to avoid Maelstrom overflow on chained <ItemLink id={ITEMS.THE_DECEIVERS_BLOOD_PACT.id} />  procs.</span>)
            .icon(SPELLS.EARTH_SHOCK.icon)
            .actual(`Average Maelstrom spent: ${formatNumber(this.avgMaelstromSpendOutOfAsc)}`)
            .recommended(`70 to 85 is recommended`);
        });
    }
    else if (this.pseudogambling && this.avgMaelstromSpendOutOfAsc > 0) {
      when(this.outAscSuggestionThreshold)
        .addSuggestion((suggest) => {
          return suggest(<span>Try to cast <SpellLink id={SPELLS.EARTH_SHOCK.id} /> at 85 to 95 Maelstrom when using
          <ItemLink id={ITEMS.ECHOES_OF_THE_GREAT_SUNDERING.id} /> and <ItemLink id={ITEMS.THE_DECEIVERS_BLOOD_PACT.id} /> together.
          <SpellLink id={SPELLS.AFTERSHOCK_TALENT.id} /> causes procs from <ItemLink id={ITEMS.THE_DECEIVERS_BLOOD_PACT.id} />  to <em>generate</em> Maelstrom.
          Casting at 85 to 95 Maelstrom allows for a buffer to avoid Maelstrom overflow on chained <ItemLink id={ITEMS.THE_DECEIVERS_BLOOD_PACT.id} />  procs.</span>)
            .icon(SPELLS.EARTH_SHOCK.icon)
            .actual(`Average Maelstrom spent: ${formatNumber(this.avgMaelstromSpendOutOfAsc)}`)
            .recommended(`85 to 95 is recommended`);
        });
    }
    else {
      if (this.avgMaelstromSpendOutOfAsc > 0) {

        when(this.outAscSuggestionThreshold)
          .addSuggestion((suggest) => {
            return suggest(<span>Try to cast <SpellLink id={SPELLS.EARTH_SHOCK.id} /> at 111 Maelstrom or more.</span>)
              .icon(SPELLS.EARTH_SHOCK.icon)
              .actual(`Average Maelstrom spent: ${formatNumber(this.avgMaelstromSpendOutOfAsc)}`)
              .recommended(`More than 111 is recommended`);
          });
      }
    }
    if (this.avgMaelstromSpendInAsc>0) {
      when(this.inAscSuggestionThreshold)
        .addSuggestion((suggest) => {
          return suggest(<span>Try to cast <SpellLink id={SPELLS.EARTH_SHOCK.id} /> at 111 Maelstrom or more during Ascendence</span>)
            .icon(SPELLS.EARTH_SHOCK.icon)
            .actual(`Average Maelstrom spent: ${formatNumber(this.avgMaelstromSpendInAsc)}`)
            .recommended(`111 or more is recommended`);
        });
    }
  }

  statistic() {
    return (
      <StatisticBox
        icon={<SpellIcon id={SPELLS.EARTH_SHOCK.id} />}
        value={`${formatNumber(this.avgMaelstromSpendOutOfAsc)}`}
        label="Average Maelstrom spent on Earthshock while not in Ascendence"
      />
    );
  }
  statisticOrder = STATISTIC_ORDER.OPTIONAL();
}

export default EarthShock;
