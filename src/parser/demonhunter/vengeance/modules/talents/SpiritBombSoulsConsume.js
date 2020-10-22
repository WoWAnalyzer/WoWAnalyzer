import React from 'react';
import Analyzer, { SELECTED_PLAYER } from 'parser/core/Analyzer';
import TalentStatisticBox from 'interface/others/TalentStatisticBox';
import STATISTIC_ORDER from 'interface/others/STATISTIC_ORDER';

import SPELLS from 'common/SPELLS/index';
import SpellLink from 'common/SpellLink';

import { formatPercentage } from 'common/format';
import { i18n } from '@lingui/core';
import { t } from '@lingui/macro';
import Events from 'parser/core/Events';

const MS_BUFFER = 100;

class SpiritBombSoulsConsume extends Analyzer {

  /* Feed The Demon talent is taken in defensive builds. In those cases you want to generate and consume souls as quickly
   as possible. So how you consume your souls down matter. If you dont take that talent your taking a more balanced
   build meaning you want to consume souls in a way that boosts your dps. That means feeding the souls into spirit
   bomb as efficiently as possible (cast at 4+ souls) for a dps boost and have soul cleave absorb souls as little as
   possible since it provides no extra dps.
*/
  constructor(...args) {
    super(...args);
    this.active = this.selectedCombatant.hasTalent(SPELLS.SPIRIT_BOMB_TALENT.id) && !this.selectedCombatant.hasTalent(SPELLS.FEED_THE_DEMON_TALENT.id);
    this.addEventListener(Events.cast.by(SELECTED_PLAYER).spell(SPELLS.SPIRIT_BOMB_TALENT), this.onCast);
    this.addEventListener(Events.changebuffstack.by(SELECTED_PLAYER).spell(SPELLS.SOUL_FRAGMENT_STACK), this.onChangeBuffStack);
    this.addEventListener(Events.fightend, this.onFightend);
  }

  castTimestamp = 0;
  castSoulsConsumed = 0;
  cast = 0;

  soulsConsumedByAmount = Array.from({length: 6}, x => 0);

  onCast(event) {
    if(this.cast > 0) {
      this.countHits();
    }
    this.castTimestamp = event.timestamp;
    this.cast += 1;
  }

  onChangeBuffStack(event) {
    if (event.oldStacks < event.newStacks) {
      return;
    }
    if (event.timestamp - this.castTimestamp < MS_BUFFER) {
      const soulsConsumed = event.oldStacks - event.newStacks;
      this.castSoulsConsumed += soulsConsumed;
    }
  }

  countHits() {
    if (!this.soulsConsumedByAmount[this.castSoulsConsumed]) {
      this.soulsConsumedByAmount[this.castSoulsConsumed] = 1;
      this.castSoulsConsumed = 0;
      return;
    }
    this.soulsConsumedByAmount[this.castSoulsConsumed] += 1;
    this.castSoulsConsumed = 0;
  }

  onFightend() {
    this.countHits();
  }

  get totalGoodCasts() {
    return this.soulsConsumedByAmount[4] + this.soulsConsumedByAmount[5];
  }

  get totalCasts() {
    return Object.values(this.soulsConsumedByAmount).reduce((total, casts) => total+casts, 0);
  }

  get percentGoodCasts() {
    return this.totalGoodCasts / this.totalCasts;
  }
  get suggestionThresholdsEfficiency() {
    return {
      actual: this.percentGoodCasts,
      isLessThan: {
        minor: 0.90,
        average: 0.85,
        major: .80,
      },
      style: 'percentage',
    };
  }

  suggestions(when) {
    when(this.suggestionThresholdsEfficiency)
      .addSuggestion((suggest, actual, recommended) => suggest(<>Try to cast <SpellLink id={SPELLS.SPIRIT_BOMB_TALENT.id} /> at 4 or 5 souls.</>)
          .icon(SPELLS.SPIRIT_BOMB_TALENT.icon)
          .actual(i18n._(t('demonhunter.vengeance.suggestions.spiritBomb.soulsConsumed')`${formatPercentage(this.percentGoodCasts)}% of casts at 4+ souls.`))
          .recommended(`>${formatPercentage(recommended)}% is recommended`));
  }

  statistic() {
    return (
      <TalentStatisticBox
        talent={SPELLS.SPIRIT_BOMB_TALENT.id}
        position={STATISTIC_ORDER.CORE(6)}
        value={`${formatPercentage(this.percentGoodCasts)} %`}
        label="Good Spirit Bomb casts"
      >
        <table className="table table-condensed">
          <thead>
            <tr>
              <th>Stacks</th>
              <th>Casts</th>
            </tr>
          </thead>
          <tbody>
            {Object.values(this.soulsConsumedByAmount).map((castAmount, stackAmount) => (
              <tr key={stackAmount}>
                <th>{stackAmount}</th>
                <td>{castAmount}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </TalentStatisticBox>
    );
  }

}

export default SpiritBombSoulsConsume;
