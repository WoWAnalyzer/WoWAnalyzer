import React from 'react';
import { Doughnut as DoughnutChart } from 'react-chartjs-2';

import SpellLink from 'common/SpellLink';
import SPELLS from 'common/SPELLS';
import { formatPercentage } from 'common/format';

import StatisticsListBox, { STATISTIC_ORDER } from 'Main/StatisticsListBox';

import Analyzer from 'Parser/Core/Analyzer';
import Combatants from 'Parser/Core/Modules/Combatants';
import calculateEffectiveHealing from 'Parser/Core/calculateEffectiveHealing';

import CooldownThroughputTracker from '../Features/CooldownThroughputTracker';

const UNLEASH_LIFE_HEALING_INCREASE = 0.45;
const BUFFER_MS = 200;
const riptideDuration = 18000;
const unleashLifeBuffDuration = 10000;

const CHART_SIZE = 75;

/**
 * This is slightly inaccurate, since if you use UL on 2 Riptides in a row it will lose a few seconds of the first one.
 */

class UnleashLife extends Analyzer {
  static dependencies = {
    combatants: Combatants,
    cooldownThroughputTracker: CooldownThroughputTracker,
  };
  healing = 0;

  unleashLifeCasts = 0;
  unleashLifeRemaining = 0;
  unleashLifeHealRemaining = 0;
  unleashLifeFeedRemaining = 0;

  buffedChainHeals = 0;
  buffedHealingWaves = 0;
  buffedHealingSurges = 0;
  buffedRiptides = 0;

  buffedRiptideTimestamp = null;
  buffedRiptideTarget = null;
  buffedChainHealTimestamp = null;
  lastUnleashLifeTimestamp = null;
  lastUnleashLifeFeedTimestamp = null;

  on_initialized() {
    this.active = this.combatants.selected.hasTalent(SPELLS.UNLEASH_LIFE_TALENT.id);
  }

  on_byPlayer_heal(event) {
    const spellId = event.ability.guid;

    if (event.timestamp > (this.buffedRiptideTimestamp + riptideDuration)) {
      this.buffedRiptideTimestamp = null;
      this.buffedRiptideTarget = null;
    }

    if(spellId === SPELLS.UNLEASH_LIFE_TALENT.id) {
      this.unleashLifeHealRemaining += 1;
    }

    if((this.lastUnleashLifeTimestamp + unleashLifeBuffDuration) <= event.timestamp) {
      this.unleashLifeHealRemaining = 0;
    }

    if (
      (spellId === SPELLS.HEALING_WAVE.id && this.unleashLifeHealRemaining > 0) || 
      (spellId === SPELLS.HEALING_SURGE_RESTORATION.id && this.unleashLifeHealRemaining> 0) ||
      (spellId === SPELLS.CHAIN_HEAL.id) ||
      (spellId === SPELLS.RIPTIDE.id && !event.tick && this.unleashLifeHealRemaining> 0)
    ) {
      const hasUnleashLife = this.combatants.selected.hasBuff(SPELLS.UNLEASH_LIFE_TALENT.id, event.timestamp, BUFFER_MS, BUFFER_MS);

      if (hasUnleashLife) {
        this.healing += calculateEffectiveHealing(event, UNLEASH_LIFE_HEALING_INCREASE);
        this.unleashLifeHealRemaining - 1 < 0 ? this.unleashLifeHealRemaining = 0 : this.unleashLifeHealRemaining -= 1;
      }
    } else if (SPELLS.RIPTIDE.id === spellId && event.tick && this.buffedRiptideTarget === event.targetID) {
      this.healing += calculateEffectiveHealing(event, UNLEASH_LIFE_HEALING_INCREASE);
    } else if (spellId === SPELLS.UNLEASH_LIFE_TALENT.id) {
      this.healing += event.amount;
    }
  }

  on_byPlayer_cast(event) {
    const spellId = event.ability.guid;

    if(spellId === SPELLS.UNLEASH_LIFE_TALENT.id) {
      this.unleashLifeCasts += 1;
      this.unleashLifeRemaining += 1;
      this.lastUnleashLifeTimestamp = event.timestamp;
    }

    const hasUnleashLife = this.combatants.selected.hasBuff(SPELLS.UNLEASH_LIFE_TALENT.id, event.timestamp, BUFFER_MS, BUFFER_MS);

    if(!hasUnleashLife) {
      return;
    }

    if (this.unleashLifeRemaining) {
      if((this.lastUnleashLifeTimestamp + unleashLifeBuffDuration) <= event.timestamp) {
        this.unleashLifeRemaining = 0;
        return;
      }

      switch(spellId) {
        case SPELLS.CHAIN_HEAL.id:
            this.buffedChainHeals += 1;
            this.unleashLifeRemaining -= 1;
          break;
        case SPELLS.HEALING_WAVE.id:
            this.buffedHealingWaves += 1;
            this.unleashLifeRemaining -= 1;
          break;
        case SPELLS.HEALING_SURGE_RESTORATION.id:
            this.buffedHealingSurges += 1;
            this.unleashLifeRemaining -= 1;
          break;
        case SPELLS.RIPTIDE.id:
            this.buffedRiptides += 1;
            this.unleashLifeRemaining -= 1;
          break;
        default:
          return;
      }
    }
  }

  on_byPlayer_applybuff(event) {
    const spellId = event.ability.guid;

    if (spellId !== SPELLS.RIPTIDE.id) {
      return;
    }

    const hasUnleashLife = this.combatants.selected.hasBuff(SPELLS.UNLEASH_LIFE_TALENT.id, event.timestamp, 0, BUFFER_MS);

    // Saving the buffed riptide target to track the healing done on.
    if (hasUnleashLife) {
      this.buffedRiptideTimestamp = event.timestamp;
      this.buffedRiptideTarget = event.targetID;
    } else if (event.targetID === this.buffedRiptideTarget) { // if you overwrite the buffed riptide, all value of Unleash Life is lost
      this.buffedRiptideTimestamp = null;
      this.buffedRiptideTarget = null;
    }
  }

  on_feed_heal(event) {
    const spellId = event.ability.guid;

    if(spellId === SPELLS.UNLEASH_LIFE_TALENT.id) {
      this.unleashLifeFeedRemaining += 1;
      this.lastUnleashLifeFeedTimestamp = event.timestamp;
    }

    if((this.lastUnleashLifeFeedTimestamp + unleashLifeBuffDuration) <= event.timestamp) {
      this.unleashLifeFeedRemaining = 0;
    }

    if (
      (spellId === SPELLS.HEALING_WAVE.id && this.unleashLifeFeedRemaining > 0) || 
      (spellId === SPELLS.HEALING_SURGE_RESTORATION.id && this.unleashLifeFeedRemaining> 0) ||
      (spellId === SPELLS.CHAIN_HEAL.id) ||
      (spellId === SPELLS.RIPTIDE.id && !event.tick && this.unleashLifeFeedRemaining> 0)
    ) {
      const hasUnleashLife = this.combatants.selected.hasBuff(SPELLS.UNLEASH_LIFE_TALENT.id, event.timestamp, BUFFER_MS, BUFFER_MS);

      if (hasUnleashLife) {
        this.healing += event.feed * UNLEASH_LIFE_HEALING_INCREASE;
        this.unleashLifeFeedRemaining - 1 < 0 ? this.unleashLifeFeedRemaining = 0 : this.unleashLifeFeedRemaining -= 1;
      }
    } else if (SPELLS.RIPTIDE.id === spellId && event.tick && this.buffedRiptideTarget === event.targetID) {
      this.healing += event.feed * UNLEASH_LIFE_HEALING_INCREASE;
    }
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
    const totalUses = this.buffedChainHeals + this.buffedHealingWaves + this.buffedHealingSurges + this.buffedRiptides;
    const unusedUL = this.unleashLifeCasts - totalUses;

    const items = [
      {
        color: SPELLS.CHAIN_HEAL.color,
        label: 'Chain Heal',
        spellId: SPELLS.CHAIN_HEAL.id,
        value: this.buffedChainHeals,
      },
      {
        color: SPELLS.HEALING_WAVE.color,
        label: 'Healing Wave',
        spellId: SPELLS.HEALING_WAVE.id,
        value: this.buffedHealingWaves,
      },
      {
        color: SPELLS.HEALING_SURGE_RESTORATION.color,
        label: 'Healing Surge',
        spellId: SPELLS.HEALING_SURGE_RESTORATION.id,
        value: this.buffedHealingSurges,
      },
      {
        color: SPELLS.RIPTIDE.color,
        label: 'Riptide',
        spellId: SPELLS.RIPTIDE.id,
        value: this.buffedRiptides,
      },
      {
        color: '#CC3D20',
        label: 'Unused Buffs',
        tooltip: `The amount of Unleash Life buffs you did not use out of the total available. You cast ${this.unleashLifeCasts} Unleash Lifes, of which you used ${totalUses}.`,
        value: unusedUL,
      },
    ];

    return (
      <div className="flex">
        <div className="flex-sub" style={{ paddingRight: 12 }}>
          {this.chart(items)}
        </div>
        <div className="flex-main" style={{ fontSize: '80%', paddingTop: 3 }}>
          {this.legend(items, totalUses)}
        </div>
      </div>
    );
  }

  statistic() {
    return (
      <div className="col-lg-3 col-md-4 col-sm-6 col-xs-12">
        <div className="row">
          <StatisticsListBox
            title={<span><SpellLink id={SPELLS.UNLEASH_LIFE_TALENT.id} /> usage</span>}
            containerProps={{ className: 'col-xs-12' }}
          >
            {this.unleashLifeCastRatioChart()}
          </StatisticsListBox>
        </div>
      </div>
    );
  }
  statisticOrder = STATISTIC_ORDER.OPTIONAL(10);

  subStatistic() {
    const feeding = this.cooldownThroughputTracker.getIndirectHealing(SPELLS.UNLEASH_LIFE_TALENT.id);
    return (
      <div className="flex">
        <div className="flex-main">
          <SpellLink id={SPELLS.UNLEASH_LIFE_TALENT.id} />
        </div>
        <div className="flex-sub text-right">
          {formatPercentage(this.owner.getPercentageOfTotalHealingDone(this.healing + feeding))} %
        </div>
      </div>
    );
  }

}

export default UnleashLife;

