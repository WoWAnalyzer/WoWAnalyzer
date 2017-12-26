import React from 'react';
import { Doughnut as DoughnutChart } from 'react-chartjs-2';

import SPELLS from 'common/SPELLS';
import SPECS from 'common/SPECS';

import SpellLink from 'common/SpellLink';
import { formatPercentage } from 'common/format';

import Analyzer from 'Parser/Core/Analyzer';
import StatisticsListBox from 'Main/StatisticsListBox';
import Combatants from 'Parser/Core/Modules/Combatants';
import STATISTIC_ORDER from 'Main/STATISTIC_ORDER';

const CHART_SIZE = 100;

const BUFFER_MS = 100;

const VOLLEY_FOCUS_COST = 3;

const LIST_OF_BM_FOCUS_SPENDERS = [
  SPELLS.COBRA_SHOT.id,
  SPELLS.MULTISHOT.id,
  SPELLS.KILL_COMMAND.id,
  SPELLS.REVIVE_PET_AND_MEND_PET.id,
  SPELLS.A_MURDER_OF_CROWS_TALENT_SHARED.id,
  SPELLS.BARRAGE_TALENT.id,
  SPELLS.VOLLEY_ACTIVATED.id,
];

const LIST_OF_MM_FOCUS_SPENDERS = [
  SPELLS.AIMED_SHOT.id,
  SPELLS.MARKED_SHOT.id,
  SPELLS.REVIVE_PET_AND_MEND_PET.id,
  SPELLS.A_MURDER_OF_CROWS_TALENT_SHARED.id,
  SPELLS.BARRAGE_TALENT.id,
  SPELLS.VOLLEY_ACTIVATED.id,
  SPELLS.WINDBURST.id,
  SPELLS.PIERCING_SHOT_TALENT.id,
  SPELLS.BLACK_ARROW_TALENT.id,
  SPELLS.EXPLOSIVE_SHOT_TALENT.id,
];

//code grabbed from Parser/Paladin/Holy/Modules/PaladinCore/CastBehavior.js

class FocusUsage extends Analyzer {
  static dependencies = {
    combatants: Combatants,
  };
  focusSpenderCastsBM = {
    [SPELLS.COBRA_SHOT.id]: {
      casts: 0,
      focusUsed: 0,
      name: "Cobra Shot",
      color: '#ecd1b6',
    },
    [SPELLS.MULTISHOT.id]: {
      casts: 0,
      focusUsed: 0,
      name: "Multishot",
      color: '#c1ec9c',
    },
    [SPELLS.KILL_COMMAND.id]: {
      casts: 0,
      focusUsed: 0,
      name: "Kill Command",
      color: '#abff3d',
    },
    [SPELLS.REVIVE_PET_AND_MEND_PET.id]: {
      casts: 0,
      focusUsed: 0,
      name: "Revive/Mend pet",
      color: '#ec0003',
    },
    [SPELLS.A_MURDER_OF_CROWS_TALENT_SHARED.id]: {
      casts: 0,
      focusUsed: 0,
      name: "A Murder of Crows",
      color: '#8b8dec',
    },
    [SPELLS.BARRAGE_TALENT.id]: {
      casts: 0,
      focusUsed: 0,
      name: "Barrage",
      color: '#ec5c58',
    },
    [SPELLS.VOLLEY_ACTIVATED.id]: {
      casts: 0,
      focusUsed: 0,
      name: "Volley",
      color: '#66ecd8',
    },
  };
  focusSpenderCastsMM = {
    [SPELLS.AIMED_SHOT.id]: {
      casts: 0,
      focusUsed: 0,
      name: "Aimed Shot",
      color: '#84ec81',
    },
    [SPELLS.MARKED_SHOT.id]: {
      casts: 0,
      focusUsed: 0,
      name: "Marked Shot",
      color: '#ff7d0a',
    },
    [SPELLS.REVIVE_PET_AND_MEND_PET.id]: {
      casts: 0,
      focusUsed: 0,
      name: "Revive/Mend Pet",
      color: '#ec0003',
    },
    [SPELLS.A_MURDER_OF_CROWS_TALENT_SHARED.id]: {
      casts: 0,
      focusUsed: 0,
      name: "A Murder of Crows",
      color: '#8b8dec',
    },
    [SPELLS.BARRAGE_TALENT.id]: {
      casts: 0,
      focusUsed: 0,
      name: "Barrage",
      color: '#ec5c58',
    },
    [SPELLS.VOLLEY_ACTIVATED.id]: {
      casts: 0,
      focusUsed: 0,
      name: "Volley",
      color: '#66ecd8',
    },
    [SPELLS.WINDBURST.id]: {
      casts: 0,
      focusUsed: 0,
      name: "Windburst",
      color: '#ecd1b6',
    },
    [SPELLS.PIERCING_SHOT_TALENT.id]: {
      casts: 0,
      focusUsed: 0,
      name: "Piercing Shot",
      color: '#d440ec',
    },
    [SPELLS.BLACK_ARROW_TALENT.id]: {
      casts: 0,
      focusUsed: 0,
      name: "Black Arrow",
      color: '#2a2a2a',
    },
    [SPELLS.EXPLOSIVE_SHOT_TALENT.id]: {
      casts: 0,
      focusUsed: 0,
      name: "Explosive Shot",
      color: '#ecda4c',
    },
  };
  lastVolleyHit = 0;

  legend(items, total) {
    const numItems = items.length;
    return items.map(({ color, label, tooltip, value, spellId }, index) => {
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
            <dfn data-tip={value}>
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
    if (this.combatants.selected.spec === SPECS.MARKSMANSHIP_HUNTER) {
      if (LIST_OF_MM_FOCUS_SPENDERS.every(id => spellId !== id)) {
        return;
      }
      this.focusSpenderCastsMM[spellId].casts += 1;
      this.focusSpenderCastsMM[spellId].focusUsed += event.classResources[0]['cost'] || 0;
    } else if (this.combatants.selected.spec === SPECS.BEAST_MASTERY_HUNTER) {
      if (LIST_OF_BM_FOCUS_SPENDERS.every(id => spellId !== id)) {
        return;
      }
      this.focusSpenderCastsBM[spellId].casts += 1;
      this.focusSpenderCastsBM[spellId].focusUsed += event.classResources[0]['cost'] || 0;
    }
  }
  on_byPlayer_damage(event) {
    const spellId = event.ability.guid;
    if (spellId !== SPELLS.VOLLEY_ACTIVATED.id) {
      return;
    }
    if (event.timestamp > (this.lastVolleyHit + BUFFER_MS)) {
      if (this.combatants.selected.spec === SPECS.MARKSMANSHIP_HUNTER) {
        this.focusSpenderCastsMM[spellId].casts += 1;
        this.focusSpenderCastsMM[spellId].focusUsed += VOLLEY_FOCUS_COST;

      }
      if (this.combatants.selected.spec === SPECS.BEAST_MASTERY_HUNTER) {
        this.focusSpenderCastsBM[spellId].casts += 1;
        this.focusSpenderCastsBM[spellId].focusUsed += VOLLEY_FOCUS_COST;
      }
      this.lastVolleyHit = event.timestamp;
    }
  }

  focusUsageChart() {
    let totalFocusUsed = 0;
    const items = [];
    const bmFocusSpenders = [[SPELLS.COBRA_SHOT.id], [SPELLS.MULTISHOT.id], [SPELLS.KILL_COMMAND.id], [SPELLS.REVIVE_PET_AND_MEND_PET.id], [SPELLS.A_MURDER_OF_CROWS_TALENT_SHARED.id], [SPELLS.BARRAGE_TALENT.id], [SPELLS.VOLLEY_ACTIVATED.id]];
    const mmFocusSpenders = [[SPELLS.AIMED_SHOT.id], [SPELLS.MARKED_SHOT.id], [SPELLS.REVIVE_PET_AND_MEND_PET.id], [SPELLS.BARRAGE_TALENT.id], [SPELLS.VOLLEY_ACTIVATED.id], [SPELLS.WINDBURST.id], [SPELLS.PIERCING_SHOT_TALENT.id], [SPELLS.BLACK_ARROW_TALENT.id], [SPELLS.EXPLOSIVE_SHOT_TALENT.id]];
    if (this.combatants.selected.spec === SPECS.MARKSMANSHIP_HUNTER) {
      mmFocusSpenders.forEach(focusSpender => {
        if (this.focusSpenderCastsMM[focusSpender].casts > 0) {
          items.push({
            color: this.focusSpenderCastsMM[focusSpender].color,
            label: this.focusSpenderCastsMM[focusSpender].name,
            spellId: focusSpender,
            value: this.focusSpenderCastsMM[focusSpender].focusUsed,
          });
        }
      });
      mmFocusSpenders.map(ability => totalFocusUsed += this.focusSpenderCastsMM[ability].focusUsed);
    } else if (this.combatants.selected.spec === SPECS.BEAST_MASTERY_HUNTER) {
      bmFocusSpenders.forEach(focusSpender => {
        if (this.focusSpenderCastsBM[focusSpender].casts > 0) {
          items.push({
            color: this.focusSpenderCastsBM[focusSpender].color,
            label: this.focusSpenderCastsBM[focusSpender].name,
            spellId: focusSpender,
            value: this.focusSpenderCastsBM[focusSpender].focusUsed,
          });
        }
      });
      bmFocusSpenders.map(ability => totalFocusUsed += this.focusSpenderCastsBM[ability].focusUsed);

    }
    return (
      <div className="flex">
        <div className="flex-sub" style={{ paddingRight: 12 }}>
          {this.chart(items)}
        </div>
        <div className="flex-main" style={{ fontSize: '80%', paddingTop: 3 }}>
          {this.legend(items, totalFocusUsed)}
        </div>
      </div>
    );
  }
  statistic() {
    return (
      <div className="col-lg-3 col-md-4 col-sm-6 col-xs-12">
        <div className="row">
          <StatisticsListBox
            title={<span> Focus usage</span>}
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
