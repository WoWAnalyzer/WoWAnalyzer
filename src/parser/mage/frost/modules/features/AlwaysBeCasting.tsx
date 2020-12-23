import React from 'react';

import CoreAlwaysBeCasting from 'parser/shared/modules/AlwaysBeCasting';

import SPELLS from 'common/SPELLS';
import { formatPercentage } from 'common/format';
import Statistic from 'interface/statistics/Statistic';
import Gauge from 'interface/statistics/components/Gauge';
import STATISTIC_ORDER from 'interface/others/STATISTIC_ORDER';
import SpellLink from 'common/SpellLink';
import { When, ThresholdStyle } from 'parser/core/ParseResults';
import { t, Trans } from '@lingui/macro';

class AlwaysBeCasting extends CoreAlwaysBeCasting {
  get deadTimePercentage() {
    return this.totalTimeWasted / this.owner.fightDuration;
  }

  get overrideDowntimeSuggestionThresholds() {
    return {
      style: ThresholdStyle.PERCENTAGE,
      actual: this.downtimePercentage,
      isGreaterThan: {
        minor: 0.05,
        average: 0.15,
        major: 0.25,
      },
    };
  }

  suggestions(when: When) {
    const boss = this.owner.boss;
    if (!boss || !boss.fight.disableDowntimeSuggestion) {
      when(this.overrideDowntimeSuggestionThresholds)
        .addSuggestion((suggest, actual, recommended) => suggest(<>Your downtime can be improved. Try to Always Be Casting (ABC) and try to reduce the delay between casting spells. If you have to move, try casting instants like <SpellLink id={SPELLS.FIRE_BLAST.id} /> or <SpellLink id={SPELLS.ARCANE_EXPLOSION.id} /> (if there are 2+ targets); even unbuffed <SpellLink id={SPELLS.ICE_LANCE.id} /> spam is better than nothing. Additionally, if you are standing still while waiting for a boss damage reduction or immunity phase to end, you should still be casting <SpellLink id={SPELLS.FROSTBOLT.id} /> to generate procs or build <SpellLink id={SPELLS.ICICLES_BUFF.id} />.</>)
            .icon('spell_mage_altertime')
            .actual(t({
        id: "mage.frost.suggestions.alwaysBeCasting.downtime",
        message: `${formatPercentage(actual)}% downtime`
      }))
            .recommended(`<${formatPercentage(recommended)}% is recommended`));
    }
  }

  statistic() {
    return (
      <Statistic
        position={STATISTIC_ORDER.CORE(10)}
        tooltip={(
          <Trans id="mage.frost.alwaysBeCasting.statistic.tooltip">
            Downtime is available time not used to cast anything (including not having your GCD rolling). This can be caused by delays between casting spells, latency, cast interrupting or just simply not casting anything (e.g. due to movement/stunned).<br />
            <ul>
              <li>You spent <strong>{formatPercentage(this.activeTimePercentage)}%</strong> of your time casting something.</li>
              <li>You spent <strong>{formatPercentage(this.downtimePercentage)}%</strong> of your time casting nothing at all.</li>
            </ul>
          </Trans>
        )}
      >
        <div className="pad">
          <label><Trans id="mage.frost.alwaysBeCasting.statistic.label">Active time</Trans></label>
          <Gauge value={this.activeTimePercentage} />
        </div>
      </Statistic>
    );
  }
}

export default AlwaysBeCasting;
