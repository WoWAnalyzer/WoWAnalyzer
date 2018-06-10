import React from 'react';
import { Doughnut as DoughnutChart } from 'react-chartjs-2';

import SPELLS from 'common/SPELLS';

import SpellLink from 'common/SpellLink';
import { formatPercentage } from 'common/format';

import Analyzer from 'Parser/Core/Analyzer';
import StatisticsListBox from 'Main/StatisticsListBox';
import Combatants from 'Parser/Core/Modules/Combatants';
import STATISTIC_ORDER from 'Main/STATISTIC_ORDER';
import ITEMS from 'common/ITEMS';

const CHART_SIZE = 100;

//to ensure we don't count multiple volley hits as the same cast
const BUFFER_MS = 100;

//the cost per auto attack with volley up
const VOLLEY_FOCUS_COST = 3;

//bm legendary that reduces focus cost - only needed because of volley, else it's baked into the cost
const ROAR_OF_THE_SEVEN_LIONS_FOCUS_REDUCTION = 0.15;

const LIST_OF_FOCUS_SPENDERS = [
  //bm specific
  SPELLS.COBRA_SHOT.id,
  SPELLS.MULTISHOT.id,
  SPELLS.KILL_COMMAND.id,
  //mm specific
  SPELLS.AIMED_SHOT.id,
  SPELLS.MARKED_SHOT.id,
  SPELLS.WINDBURST.id,
  SPELLS.PIERCING_SHOT_TALENT.id,
  SPELLS.BLACK_ARROW_TALENT.id,
  SPELLS.EXPLOSIVE_SHOT_TALENT.id,
  //sv specific
  SPELLS.RAPTOR_STRIKE.id,
  SPELLS.LACERATE.id,
  SPELLS.BUTCHERY_TALENT.id,
  SPELLS.FLANKING_STRIKE.id,
  SPELLS.WING_CLIP.id,
  SPELLS.THROWING_AXES_TALENT.id,
  SPELLS.A_MURDER_OF_CROWS_TALENT_SURVIVAL.id,
  SPELLS.RANGERS_NET_TALENT.id,
  //shared
  SPELLS.REVIVE_PET_AND_MEND_PET.id,
  SPELLS.A_MURDER_OF_CROWS_TALENT_SHARED.id,
  SPELLS.BARRAGE_TALENT.id,
  SPELLS.VOLLEY_ACTIVATED.id,
];

class FocusUsage extends Analyzer {
  static dependencies = {
    combatants: Combatants,
  };

  focusSpenderCasts = {
    //BEAST MASTERY
    [SPELLS.COBRA_SHOT.id]: {
      casts: 0,
      focusUsed: 0,
      name: SPELLS.COBRA_SHOT.name,
      color: '#ecd1b6',
    },
    [SPELLS.MULTISHOT.id]: {
      casts: 0,
      focusUsed: 0,
      name: SPELLS.MULTISHOT.name,
      color: '#c1ec9c',
    },
    [SPELLS.KILL_COMMAND.id]: {
      casts: 0,
      focusUsed: 0,
      name: SPELLS.KILL_COMMAND.name,
      color: '#abff3d',
    },
    //MARKSMANSHIP
    [SPELLS.AIMED_SHOT.id]: {
      casts: 0,
      focusUsed: 0,
      name: SPELLS.AIMED_SHOT.name,
      color: '#84ec81',
    },
    [SPELLS.MARKED_SHOT.id]: {
      casts: 0,
      focusUsed: 0,
      name: SPELLS.MARKED_SHOT.name,
      color: '#ff7d0a',
    },
    [SPELLS.WINDBURST.id]: {
      casts: 0,
      focusUsed: 0,
      name: SPELLS.WINDBURST.name,
      color: '#ecd1b6',
    },
    [SPELLS.PIERCING_SHOT_TALENT.id]: {
      casts: 0,
      focusUsed: 0,
      name: SPELLS.PIERCING_SHOT_TALENT.name,
      color: '#d440ec',
    },
    [SPELLS.BLACK_ARROW_TALENT.id]: {
      casts: 0,
      focusUsed: 0,
      name: SPELLS.BLACK_ARROW_TALENT.name,
      color: '#2a2a2a',
    },
    [SPELLS.EXPLOSIVE_SHOT_TALENT.id]: {
      casts: 0,
      focusUsed: 0,
      name: SPELLS.EXPLOSIVE_SHOT_TALENT.name,
      color: '#ecda4c',
    },
    //SURVIVAL
    [SPELLS.RAPTOR_STRIKE.id]: {
      casts: 0,
      focusUsed: 0,
      name: SPELLS.RAPTOR_STRIKE.name,
      color: '#4ce4ec',
    },
    [SPELLS.LACERATE.id]: {
      casts: 0,
      focusUsed: 0,
      name: SPELLS.LACERATE.name,
      color: '#2a74ec',
    },
    [SPELLS.BUTCHERY_TALENT.id]: {
      casts: 0,
      focusUsed: 0,
      name: SPELLS.BUTCHERY_TALENT.name,
      color: '#8b4507',
    },
    [SPELLS.FLANKING_STRIKE.id]: {
      casts: 0,
      focusUsed: 0,
      name: SPELLS.FLANKING_STRIKE.name,
      color: '#98ff00',
    },
    [SPELLS.WING_CLIP.id]: {
      casts: 0,
      focusUsed: 0,
      name: SPELLS.WING_CLIP.name,
      color: '#ecda4c',
    },
    [SPELLS.THROWING_AXES_TALENT.id]: {
      casts: 0,
      focusUsed: 0,
      name: SPELLS.THROWING_AXES_TALENT.name,
      color: '#00ec62',
    },
    [SPELLS.A_MURDER_OF_CROWS_TALENT_SURVIVAL.id]: {
      casts: 0,
      focusUsed: 0,
      name: SPELLS.A_MURDER_OF_CROWS_TALENT_SURVIVAL.name,
      color: '#3eec85',
    },
    [SPELLS.RANGERS_NET_TALENT.id]: {
      casts: 0,
      focusUsed: 0,
      name: SPELLS.RANGERS_NET_TALENT.name,
      color: '#ecda4c',
    },
    //SHARED
    [SPELLS.REVIVE_PET_AND_MEND_PET.id]: {
      casts: 0,
      focusUsed: 0,
      name: SPELLS.REVIVE_PET_AND_MEND_PET.name,
      color: '#ec0003',
    },
    [SPELLS.A_MURDER_OF_CROWS_TALENT_SHARED.id]: {
      casts: 0,
      focusUsed: 0,
      name: SPELLS.A_MURDER_OF_CROWS_TALENT_SHARED.name,
      color: '#8b8dec',
    },
    [SPELLS.BARRAGE_TALENT.id]: {
      casts: 0,
      focusUsed: 0,
      name: SPELLS.BARRAGE_TALENT.name,
      color: '#ec5c58',
    },
    [SPELLS.VOLLEY_ACTIVATED.id]: {
      casts: 0,
      focusUsed: 0,
      name: SPELLS.VOLLEY_ACTIVATED.name,
      color: '#66ecd8',
    },
  };
  lastVolleyHit = 0;

  legend(items, total) {
    const numItems = items.length;
    return items.map(({ color, label, tooltip, value, casts, spellId }, index) => {
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
          <div className="flex-sub">
            <dfn data-tip={`${casts} casts <br/> ${value} focus used`}>
              {formatPercentage(value / total, 1)}%
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
    if (LIST_OF_FOCUS_SPENDERS.every(id => spellId !== id)) {
      return;
    }
    //shouldn't really happen unless something messed up in the log where the cast event doesn't have any class resource information so we skip those. 
    if (!event.classResources) {
      return;
    }
    this.focusSpenderCasts[spellId].casts += 1;
    this.focusSpenderCasts[spellId].focusUsed += event.classResources[0].cost || 0;
  }

  on_byPlayer_damage(event) {
    const spellId = event.ability.guid;
    if (spellId !== SPELLS.VOLLEY_ACTIVATED.id) {
      return;
    }
    if (event.timestamp > (this.lastVolleyHit + BUFFER_MS)) {
      this.focusSpenderCasts[spellId].casts += 1;
      if (this.combatants.selected.hasBuff(SPELLS.BESTIAL_WRATH.id) && this.combatants.selected.hasWaist(ITEMS.ROAR_OF_THE_SEVEN_LIONS.id)) {
        this.focusSpenderCasts[spellId].focusUsed += VOLLEY_FOCUS_COST - (VOLLEY_FOCUS_COST * ROAR_OF_THE_SEVEN_LIONS_FOCUS_REDUCTION);
      } else {
        this.focusSpenderCasts[spellId].focusUsed += VOLLEY_FOCUS_COST;
      }
      this.lastVolleyHit = event.timestamp;
    }
  }

  focusUsageChart() {
    let totalFocusUsed = 0;
    const items = [];

    LIST_OF_FOCUS_SPENDERS.forEach(id => {
      if (this.focusSpenderCasts[id].casts > 0 && this.focusSpenderCasts[id].focusUsed > 0) {
        items.push({
          color: this.focusSpenderCasts[id].color,
          label: this.focusSpenderCasts[id].name,
          spellId: id,
          value: Math.round(this.focusSpenderCasts[id].focusUsed),
          casts: this.focusSpenderCasts[id].casts,
        });
        totalFocusUsed += this.focusSpenderCasts[id].focusUsed;
      }
    });
    return (
      <div className="flex">
        <div className="flex-sub" style={{ paddingRight: 12 }}>
          {this.chart(items)}
        </div>
        <div className="flex-main" style={{ fontSize: '80%', paddingTop: 3 }}>
          {this.legend(items, totalFocusUsed.toFixed(1))}
        </div>
      </div>
    )
      ;
  }

  statistic() {
    return (
      <div className="col-lg-3 col-md-4 col-sm-6 col-xs-12">
        <div className="row">
          <StatisticsListBox
            title="Focus usage"
            containerProps={{ className: 'col-xs-12' }}
          >
            {this.focusUsageChart()}
          </StatisticsListBox>
        </div>
      </div>
    );
  }
  statisticOrder = STATISTIC_ORDER.CORE(4);
}

export default FocusUsage;
