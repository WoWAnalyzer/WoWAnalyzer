import React from 'react';

import SPELLS from 'common/SPELLS';
import SpellLink from 'common/SpellLink';
import SpellIcon from 'common/SpellIcon';
import { formatPercentage } from 'common/format';

import Module from 'Parser/Core/Module';

import StatisticBox, { STATISTIC_ORDER } from 'Main/StatisticBox';

const debug = false;

class ThunderFocusTea extends Module {
    castsTftEff = 0;
    castsTftEf = 0;
    castsTftViv = 0;
    castsTftEnm = 0;
    castsTftRem = 0;

    castsTft = 0;
    castsUnderTft = 0;

    castBufferTimestamp = null;
    ftActive = false;

    on_initialized() {
      this.ftActive = this.owner.selectedCombatant.hasTalent(SPELLS.FOCUSED_THUNDER_TALENT.id);
    }

    on_toPlayer_applybuff(event) {
      const spellId = event.ability.guid;
      if(SPELLS.THUNDER_FOCUS_TEA.id === spellId) {
        this.castsTft++;
      }
    }

    on_byPlayer_cast(event) {
      const spellId = event.ability.guid;

      // Implemented as a way to remove non-buffed REM or EF casts that occur at the same timestamp as the buffed Viv cast.
      // Need to think of cleaner solution
      if((event.timestamp - this.castBufferTimestamp) < 25) {
        return;
      }

      if(this.owner.selectedCombatant.hasBuff(SPELLS.THUNDER_FOCUS_TEA.id)) {
        if(SPELLS.VIVIFY.id === spellId && !event.classResources.cost) {
          this.castsUnderTft++;
          this.castsTftViv++;
          debug && console.log('Viv TFT Check ', event.timestamp);
          this.castBufferTimestamp = event.timestamp;
        }
        if(SPELLS.EFFUSE.id === spellId) {
          this.castsUnderTft++;
          this.castsTftEff++;
          debug && console.log('Eff TFT Check ', event.timestamp);
        }
        if(SPELLS.ENVELOPING_MISTS.id === spellId) {
          this.castsUnderTft++;
          this.castsTftEnm++;
          debug && console.log('Enm TFT Check ', event.timestamp);
        }
        if(SPELLS.ESSENCE_FONT.id === spellId) {
          this.castsUnderTft++;
          this.castsTftEf++;
          debug && console.log('EF TFT Check ', event.timestamp);
        }
        if(SPELLS.RENEWING_MIST.id === spellId) {
          this.castsUnderTft++;
          this.castsTftRem++;
          debug && console.log('REM TFT Check ', event.timestamp);
        }
      }
    }

    on_finished() {
      if(this.ftActive) {
        this.castsTft += this.castsTft;
      }
      if(debug) {
        console.log("TFT Casts:" + this.castsTft);
        console.log("Eff Buffed:" + this.castsTftEff);
        console.log("Enm Buffed:" + this.castsTftEnm);
        console.log("EF Buffed:" + this.castsTftEf);
        console.log("Viv Buffed:" + this.castsTftViv);
        console.log("REM Buffed:" + this.castsTftRem);
      }
    }

    suggestions(when) {
      const incorrectTftCasts = this.castsUnderTft - (this.castsTftViv + this.castsTftRem);
      when(incorrectTftCasts).isGreaterThan(1)
        .addSuggestion((suggest, actual, recommended) => {
          return suggest(<span>You are currently using <SpellLink id={SPELLS.THUNDER_FOCUS_TEA.id} /> to buff spells other than <SpellLink id={SPELLS.VIVIFY.id} /> or <SpellLink id={SPELLS.RENEWING_MIST.id} />. It is advised to limit the number of spells buffed to only these two.</span>)
            .icon(SPELLS.THUNDER_FOCUS_TEA.icon)
            .actual(`${incorrectTftCasts} incorrect casts with Thunder Focus Tea`)
            .recommended(`<${recommended} incorrect cast is recommended`)
            .regular(recommended + 1).major(recommended + 3);
        });
    }

    statistic() {
      return (
        <StatisticBox
          icon={<SpellIcon id={SPELLS.THUNDER_FOCUS_TEA.id} />}
          value={`${this.castsTft}`}
          label={(
            <dfn data-tip={`With your ${this.castsTft} Thunder Focus Tea casts, you buffed the following spells:
              <ul>
                ${this.castsTftViv > 0 ?
                `<li>${(this.castsTftViv)} Vivify buffed (${formatPercentage(this.castsTftViv / this.castsTft)}%)</li>`
                : ""
                }
                ${this.castsTftRem > 0 ?
                `<li>${(this.castsTftRem)} Renewing Mist buffed (${formatPercentage(this.castsTftRem / this.castsTft)}%)</li>`
                : ""
                }
                ${this.castsTftEnm > 0 ?
                `<li>${(this.castsTftEnm)} Enveloping Mists buffed (${formatPercentage(this.castsTftEnm / this.castsTft)}%)</li>`
                : ""
                }
                ${this.castsTftEff > 0 ?
                `<li>${(this.castsTftEff)} Effuse buffed (${formatPercentage(this.castsTftEff / this.castsTft)}%)</li>`
                : ""
                }
                ${this.castsTftEf > 0 ?
                `<li>${(this.castsTftEf)} Essence Font buffed (${formatPercentage(this.castsTftEf / this.castsTft)}%)</li>`
                : ""
                }
              </ul>
              `}>
              Total casts
            </dfn>
          )}
        />
      );
    }
    statisticOrder = STATISTIC_ORDER.OPTIONAL();
}

export default ThunderFocusTea;
