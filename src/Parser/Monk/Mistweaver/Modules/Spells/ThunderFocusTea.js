import React from 'react';
import { Doughnut as DoughnutChart } from 'react-chartjs-2';

import SPELLS from 'common/SPELLS';
import SpellLink from 'common/SpellLink';
import { formatPercentage } from 'common/format';

import Combatants from 'Parser/Core/Modules/Combatants';

import Analyzer from 'Parser/Core/Analyzer';

import StatisticsListBox, { STATISTIC_ORDER } from 'Main/StatisticsListBox';

const debug = false;

const CHART_SIZE = 75;

class ThunderFocusTea extends Analyzer {
  static dependencies = {
    combatants: Combatants,
  };

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

  castsTftRsk = 0;
  castsTftEf = 0;
  castsTftViv = 0;
  castsTftEnm = 0;
  castsTftRem = 0;

  castsTft = 0;
  castsUnderTft = 0;

  castBufferTimestamp = null;
  ftActive = false;

  on_initialized() {
    this.ftActive = this.combatants.selected.hasTalent(SPELLS.FOCUSED_THUNDER_TALENT.id);
  }

  on_toPlayer_applybuff(event) {
    const spellId = event.ability.guid;
    if (SPELLS.THUNDER_FOCUS_TEA.id === spellId) {
      this.castsTft += 1;
    }
  }

  on_byPlayer_cast(event) {
    const spellId = event.ability.guid;

      // Implemented as a way to remove non-buffed REM or EF casts that occur at the same timestamp as the buffed Viv cast.
      // Need to think of cleaner solution
    if ((event.timestamp - this.castBufferTimestamp) < 25) {
      return;
    }

    if (this.combatants.selected.hasBuff(SPELLS.THUNDER_FOCUS_TEA.id)) {
      if (SPELLS.VIVIFY.id === spellId && !event.classResources.cost) {
        this.castsUnderTft += 1;
        this.castsTftViv += 1;
        debug && console.log('Viv TFT Check ', event.timestamp);
        this.castBufferTimestamp = event.timestamp;
      }
      if (SPELLS.RISING_SUN_KICK.id === spellId) {
        this.castsUnderTft += 1;
        this.castsTftRsk += 1;
        debug && console.log('RSK TFT Check ', event.timestamp);
      }
      if (SPELLS.ENVELOPING_MISTS.id === spellId) {
        this.castsUnderTft += 1;
        this.castsTftEnm += 1;
        debug && console.log('Enm TFT Check ', event.timestamp);
      }
      if (SPELLS.ESSENCE_FONT.id === spellId) {
        this.castsUnderTft += 1;
        this.castsTftEf += 1;
        debug && console.log('EF TFT Check ', event.timestamp);
      }
      if (SPELLS.RENEWING_MIST.id === spellId) {
        this.castsUnderTft += 1;
        this.castsTftRem += 1;
        debug && console.log('REM TFT Check ', event.timestamp);
      }
    }
  }

  tftCastRatioChart() {
    const items = [
      {
        color: '#00b159',
        label: 'Vivify',
        spellId: SPELLS.VIVIFY.id,
        value: this.castsTftViv,
      },
      {
        color: '#00aedb',
        label: 'Renewing Mist',
        spellId: SPELLS.RENEWING_MIST.id,
        value: this.castsTftRem,
      },
      {
        color: '#f37735',
        label: 'Enveloping Mists',
        spellId: SPELLS.ENVELOPING_MISTS.id,
        value: this.castsTftEnm,
      },
      {
        color: '#ffc425',
        label: 'Rising Sun Kick',
        spellId: SPELLS.RISING_SUN_KICK.id,
        value: this.castsTftRsk,
      },
      {
        color: '#d11141',
        label: 'Essence Font',
        spellId: SPELLS.ESSENCE_FONT.id,
        value: this.castsTftEf,
      },
    ];

    return (
      <div className="flex">
        <div className="flex-sub" style={{ paddingRight: 12 }}>
          {this.chart(items)}
        </div>
        <div className="flex-main" style={{ fontSize: '80%', paddingTop: 3 }}>
          {this.legend(items, this.castsUnderTft)}
        </div>
      </div>
    );
  }

  on_finished() {
    if (this.ftActive) {
      this.castsTft += this.castsTft;
    }
    if (debug) {
      console.log(`TFT Casts:${this.castsTft}`);
      console.log(`RSK Buffed:${this.castsTftRsk}`);
      console.log(`Enm Buffed:${this.castsTftEnm}`);
      console.log(`EF Buffed:${this.castsTftEf}`);
      console.log(`Viv Buffed:${this.castsTftViv}`);
      console.log(`REM Buffed:${this.castsTftRem}`);
    }
  }

  get incorrectTFTCasts() {
    return this.castsUnderTft - (this.castsTftViv + this.castsTftRem);
  }

  get suggestionThresholds() {
    return {
      actual: this.incorrectTFTCasts,
      isGreaterThan: {
        minor: 1,
        average: 1.5,
        major: 2,
      },
      style: 'number',
    };
  }

  suggestions(when) {
    when(this.suggestionThresholds).addSuggestion((suggest, actual, recommended) => {
          return suggest(
            <React.Fragment>
              You are currently using <SpellLink id={SPELLS.THUNDER_FOCUS_TEA.id} /> to buff spells other than <SpellLink id={SPELLS.VIVIFY.id} /> or <SpellLink id={SPELLS.RENEWING_MIST.id} />. It is advised to limit the number of spells buffed to only these two.
            </React.Fragment>
          )
            .icon(SPELLS.THUNDER_FOCUS_TEA.icon)
            .actual(`${this.incorrectTftCasts} incorrect casts with Thunder Focus Tea`)
            .recommended(`<${recommended} incorrect cast is recommended`);
        });
  }

  statistic() {
    return (
      <StatisticsListBox
        title={<React.Fragment><SpellLink id={SPELLS.THUNDER_FOCUS_TEA.id}>Thunder Focus Tea</SpellLink> usage</React.Fragment>}
      >
        {this.tftCastRatioChart()}
      </StatisticsListBox>
    );
  }
  statisticOrder = STATISTIC_ORDER.CORE(20);
}

export default ThunderFocusTea;
