import React from 'react';
import { formatPercentage } from 'common/format';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';
import UptimeIcon from 'interface/icons/Uptime';
import Statistic from 'parser/ui/Statistic';
import { SpellLink } from 'interface';
import { SpellIcon } from 'interface';
import BoringValue from 'parser/ui/BoringValueText';

import SPELLS from 'common/SPELLS';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { CastEvent, HealEvent } from 'parser/core/Events';
import { t } from '@lingui/macro';
import { ThresholdStyle, When } from 'parser/core/ParseResults';

const DURATION = 30000;

class Efflorescence extends Analyzer {
  precastUptime = 0;
  castUptime = 0;
  castTimestamps: number[] = []; // TODO this array not really used yet, but I plan to use it to catch early refreshes

  constructor(options: Options) {
    super(options);
    this.addEventListener(Events.cast.by(SELECTED_PLAYER).spell(SPELLS.EFFLORESCENCE_CAST), this.onCast);
    this.addEventListener(Events.heal.by(SELECTED_PLAYER).spell(SPELLS.EFFLORESCENCE_HEAL), this.onHeal);
  }

  onCast(event: CastEvent) {
    if (this.lastCastTimestamp !== null) {
      this.castUptime += Math.min(DURATION, event.timestamp - this.lastCastTimestamp);
    }
    this.castTimestamps.push(event.timestamp);
  }

  onHeal(event: HealEvent) {
    // if efflo heals before the first cast, we assume it was from a precast
    if (this.castTimestamps.length === 0) {
      this.precastUptime = event.timestamp - this.owner.fight.start_time;
    }
  }

  get lastCastTimestamp() {
    return this.castTimestamps.length === 0 ? null : this.castTimestamps[this.castTimestamps.length - 1];
  }

  get uptime() {
    // uptime from a cast is only tallied in 'castUptime' on the *next* cast, so the most recent cast must be handled special
    const activeUptime = this.lastCastTimestamp === null ? 0 : Math.min(DURATION, this.owner.currentTimestamp - this.lastCastTimestamp);
    return this.precastUptime + this.castUptime + activeUptime;
  }

  get uptimePercent() {
    return this.uptime / this.owner.fightDuration;
  }

  get suggestionThresholds() {
    return {
      actual: this.uptimePercent,
      isLessThan: {
        minor: 0.90,
        average: 0.50,
        major: 0.25,
      },
      style: ThresholdStyle.PERCENTAGE,
    };
  }

  suggestions(when: When) {
    when(this.suggestionThresholds)
      .addSuggestion((suggest, actual, recommended) => suggest(<span>Your <SpellLink id={SPELLS.EFFLORESCENCE_CAST.id} /> uptime can be improved.</span>)
          .icon(SPELLS.EFFLORESCENCE_CAST.icon)
          .actual(t({
      id: "druid.restoration.efflorescence.uptime",
      message: `${formatPercentage(this.uptimePercent)}% uptime`
    }))
          .recommended(`>${formatPercentage(recommended)}% is recommended`));

    // TODO suggestion for early refreshes
  }

  statistic() {
    return (
      <Statistic
        position={STATISTIC_ORDER.CORE(12)}
        size="flexible"
      >
        <BoringValue label={<><SpellIcon id={SPELLS.EFFLORESCENCE_CAST.id} /> Efflorescence uptime</>} >
          <>
            <UptimeIcon /> {formatPercentage(this.uptimePercent)} %
          </>
        </BoringValue>
      </Statistic>
    );
  }
}

export default Efflorescence;
