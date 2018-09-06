import React from 'react';
import Analyzer from 'Parser/Core/Analyzer';
import ExpandableStatisticBox from 'Interface/Others/ExpandableStatisticBox';
import { STATISTIC_ORDER } from 'Interface/Others/StatisticBox';
import SPELLS from 'common/SPELLS/index';
import SpellIcon from 'common/SpellIcon';
import SpellLink from 'common/SpellLink';

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
    return (
      <ExpandableStatisticBox
        position={STATISTIC_ORDER.CORE(6)}
        icon={<SpellIcon id={SPELLS.HOLY_WORDS.id} />}
        value={`${this.totalReduction}  sec`}
        label="Total CD Reduction"
        tooltip={<React.Fragment> <SpellLink id={SPELLS.LIGHT_OF_THE_NAARU_TALENT.id} /> </React.Fragment>}
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
                <td>{e.amount}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </ExpandableStatisticBox>

    );
  }

}

export default HolyWordsReductionBySpell;
