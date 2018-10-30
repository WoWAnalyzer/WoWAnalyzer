import React from 'react';
import { Doughnut as DoughnutChart } from 'react-chartjs-2';

import SpellLink from 'common/SpellLink';
import SPELLS from 'common/SPELLS';
import { formatPercentage } from 'common/format';

import StatisticsListBox, { STATISTIC_ORDER } from 'interface/others/StatisticsListBox';
import STATISTIC_CATEGORY from 'interface/others/STATISTIC_CATEGORY';
import StatisticListBoxItem from 'interface/others/StatisticListBoxItem';

import Analyzer from 'parser/core/Analyzer';
import calculateEffectiveHealing from 'parser/core/calculateEffectiveHealing';

import CooldownThroughputTracker from '../features/CooldownThroughputTracker';

const UNLEASH_LIFE_HEALING_INCREASE = 0.45;
const BUFFER_MS = 200;
const UNLEASH_LIFE_DURATION = 10000;
const debug = true;

const CHART_SIZE = 75;

/**
 * Unleash Life:
 * Unleashes elemental forces of Life, healing a friendly target and increasing the effect of the Shaman's next direct heal.
 */

class UnleashLife extends Analyzer {
  static dependencies = {
    cooldownThroughputTracker: CooldownThroughputTracker,
  };
  healing = 0;
  healingBuff = {
    [SPELLS.RIPTIDE.id]: {
      healing: 0,
      castAmount: 0,
      playersActive: [],
    },
    [SPELLS.CHAIN_HEAL.id]: {
      healing: 0,
      castAmount: 0,
    },
    [SPELLS.HEALING_WAVE.id]: {
      healing: 0,
      castAmount: 0,
    },
    [SPELLS.HEALING_SURGE_RESTORATION.id]: {
      healing: 0,
      castAmount: 0,
    },
  };

  unleashLifeCasts = 0;
  unleashLifeRemaining = 0;
  unleashLifeHealRemaining = 0;

  buffedChainHealTimestamp = null;
  lastUnleashLifeTimestamp = null;

  constructor(...args) {
    super(...args);
    this.active = this.selectedCombatant.hasTalent(SPELLS.UNLEASH_LIFE_TALENT.id);
  }

  on_byPlayer_heal(event) {
    const spellId = event.ability.guid;

    if(spellId === SPELLS.UNLEASH_LIFE_TALENT.id) {
      this.unleashLifeHealRemaining = 1;
      this.lastUnleashLifeTimestamp = event.timestamp;
      this.healing += event.amount + (event.absorbed || 0);
    }

    if(this.unleashLifeHealRemaining > 0 && (this.lastUnleashLifeTimestamp + UNLEASH_LIFE_DURATION) <= event.timestamp) {
      debug && console.log("Heal Timed out", event.timestamp);
      this.unleashLifeHealRemaining = 0;
      return;
    }

    // Thse 3 heals only have 1 event and are handled easily
    if (this.unleashLifeHealRemaining > 0 && ((spellId === SPELLS.HEALING_WAVE.id) || (spellId === SPELLS.HEALING_SURGE_RESTORATION.id) || (spellId === SPELLS.RIPTIDE.id && !event.tick))) {
      this.healingBuff[spellId].healing += calculateEffectiveHealing(event, UNLEASH_LIFE_HEALING_INCREASE);
      this.unleashLifeHealRemaining = 0;
      debug && console.log("Heal:",spellId);

      // I had to move the HoT application to the heal event as the buffapply event had too many false positives
      if (spellId === SPELLS.RIPTIDE.id) {
        this.healingBuff[spellId].playersActive.push(event.targetID);
        debug && console.log("HoT Applied:",spellId);
      }

    // Chain heal has up to 4 events so there is something more going on, setting the variable to -1 to indicate that there might be more events coming
    } else if (spellId === SPELLS.CHAIN_HEAL.id && (this.unleashLifeHealRemaining > 0 || (this.unleashLifeHealRemaining < 0 && this.buffedChainHealTimestamp + BUFFER_MS > event.timestamp))) {
      this.healingBuff[spellId].healing += calculateEffectiveHealing(event, UNLEASH_LIFE_HEALING_INCREASE);
      this.unleashLifeHealRemaining = -1;
      this.buffedChainHealTimestamp = event.timestamp;
      debug && console.log("Heal:",spellId);

    // Riptide HoT handling
    } else if (spellId === SPELLS.RIPTIDE.id && this.healingBuff[spellId].playersActive.includes(event.targetID)) {
      // Ticks on whoever its active
      if (event.tick) {
        this.healingBuff[spellId].healing += calculateEffectiveHealing(event, UNLEASH_LIFE_HEALING_INCREASE);
      // Casting a Riptide without UnL on a target with a buffed Riptide will straight up remove the buff, not even the pandemic part gets anything from the increased healing
      } else {
        this.healingBuff[spellId].playersActive.splice(this.healingBuff[spellId].playersActive.indexOf(event.targetID),1);
      }
    }
  }

  on_byPlayer_cast(event) {
    const spellId = event.ability.guid;

    if(spellId === SPELLS.UNLEASH_LIFE_TALENT.id) {
      this.unleashLifeCasts += 1;
      this.unleashLifeRemaining = true;
      this.lastUnleashLifeTimestamp = event.timestamp;
      debug && console.log("New Unleash", event.timestamp);
    }

    if(this.unleashLifeRemaining && (this.lastUnleashLifeTimestamp + UNLEASH_LIFE_DURATION) <= event.timestamp) {
      this.unleashLifeRemaining = false;
      debug && console.log("Cast Timed out", event.timestamp);
      return;
    }

    const hasUnleashLife = this.selectedCombatant.hasBuff(SPELLS.UNLEASH_LIFE_TALENT.id, event.timestamp, BUFFER_MS, BUFFER_MS);
    if(!hasUnleashLife) {
      return;
    }

    if (this.unleashLifeRemaining) {
      if(this.healingBuff[spellId]) {
        this.healingBuff[spellId].castAmount += 1;
        this.unleashLifeRemaining = false;
        debug && console.log("Cast:",spellId);
      }
    }
  }

  on_byPlayer_removebuff(event) {
    const spellId = event.ability.guid;
    if (spellId !== SPELLS.RIPTIDE.id) {
      return;
    }

    if (!this.healingBuff[spellId].playersActive.includes(event.targetID)) {
      return;
    }

    this.healingBuff[spellId].playersActive.splice(this.healingBuff[spellId].playersActive.indexOf(event.targetID),1);
  }

  on_feed_heal(event) {
    // rework
  }

  get totalBuffedHealing() {
    return Object.values(this.healingBuff).reduce((sum, spell) => sum + spell.healing, 0);
  }

  get totalUses() {
    return Object.values(this.healingBuff).reduce((sum, spell) => sum + spell.castAmount, 0);
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
          <dfn data-tip={value}>
              {formatPercentage(value / total, 0)}%
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
            data: items.map(item => item.value),
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

  unleashLifeCastRatioChart() {
    const unusedUL = this.unleashLifeCasts - this.totalUses;

    const items = [
      {
        color: SPELLS.CHAIN_HEAL.color,
        label: 'Chain Heal',
        spellId: SPELLS.CHAIN_HEAL.id,
        value: this.healingBuff[SPELLS.CHAIN_HEAL.id].castAmount,
      },
      {
        color: SPELLS.HEALING_WAVE.color,
        label: 'Healing Wave',
        spellId: SPELLS.HEALING_WAVE.id,
        value: this.healingBuff[SPELLS.HEALING_WAVE.id].castAmount,
      },
      {
        color: SPELLS.HEALING_SURGE_RESTORATION.color,
        label: 'Healing Surge',
        spellId: SPELLS.HEALING_SURGE_RESTORATION.id,
        value: this.healingBuff[SPELLS.HEALING_SURGE_RESTORATION.id].castAmount,
      },
      {
        color: SPELLS.RIPTIDE.color,
        label: 'Riptide',
        spellId: SPELLS.RIPTIDE.id,
        value: this.healingBuff[SPELLS.RIPTIDE.id].castAmount,
      },
      {
        color: '#CC3D20',
        label: 'Unused Buffs',
        tooltip: `The amount of Unleash Life buffs you did not use out of the total available. You cast ${this.unleashLifeCasts} Unleash Lifes, of which you used ${this.totalUses}.`,
        value: unusedUL,
      },
    ];

    return (
      <div className="flex">
        <div className="flex-sub" style={{ paddingRight: 12 }}>
          {this.chart(items)}
        </div>
        <div className="flex-main" style={{ fontSize: '80%', paddingTop: 3 }}>
          {this.legend(items, this.totalUses)}
        </div>
      </div>
    );
  }

  statistic() {
    return (
      <StatisticsListBox
        title={<span><SpellLink id={SPELLS.UNLEASH_LIFE_TALENT.id} /> usage</span>}
        containerProps={{ className: 'col-lg-3 col-md-4 col-sm-6 col-xs-12' }}
        category={STATISTIC_CATEGORY.TALENTS}
        position={STATISTIC_ORDER.OPTIONAL(15)}
      >
        {this.unleashLifeCastRatioChart()}
      </StatisticsListBox>
    );
  }

  subStatistic() {
    const feeding = this.cooldownThroughputTracker.getIndirectHealing(SPELLS.UNLEASH_LIFE_TALENT.id);
    return (
      <StatisticListBoxItem
        title={<SpellLink id={SPELLS.UNLEASH_LIFE_TALENT.id} />}
        value={`${formatPercentage(this.owner.getPercentageOfTotalHealingDone(this.healing + this.totalBuffedHealing + feeding))} %`}
        valueTooltip={`${formatPercentage(this.owner.getPercentageOfTotalHealingDone(this.healing + feeding))}% from Unleash Life and ${formatPercentage(this.owner.getPercentageOfTotalHealingDone(this.totalBuffedHealing))}% from the healing buff.`}
      />
    );
  }

}

export default UnleashLife;

