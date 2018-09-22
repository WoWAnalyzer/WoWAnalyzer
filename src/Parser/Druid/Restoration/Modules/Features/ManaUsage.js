import React from 'react';
import { Doughnut as DoughnutChart } from 'react-chartjs-2';

import SPELLS from 'common/SPELLS';
import SpellLink from 'common/SpellLink';
import { formatPercentage } from 'common/format';
import RESOURCE_TYPES from 'game/RESOURCE_TYPES';
import Analyzer from 'Parser/Core/Analyzer';
import StatisticsListBox from 'Interface/Others/StatisticsListBox';
import STATISTIC_ORDER from 'Interface/Others/STATISTIC_ORDER';
import StatisticWrapper from 'Interface/Others/StatisticWrapper';
import AbilityTracker from '../Core/RestoDruidAbilityTracker';

const CHART_SIZE = 100;

/**
 * Tracks the mana usage of resto druid and creates a piechart with the breakdown.
 *
 * Example log: https://www.warcraftlogs.com/reports/Pp17Crv6gThLYmdf#fight=8&type=damage-done&source=76
 */

const LIST_OF_MANA_SPENDERS = [
  SPELLS.LIFEBLOOM_HOT_HEAL.id,
  SPELLS.REJUVENATION.id,
  SPELLS.WILD_GROWTH.id,
  SPELLS.EFFLORESCENCE_CAST.id,
  SPELLS.REGROWTH.id,
  SPELLS.SWIFTMEND.id,
  SPELLS.TRANQUILITY_CAST.id,
  SPELLS.CENARION_WARD_TALENT.id,
];

class ManaUsage extends Analyzer {
  static dependencies = {
    abilityTracker: AbilityTracker,
  };

  manaSpenderCasts = {
    [SPELLS.LIFEBLOOM_HOT_HEAL.id]: {
      casts: 0,
      manaUsed: 0,
      name: SPELLS.LIFEBLOOM_HOT_HEAL.name,
      color: '#b2d689',
      hpm: 0,
    },
    [SPELLS.REJUVENATION.id]: {
      casts: 0,
      manaUsed: 0,
      name: SPELLS.REJUVENATION.name,
      color: '#b013c6',
      hpm: 0,
    },
    [SPELLS.WILD_GROWTH.id]: {
      casts: 0,
      manaUsed: 0,
      name: SPELLS.WILD_GROWTH.name,
      color: '#70d181',
      hpm: 0,
    },
    [SPELLS.EFFLORESCENCE_CAST.id]: {
      casts: 0,
      manaUsed: 0,
      name: SPELLS.EFFLORESCENCE_CAST.name,
      color: '#f95160',
      hpm: 0,
    },
    [SPELLS.REGROWTH.id]: {
      casts: 0,
      manaUsed: 0,
      name: SPELLS.REGROWTH.name,
      color: '#168a45',
      hpm: 0,
    },
    [SPELLS.SWIFTMEND.id]: {
      casts: 0,
      manaUsed: 0,
      names: SPELLS.SWIFTMEND.name,
      color: '#31558f',
      hpm: 0,
    },
    [SPELLS.TRANQUILITY_CAST.id]: {
      casts: 0,
      manaUsed: 0,
      names: SPELLS.TRANQUILITY_CAST.name,
      color: '#46709a',
      hpm: 0,
    },
    [SPELLS.CENARION_WARD_TALENT.id]: {
      casts: 0,
      manaUsed: 0,
      names: SPELLS.CENARION_WARD_TALENT.name,
      color: '#fff',
      hpm: 0,
    },
  };

  legend(items, total) {
    const numItems = items.length;
    return items.map(({ color, label, tooltip, value, casts, spellId, hpm }, index) => {
      label = tooltip ? (
        <dfn data-tip={tooltip}>{label}</dfn>
      ) : label;
      label = spellId ? (
        <SpellLink id={spellId}>{label}</SpellLink>
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
          <div className="flex-sub" >
            <dfn data-tip={`${casts} casts <br/> ${value} mana used`}>
              {formatPercentage(value / total, 1)}%
            </dfn>
          </div>
          <div className="flex-sub" style={{ paddingLeft: 5 }}>
              {hpm.toFixed(2)} hpm
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
            borderColor: '#666',
            borderWidth: 1.5,
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

  on_byPlayer_cast(event) {
    const spellId = event.ability.guid;
    if (LIST_OF_MANA_SPENDERS.every(id => spellId !== id)) {
      return;
    }
    //shouldn't really happen unless something messed up in the log where the cast event doesn't have any class resource information so we skip those.
    if (!event.classResources) {
      return;
    }
    this.manaSpenderCasts[spellId].casts += 1;
    this.manaSpenderCasts[spellId].manaUsed += event.resourceCost[RESOURCE_TYPES.MANA.id] || 0;
  }

  manaUsageChart() {
    const usedSpells = LIST_OF_MANA_SPENDERS.filter(id => this.manaSpenderCasts[id].casts > 0 && this.manaSpenderCasts[id].manaUsed > 0);
    const totalmanaUsed = usedSpells.reduce((total, id) => total + this.manaSpenderCasts[id].manaUsed, 0);
    const items = usedSpells
      .map(id => ({
        color: this.manaSpenderCasts[id].color,
        label: this.manaSpenderCasts[id].name,
        spellId: id,
        value: Math.round(this.manaSpenderCasts[id].manaUsed),
        casts: this.manaSpenderCasts[id].casts,
        hpm: this.manaSpenderCasts[id].hpm,
      }))
      .sort((a, b) => b.value - a.value);

    return (

      <div className="flex">
        <div className="flex-sub" style={{ paddingRight: 12 }}>
          {this.chart(items)}
        </div>
        <div className="flex-main" style={{ fontSize: '80%', paddingTop: 3 }}>
          {this.legend(items, totalmanaUsed.toFixed(1))}
        </div>
      </div>
    );
  }

  getHpmForAbility(spellId) {
    if(spellId == null) {
      return null;
    }

    const heal = this.abilityTracker.getAbility(spellId);
    if(heal != null && this.manaSpenderCasts[spellId]) {
      return (heal.healingEffective + heal.healingAbsorbed + (heal.healingMastery ? heal.healingMastery : 0)) / heal.manaUsed;
    } else {
      return null;
    }
  }

  statistic() {
    LIST_OF_MANA_SPENDERS.forEach(function(spellId) {
      this.manaSpenderCasts[spellId].hpm = this.getHpmForAbility(spellId);
    }, this);
    return (
      <StatisticWrapper position={STATISTIC_ORDER.CORE(13)}>
        <div className="col-lg-3 col-md-4 col-sm-6 col-xs-12">
          <div className="row">
            <StatisticsListBox
              title="mana tracker"
              containerProps={{ className: 'col-xs-12' }}
            >
              {this.manaUsageChart()}
            </StatisticsListBox>
          </div>
        </div>
      </StatisticWrapper>
    );
  }
}

export default ManaUsage;
