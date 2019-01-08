import React from 'react';

import SpellLink from 'common/SpellLink';
import SPELLS from 'common/SPELLS';
import Tooltip from 'common/Tooltip';

import Analyzer from 'parser/core/Analyzer';
import GlobalCooldown from 'parser/shared/modules/GlobalCooldown';
import { STATISTIC_ORDER } from 'interface/others/StatisticsListBox';
import STATISTIC_CATEGORY from 'interface/others/STATISTIC_CATEGORY';
import Statistic from 'interface/statistics/Statistic';
import DonutChart from 'interface/statistics/components/DonutChart';

const FLASH_FLOOD_HASTE = 0.2;
const BUFFER_MS = 50;

class FlashFlood extends Analyzer {
  static dependencies = {
    globalCooldown: GlobalCooldown,
  };

  beginCastTimestamp = 0;
  beginCastGlobalCooldown = 0;

  spellsConsumingFlashFlood = {
    [SPELLS.HEALING_WAVE.id]: {
      timesBuffed: 0,
      timeSaved: 0,
      timeWasted: 0,
    },
    [SPELLS.CHAIN_HEAL.id]: {
      timesBuffed: 0,
      timeSaved: 0,
      timeWasted: 0,
    },
    [SPELLS.HEALING_SURGE_RESTORATION.id]: { //-- always below GCD
      timesBuffed: 0,
      timeSaved: 0,
      timeWasted: 0,
    },
    [SPELLS.HEALING_RAIN_CAST.id]: {
      timesBuffed: 0,
      timeSaved: 0,
      timeWasted: 0,
    },
  };

  constructor(...args) {
    super(...args);
    this.active = this.selectedCombatant.hasTalent(SPELLS.FLASH_FLOOD_TALENT.id);

    if(this.selectedCombatant.hasTalent(SPELLS.WELLSPRING_TALENT.id)) { //-- always below GCD
      this.spellsConsumingFlashFlood[SPELLS.WELLSPRING_TALENT.id] = {
        timesBuffed: 0,
        timeSaved: 0,
        timeWasted: 0,
      };
    }
  }

  on_byPlayer_begincast(event) {
    const spellId = event.ability.guid;
    if (!this.spellsConsumingFlashFlood[spellId]) {
      return;
    }

    if (event.isCancelled) {
      return;
    }

    this.beginCastTimestamp = event.timestamp;
    this.beginCastGlobalCooldown = this.globalCooldown.getGlobalCooldownDuration(spellId);
  }

  on_byPlayer_cast(event) {
    if (!this.beginCastTimestamp) {
      return;
    }

    const spellId = event.ability.guid;
    // check again to be safe & to avoid breaking the page
    if (!this.spellsConsumingFlashFlood[spellId]) {
      return;
    }

    const hasFlashFlood = this.selectedCombatant.hasBuff(SPELLS.FLASH_FLOOD_BUFF.id, this.beginCastTimestamp+BUFFER_MS);
    if (!hasFlashFlood) {
      return;
    }

    this.spellsConsumingFlashFlood[spellId].timesBuffed += 1;
    const castTime = event.timestamp - this.beginCastTimestamp;
    this.beginCastTimestamp = 0;
    if (castTime <= this.beginCastGlobalCooldown) {
      // The next 2 lines together add up to the total reduction, but everything below the GCD is discarded
      this.spellsConsumingFlashFlood[spellId].timeWasted += this.beginCastGlobalCooldown-castTime;
      this.spellsConsumingFlashFlood[spellId].timeSaved += Math.max((castTime) / (1 - FLASH_FLOOD_HASTE) - this.beginCastGlobalCooldown, 0);
      return;
    }

    this.spellsConsumingFlashFlood[spellId].timeSaved += castTime / (1 - FLASH_FLOOD_HASTE) * FLASH_FLOOD_HASTE;
  }

  get totalTimeSaved() {
    return Object.values(this.spellsConsumingFlashFlood).reduce((sum, spell) => {return sum + spell.timeSaved;}, 0);
  }

  get totalTimeWasted() {
    return Object.values(this.spellsConsumingFlashFlood).reduce((sum, spell) => {return sum + spell.timeWasted;}, 0);
  }

  get flashFloodUsageRatioChart() {
    const makeTooltip = (value) => (
      <>
        <strong>{(value.timeSaved / 1000).toFixed(2)} seconds saved</strong> <br />
        {(value.timeWasted / 1000).toFixed(2)} seconds reduced below GCD <br />
        You buffed this spell <strong>{value.timesBuffed}</strong> times.
      </>
    );
    const items = [
      {
        color: SPELLS.CHAIN_HEAL.color,
        label: 'Chain Heal',
        spellId: SPELLS.CHAIN_HEAL.id,
        value: this.spellsConsumingFlashFlood[SPELLS.CHAIN_HEAL.id].timeSaved,
        valueTooltip: makeTooltip(this.spellsConsumingFlashFlood[SPELLS.CHAIN_HEAL.id]),
      },
      {
        color: SPELLS.HEALING_WAVE.color,
        label: 'Healing Wave',
        spellId: SPELLS.HEALING_WAVE.id,
        value: this.spellsConsumingFlashFlood[SPELLS.HEALING_WAVE.id].timeSaved,
        valueTooltip: makeTooltip(this.spellsConsumingFlashFlood[SPELLS.HEALING_WAVE.id]),
      },
      {
        color: SPELLS.HEALING_SURGE_RESTORATION.color,
        label: 'Healing Surge',
        spellId: SPELLS.HEALING_SURGE_RESTORATION.id,
        value: this.spellsConsumingFlashFlood[SPELLS.HEALING_SURGE_RESTORATION.id].timeSaved,
        valueTooltip: makeTooltip(this.spellsConsumingFlashFlood[SPELLS.HEALING_SURGE_RESTORATION.id]),
      },
      {
        color: SPELLS.RIPTIDE.color,
        label: 'Healing Rain',
        spellId: SPELLS.HEALING_RAIN_CAST.id,
        value: this.spellsConsumingFlashFlood[SPELLS.HEALING_RAIN_CAST.id].timeSaved,
        valueTooltip: makeTooltip(this.spellsConsumingFlashFlood[SPELLS.HEALING_RAIN_CAST.id]),
      },
    ];

    if (this.spellsConsumingFlashFlood[SPELLS.WELLSPRING_TALENT.id]) {
      const wellspring = {
        color: '#FEFEFE',
        label: 'Wellspring',
        spellId: SPELLS.WELLSPRING_TALENT.id,
        value: this.spellsConsumingFlashFlood[SPELLS.WELLSPRING_TALENT.id].timeSaved,
        valueTooltip: makeTooltip(this.spellsConsumingFlashFlood[SPELLS.WELLSPRING_TALENT.id]),
      };
      items.splice(4, 0, wellspring);
    }

    return (
      <DonutChart
        items={items}
      />
    );
  }

  statistic() {
    return (
      <Statistic
        category={STATISTIC_CATEGORY.TALENTS}
        position={STATISTIC_ORDER.OPTIONAL(90)}
        style={{ height: '230px' }}
      >
        <div className="pad">
          <label><SpellLink id={SPELLS.FLASH_FLOOD_TALENT.id} /> usage</label>
          <div className="flex">
            <div className="flex-main">
              Total Cast Time Saved:
            </div>
            <div className="flex-sub text-right">
              <Tooltip content={<>Cast time saved by Flash Flood. <br /> {(this.totalTimeWasted / 1000).toFixed(2)} seconds 'saved' on reductions below GCD.</>}>
                {(this.totalTimeSaved / 1000).toFixed(2)} seconds
              </Tooltip>
            </div>
          </div>
          {this.flashFloodUsageRatioChart}
        </div>
      </Statistic>
    );
  }

}

export default FlashFlood;
