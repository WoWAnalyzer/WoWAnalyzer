import React from 'react';
import Analyzer from 'Parser/Core/Analyzer';
import { formatNumber, formatPercentage } from 'common/format';
import { STATISTIC_ORDER } from 'Interface/Others/StatisticBox';
import SPELLS from 'common/SPELLS';
import ExpandableTalentBox from 'Interface/Others/ExpandableTalentBox';
import SpellIcon from 'common/SpellIcon';

import * as talents_15 from './15';
import * as talents_30 from './30';
import * as talents_45 from './45';
import * as talents_60 from './60';
import * as talents_75 from './75';
import * as talents_90 from './90';
import * as talents_100 from './100';

class TalentCard extends Analyzer {
  statistic() {
    return (
      <ExpandableTalentBox
        icon={<SpellIcon id={SPELLS.ECHO_OF_LIGHT.id} />}
        value={`${formatNumber(this.healing)}`}
        label={(
          <dfn data-tip={`Echo of Light healing breakdown. As our mastery is often very finicky, this could end up wrong in various situations. Please report any logs that seem strange to @enragednuke on the WoWAnalyzer discord.<br/><br/>
            <strong>Please do note this is not 100% accurate.</strong> It is probably around 90% accurate. <br/><br/>
            Also, a mastery value can be more than just "healing done times mastery percent" because Echo of Light is based off raw healing. If the heal itself overheals, but the mastery does not, it can surpass that assumed "limit". Don't use this as a reason for a "strange log" unless something is absurdly higher than its effective healing.`}
          >
            Echo of Light
          </dfn>
        )}
      >
        <div>
          Values under 1% of total are omitted.
        </div>
        <table className="table table-condensed">
          <thead>
            <tr>
              <th>Spell</th>
              <th>Amount</th>
              <th>% of Total</th>
              <th>% OH</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Spell</td>
              <td>Amount</td>
              <td>% of Total</td>
              <td>% OH</td>
            </tr>
          </tbody>
        </table>
      </ExpandableTalentBox>
    );
  }

  statisticOrder = STATISTIC_ORDER.CORE(2);

}

export default TalentCard;
