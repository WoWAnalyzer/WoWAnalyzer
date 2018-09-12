import React from 'react';
import Analyzer from 'Parser/Core/Analyzer';
import ExpandableStatisticBox from 'Interface/Others/ExpandableStatisticBox';
import { STATISTIC_ORDER } from 'Interface/Others/StatisticBox';
import { formatPercentage } from 'common/format';
import SPELLS from 'common/SPELLS/index';
import SpellIcon from 'common/SpellIcon';

import HolyWords from './HolyWords';


class HolyWordsReductionBySpell extends Analyzer {
  static dependencies = {
    holyWords: HolyWords,
  };

  totalReductionDuration = 0;

  get totalReduction () {
    this.totalReductionDuration = Object.values(this.holyWords.reductionAmountBySpell).map(obj => obj.amount).reduce((total, casts) => total + casts, 0);
    return this.totalReductionDuration;
  }


  statistic() {
    const reductionRatio = this.totalReduction / (this.owner.fightDuration + this.totalReduction);
    return (
      <ExpandableStatisticBox
        position={STATISTIC_ORDER.CORE(6)}
        icon={<SpellIcon id={SPELLS.HOLY_WORDS.id} />}
        value={`${formatPercentage(reductionRatio)} %`}
        label="Effective HolyWord reduction"
        tooltip={`The % above is the total CD reduction normalize against the fight length.</br>
                  This allows for comparision across different fights more easily.</br></br>
                  Talents like <b>Light of the Naaru</b> and <b>Apotheosis</b> which provide </br>
                  further CD reduction are taken into account when calculating these numbers.</br></br>
                  If you took the talent <b>Holy Word Salvation</b>, <b>Holy Words Sanctify	and Serenity</b>
                  will show since they provide CD reduction for <b>Holy World Salvation</b>.`}

      >
        <table className="table table-condensed">
          <thead>
            <tr>
              <th>Name</th>
              <th>Reduction Amount</th>
            </tr>
          </thead>
          <tbody>
            {Object.values(this.holyWords.reductionAmountBySpell).map((e, i) => (
              <tr key={i}>
                <th>{e.name}</th>
                <td>{e.amount / 1000} seconds</td>
              </tr>
            ))}
          </tbody>
        </table>
      </ExpandableStatisticBox>

    );
  }

}

export default HolyWordsReductionBySpell;
