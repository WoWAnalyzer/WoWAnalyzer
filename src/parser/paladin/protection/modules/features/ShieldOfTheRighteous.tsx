import React from 'react';
import { formatPercentage, formatThousands } from 'common/format';
import SpellIcon from 'common/SpellIcon';
import SpellLink from 'common/SpellLink';
import StatisticBox, { STATISTIC_ORDER } from 'interface/others/StatisticBox';
import Analyzer, { SELECTED_PLAYER, Options } from 'parser/core/Analyzer';
import { When, ThresholdStyle } from 'parser/core/ParseResults';
import SPELLS from 'common/SPELLS';
import Events, { CastEvent, DamageEvent } from 'parser/core/Events';
import { shouldIgnore, magic } from 'parser/shared/modules/hit-tracking/utilities';
import Enemies from 'parser/shared/modules/Enemies';

interface CastMetadata {
  castTime: number,
  buffStartTime: number,
  buffEndTime: number,
  melees: number,
  tankbusters: number,
  _event: CastEvent,
}

class ShieldOfTheRighteous extends Analyzer {
  static dependencies = {
    enemies: Enemies,
  };

  protected enemies!: Enemies;

  totalHits = 0;
  sotrHits = 0;
  totalDamageTaken = 0;
  sotrDamageTaken = 0;

  constructor(options: Options) {
    super(options);
    // M+ doesn't have a boss prop
    this.addEventListener(Events.damage.to(SELECTED_PLAYER), this.trackHits);
  }

  trackHits(event: DamageEvent) {
    if(shouldIgnore(this.enemies, event) || magic(event)) {
      return;
    }

    const amount = event.amount + (event.absorbed || 0) + (event.overkill || 0);

    this.totalHits += 1;
    this.totalDamageTaken += amount;
    if(this.selectedCombatant.hasBuff(SPELLS.SHIELD_OF_THE_RIGHTEOUS_BUFF.id)) {
      this.sotrHits += 1;
      this.sotrDamageTaken += amount;
    }
  }

  get hitsMitigatedThreshold() {
    return {
      actual: this.sotrHits / this.totalHits,
      isLessThan: {
        minor: 0.95,
        average: 0.9,
        major: 0.85
      },
      style: ThresholdStyle.PERCENTAGE,
    };
  }

  suggestions(when: When) {
    when(this.hitsMitigatedThreshold)
      .addSuggestion((suggest, actual, recommended) => suggest(<>You should maintain <SpellLink id={SPELLS.SHIELD_OF_THE_RIGHTEOUS.id} /> while actively tanking</>)
        .icon(SPELLS.SHIELD_OF_THE_RIGHTEOUS.icon)
        .actual(`${formatPercentage(actual)}% of hits mitigated by Shield of the Righteous`)
        .recommended(`at least ${formatPercentage(recommended)}% is recommended`));
  }

  statistic() {

    return (
      <StatisticBox
        icon={<SpellIcon id={SPELLS.SHIELD_OF_THE_RIGHTEOUS.id} />}
        value={`${formatPercentage(this.sotrHits / this.totalHits)}%`}
        label="Physical Hits Mitigated"
        tooltip={(
          <>
            Shield of the Righteous usage breakdown:
            <ul>
              <li>You were hit <strong>{this.sotrHits}</strong> times with your Shield of the Righteous buff (<strong>{formatThousands(this.sotrDamageTaken)}</strong> damage).</li>
              <li>You were hit <strong>{this.totalHits - this.sotrHits}</strong> times <strong><em>without</em></strong> your Shield of the Righteous buff (<strong>{formatThousands(this.totalDamageTaken - this.sotrDamageTaken)}</strong> damage).</li>
            </ul>
            <strong>{formatPercentage(this.sotrHits / this.totalHits)}%</strong> of physical attacks were mitigated with Shield of the Righteous.<br />
          </>
        )}
      />
    );
  }
  statisticOrder = STATISTIC_ORDER.CORE(10);
}

export default ShieldOfTheRighteous;
