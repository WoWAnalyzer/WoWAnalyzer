import React from 'react';

import SPELLS from 'common/SPELLS';
import SpellLink from 'common/SpellLink';

import Analyzer, { SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events from 'parser/core/Events';

import { STATISTIC_ORDER } from 'interface/others/StatisticsListBox';
import Statistic from 'interface/statistics/Statistic';
import DonutChart from 'interface/statistics/components/DonutChart';

const debug = false;

//TODO clean up and make easier to add triggers
class ThunderFocusTea extends Analyzer {
  castsTftRsk = 0;
  castsTftViv = 0;
  castsTftEnm = 0;
  castsTftRem = 0;

  castsTft = 0;
  castsUnderTft = 0;

  correctCasts = 0;

  castBufferTimestamp = null;
  ftActive = false;
  rmActive = false;

  constructor(...args) {
    super(...args);
    this.ftActive = this.selectedCombatant.hasTalent(SPELLS.FOCUSED_THUNDER_TALENT.id);
    this.rmActive = this.selectedCombatant.hasTalent(SPELLS.RISING_MIST_TALENT.id);
    this.addEventListener(Events.cast.by(SELECTED_PLAYER).spell(SPELLS.THUNDER_FOCUS_TEA), this.tftCast);
    this.addEventListener(Events.cast.by(SELECTED_PLAYER), this.buffedCast);
  }

  tftCast(event) {
    this.castsTft += this.ftActive ? 2 : 1;
  }

  buffedCast(event) {
    const spellId = event.ability.guid;

      // Implemented as a way to remove non-buffed REM or EF casts that occur at the same timestamp as the buffed Viv cast.
      // Need to think of cleaner solution
    if ((event.timestamp - this.castBufferTimestamp) < 25) {
      return;
    }

    if (this.selectedCombatant.hasBuff(SPELLS.THUNDER_FOCUS_TEA.id)) {
      if (SPELLS.VIVIFY.id === spellId && !event.classResources.cost) {
        this.castsUnderTft += 1;
        this.castsTftViv += 1;
        this.correctCasts += 1;
        debug && console.log('Viv TFT Check ', event.timestamp);
        this.castBufferTimestamp = event.timestamp;
      }
      if (SPELLS.RISING_SUN_KICK.id === spellId) {
        this.castsUnderTft += 1;
        this.castsTftRsk += 1;
        
        if(this.selectedCombatant.hasBuff(SPELLS.WAY_OF_THE_CRANE.id)){
          this.correctCasts += 1;
          return;
        }
        
        if(this.rmActive){
          this.correctCasts +=1;
        }

        debug && console.log('RSK TFT Check ', event.timestamp);
      }
      if (SPELLS.ENVELOPING_MIST.id === spellId) {
        this.castsUnderTft += 1;
        this.castsTftEnm += 1;
        debug && console.log('Enm TFT Check ', event.timestamp);
      }
      if (SPELLS.RENEWING_MIST.id === spellId) {
        this.castsUnderTft += 1;
        this.castsTftRem += 1;
        this.correctCasts += 1;
        debug && console.log('REM TFT Check ', event.timestamp);
      }
    }
  }

  renderCastRatioChart() {
    const items = [
      {
        color: '#00b159',
        label: 'Vivify',
        spellId: SPELLS.VIVIFY.id,
        value: this.castsTftViv,
      },
      {
        color: '#db00db',
        label: 'Renewing Mist',
        spellId: SPELLS.RENEWING_MIST.id,
        value: this.castsTftRem,
      },
      {
        color: '#f37735',
        label: 'Enveloping Mists',
        spellId: SPELLS.ENVELOPING_MIST.id,
        value: this.castsTftEnm,
      },
      {
        color: '#ffc425',
        label: 'Rising Sun Kick',
        spellId: SPELLS.RISING_SUN_KICK.id,
        value: this.castsTftRsk,
      },
    ];

    return (
      <DonutChart
        items={items}
      />
    );
  }

  get incorrectTftCasts() {
    return this.castsUnderTft - this.correctCasts;
  }

  get suggestionThresholds() {
    return {
      actual: this.incorrectTftCasts,
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
            <>
              You are currently using <SpellLink id={SPELLS.THUNDER_FOCUS_TEA.id} /> to buff spells other than {this.rmActive ? <SpellLink id={SPELLS.RISING_SUN_KICK.id} /> : <SpellLink id={SPELLS.VIVIFY.id} />}  or <SpellLink id={SPELLS.RENEWING_MIST.id} />. It is advised to limit the number of spells buffed to only these two.
            </>,
          )
            .icon(SPELLS.THUNDER_FOCUS_TEA.icon)
            .actual(`${this.incorrectTftCasts} incorrect casts with Thunder Focus Tea`)
            .recommended(`<${recommended} incorrect cast is recommended`);
        });
  }

  statistic() {
    return (
      <Statistic
        position={STATISTIC_ORDER.CORE(20)}
        size="flexible"
      >
        <div className="pad">
          <label><SpellLink id={SPELLS.THUNDER_FOCUS_TEA.id} /> usage</label>
          {this.renderCastRatioChart()}
        </div>
      </Statistic>
    );
  }
}

export default ThunderFocusTea;
