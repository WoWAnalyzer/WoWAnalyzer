import React from 'react';

import CoreAlwaysBeCasting from 'parser/shared/modules/AlwaysBeCasting';

import SPELLS from 'common/SPELLS';
import { formatPercentage } from 'common/format';
import Statistic from 'interface/statistics/Statistic';
import Gauge from 'interface/statistics/components/Gauge';
import STATISTIC_ORDER from 'interface/others/STATISTIC_ORDER';
import SpellLink from 'common/SpellLink';

class AlwaysBeCasting extends CoreAlwaysBeCasting {
  get deadTimePercentage() {
    return this.totalTimeWasted / this.owner.fightDuration;
  }

  get downtimeSuggestionThresholds() {
    return {
      actual: this.downtimePercentage,
      isGreaterThan: {
        minor: 0.05,
        average: 0.15,
        major: 0.25,
      },
      style: 'percentage',
    };
  }

  suggestions(when: any) {
    const boss = this.owner.boss;
    if (!boss || !boss.fight.disableDowntimeSuggestion) {
      when(this.downtimeSuggestionThresholds)
        .addSuggestion((suggest: any, actual: any, recommended: any) => {
          return suggest(<span>Your downtime can be improved. Try to Always Be Casting (ABC) and try to reduce the delay between casting spells. If you have to move, try casting instants; even unbuffed <SpellLink id={SPELLS.ICE_LANCE.id} /> spam is better than nothing. Additionally, if you are standing still while waiting for a boss damage reduction or immunity phase to end, you should still be casting <SpellLink id={SPELLS.FROSTBOLT.id} /> to generate procs or build <SpellLink id={SPELLS.ICICLES_BUFF.id} />.</span>)
            .icon('spell_mage_altertime')
            .actual(`${formatPercentage(actual)}% downtime`)
            .recommended(`<${formatPercentage(recommended)}% is recommended`);
        });
    }
  }

  statistic() {
    return (
      <Statistic
        position={STATISTIC_ORDER.CORE(10)}
        tooltip={(
          <>
            Downtime is available time not used to cast anything (including not having your GCD rolling). This can be caused by delays between casting spells, latency, cast interrupting or just simply not casting anything (e.g. due to movement/stunned).<br />
            <ul>
              <li>You spent <strong>{formatPercentage(this.activeTimePercentage)}%</strong> of your time casting something.</li>
              <li>You spent <strong>{formatPercentage(this.downtimePercentage)}%</strong> of your time casting nothing at all.</li>
            </ul>
          </>
        )}
      >
        <div className="pad">
          <label>Active time</label>
          <Gauge value={this.activeTimePercentage} />
        </div>
      </Statistic>
    );
  }
}

export default AlwaysBeCasting;
