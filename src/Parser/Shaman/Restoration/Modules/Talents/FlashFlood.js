import React from 'react';
import { Doughnut as DoughnutChart } from 'react-chartjs-2';

import SpellLink from 'common/SpellLink';
import SPELLS from 'common/SPELLS';
import { formatPercentage } from 'common/format';

import Analyzer from 'Parser/Core/Analyzer';
import GlobalCooldown from 'Parser/Core/Modules/GlobalCooldown';
import StatisticsListBox, { STATISTIC_ORDER } from 'Interface/Others/StatisticsListBox';
import STATISTIC_CATEGORY from 'Interface/Others/STATISTIC_CATEGORY';

const FLASH_FLOOD_HASTE = 0.2;
const BUFFER_MS = 50;
const CHART_SIZE = 75;

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

  legend(items, total) {
    const numItems = items.length;
    return items.map(({ color, label, tooltip, value, spellId }, index) => {
      label = tooltip ? (
        <dfn data-tip={tooltip}>{label}</dfn>
      ) : label;
      label = spellId ? (
        <SpellLink id={spellId} icon={false}>{label}</SpellLink>
      ) : label;
      return (
        <div
          className="flex"
          style={{
            borderBottom: '3px solid rgba(255,255,255,0.1)',
            marginBottom: ((numItems - 1) === index) ? 0 : 5,
          }}
          key={index}
        >
          <div className="flex-sub">
            <div
              style={{
                display: 'inline-block',
                background: color,
                borderRadius: '50%',
                width: 16,
                height: 16,
                marginBottom: -3,
              }}
            />
          </div>
          <div className="flex-main" style={{ paddingLeft: 5 }}>
            {label}
          </div>
          <div className="flex-sub">
          <dfn data-tip={
            `<b>${(value.timeSaved / 1000).toFixed(2)} seconds saved</b><br/>
            ${(value.timeWasted / 1000).toFixed(2)} seconds reduced below GCD<br/>
            You buffed this spell <b>${value.timesBuffed}</b> times.`
            }>
              {formatPercentage(value.timeSaved / total, 0)}%
            </dfn>
          </div>
        </div>
      );
    });
  }
  chart(items) {
    return (
      <DoughnutChart
        data={{
          datasets: [{
            data: items.map(item => item.value.timeSaved),
            backgroundColor: items.map(item => item.color),
            borderColor: '#000000',
            borderWidth: 0,
          }],
          labels: items.map(item => item.label),
        }}
        options={{
          legend: {
            display: false,
          },
          tooltips: {
            bodyFontSize: 8,
          },
          cutoutPercentage: 45,
          animation: false,
          responsive: false,
        }}
        width={CHART_SIZE}
        height={CHART_SIZE}
      />
    );
  }

  flashFloodUsageRatioChart() {

    const items = [
      {
        color: SPELLS.CHAIN_HEAL.color,
        label: 'Chain Heal',
        spellId: SPELLS.CHAIN_HEAL.id,
        value: this.spellsConsumingFlashFlood[SPELLS.CHAIN_HEAL.id],
      },
      {
        color: SPELLS.HEALING_WAVE.color,
        label: 'Healing Wave',
        spellId: SPELLS.HEALING_WAVE.id,
        value: this.spellsConsumingFlashFlood[SPELLS.HEALING_WAVE.id],
      },
      {
        color: SPELLS.HEALING_SURGE_RESTORATION.color,
        label: 'Healing Surge',
        spellId: SPELLS.HEALING_SURGE_RESTORATION.id,
        value: this.spellsConsumingFlashFlood[SPELLS.HEALING_SURGE_RESTORATION.id],
      },
      {
        color: SPELLS.RIPTIDE.color,
        label: 'Healing Rain',
        spellId: SPELLS.HEALING_RAIN_CAST.id,
        value: this.spellsConsumingFlashFlood[SPELLS.HEALING_RAIN_CAST.id],
      },
    ];

    if(this.spellsConsumingFlashFlood[SPELLS.WELLSPRING_TALENT.id]) {
      const wellspring_item = {
        color: '#FEFEFE',
        label: 'Wellspring',
        spellId: SPELLS.WELLSPRING_TALENT.id,
        value: this.spellsConsumingFlashFlood[SPELLS.WELLSPRING_TALENT.id],
      };
      items.splice(4,0,wellspring_item);
    }

    return (
      <div className="flex">
        <div className="flex-sub" style={{ paddingRight: 12 }}>
          {this.chart(items)}
        </div>
        <div className="flex-main" style={{ fontSize: '80%', paddingTop: 3 }}>
          {this.legend(items, this.totalTimeSaved)}
        </div>
      </div>
    );
  }

  statistic() {
    return (
      <StatisticsListBox
        title={<span><SpellLink id={SPELLS.FLASH_FLOOD_TALENT.id} /> usage</span>}
        category={STATISTIC_CATEGORY.TALENTS}
        position={STATISTIC_ORDER.OPTIONAL(90)}
        containerProps={{ className: 'col-lg-3 col-md-4 col-sm-6 col-xs-12' }}
      >
        <div className="flex">
          <div className="flex-main">
            Total Cast Time Saved:
          </div>
          <div className="flex-sub text-right">
            <dfn data-tip={`Cast time saved by Flash Flood. <br /> ${(this.totalTimeWasted / 1000).toFixed(2)} seconds 'saved' on reductions below GCD.`} >
              {`${(this.totalTimeSaved / 1000).toFixed(2)} seconds`}
            </dfn>
          </div>
        </div>
        {this.flashFloodUsageRatioChart()}
      </StatisticsListBox>
    );
  }

}

export default FlashFlood;
