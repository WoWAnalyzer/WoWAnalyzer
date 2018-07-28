import React from 'react';
import Analyzer from 'Parser/Core/Analyzer';
import ExpandableStatisticBox from 'Interface/Others/ExpandableStatisticBox';
import { STATISTIC_ORDER } from 'Interface/Others/StatisticBox';

import SPELLS from 'common/SPELLS/index';
import SpellIcon from 'common/SpellIcon';

import { formatPercentage } from 'common/format';

class SpiritBombSoulConsume extends Analyzer {

  constructor(...args) {
    super(...args);
    this.active = this.selectedCombatant.hasTalent(SPELLS.SPIRIT_BOMB_TALENT.id);
  }

  castTimestamp = 0;
  castSoulsConsumed = 0;
  cast = 0;
  index = 1;

  soulsConsumedByAmount = Array.from({length: 6}, x => 0);

  on_byPlayer_cast(event) {
    const spellId = event.ability.guid;
    if (spellId !== SPELLS.SPIRIT_BOMB_TALENT.id) {
      return;
    }
    if(this.cast > 0) {
      this.countHits();
    }
    this.castTimestamp = event.timestamp;
    this.cast += 1;
  }

  on_byPlayer_removebuffstack(event) {
    const spellId = event.ability.guid;
    if (spellId !== SPELLS.SOUL_FRAGMENT_STACK.id) {
      return;
    }
    if (event.timestamp - this.castTimestamp < 100) {
      this.castSoulsConsumed += 1;
    }
  }

  on_byPlayer_removebuff(event) {
    const spellId = event.ability.guid;
    if (spellId !== SPELLS.SOUL_FRAGMENT_STACK.id) {
      return;
    }
    if (event.timestamp - this.castTimestamp < 100) {
      this.castSoulsConsumed += 1;
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

  on_finished() {
    this.countHits();
    console.log("ARRAY ", this.soulsConsumedByAmount);
  }

  statistic() {
    const totalGoodCasts = this.soulsConsumedByAmount[4] + this.soulsConsumedByAmount[5];
    const totalCasts = Object.values(this.soulsConsumedByAmount).reduce((a, b) => a+b, 0);
    const percentGoodCasts = totalGoodCasts / totalCasts;

    return (
      <ExpandableStatisticBox
        icon={<SpellIcon id={SPELLS.SOUL_FRAGMENT_STACK.id} />}
        value={`${formatPercentage(percentGoodCasts)} %`}
        label="Good Spirit Bomb Casts"
      >
        <table className="table table-condensed">
          <thead>
            <tr>
              <th>Stack</th>
              <th>Casts</th>
            </tr>
          </thead>
          <tbody>
            {Object.values(this.soulsConsumedByAmount).map((e, i) => (
              <tr key={i}>
                <th>{i}</th>
                <td>{e}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </ExpandableStatisticBox>
    );
  }
  statisticOrder = STATISTIC_ORDER.CORE(6);

}

export default SpiritBombSoulConsume;
