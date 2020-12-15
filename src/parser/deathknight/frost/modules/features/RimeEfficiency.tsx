import React from 'react';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import { ThresholdStyle, When } from 'parser/core/ParseResults';
import Events, { ApplyBuffEvent, GlobalCooldownEvent, RefreshBuffEvent, RemoveBuffEvent } from 'parser/core/Events';
import SPELLS from 'common/SPELLS';
import SpellLink from 'common/SpellLink';
import { formatPercentage } from 'common/format';
import AbilityTracker from 'parser/shared/modules/AbilityTracker';
import { t } from '@lingui/macro';

import STATISTIC_ORDER from 'interface/others/STATISTIC_ORDER';
import Statistic from 'interface/statistics/Statistic';

import BoringSpellValueText from 'interface/statistics/components/BoringSpellValueText';

const LAG_BUFFER_MS = 100;
const BUFF_DURATION_SEC = 15;

class RimeEfficiency extends Analyzer {
  static dependencies = {
    abilityTracker: AbilityTracker,
  };

  rimeProcs: number = 0;
  lastGCDTime: number = 0;
  lastGCDDuration: number = 0;
  lastProcTime: number = 0;
  refreshedRimeProcs: number = 0;
  expiredRimeProcs: number = 0;

  constructor(options: Options) {
    super(options);

    this.addEventListener(Events.applybuff.by(SELECTED_PLAYER).spell(SPELLS.RIME), this.onApplyBuff);
    this.addEventListener(Events.removebuff.by(SELECTED_PLAYER).spell(SPELLS.RIME), this.onRemoveBuff);
    this.addEventListener(Events.refreshbuff.by(SELECTED_PLAYER).spell(SPELLS.RIME), this.onRefreshBuff);
    this.addEventListener(Events.GlobalCooldown, this.onGlobalCooldown);
  }

  onApplyBuff(event: ApplyBuffEvent) {
    this.rimeProcs += 1;
    this.lastProcTime = event.timestamp;
  }

  onRemoveBuff(event: RemoveBuffEvent) {
    const durationHeld = event.timestamp - this.lastProcTime;
    if (durationHeld > (BUFF_DURATION_SEC * 1000)) {
      this.expiredRimeProcs += 1;
    }
  }

  onRefreshBuff(event: RefreshBuffEvent) {
    const timeSinceGCD = event.timestamp - this.lastGCDTime;
    if (timeSinceGCD < this.lastGCDDuration + LAG_BUFFER_MS) {
      return;
    }
    this.refreshedRimeProcs += 1;
  }

  onGlobalCooldown(event: GlobalCooldownEvent) {
    this.lastGCDTime = event.timestamp;
    this.lastGCDDuration = event.duration;
  }

  get totalWastedProcs() {
    return this.refreshedRimeProcs + this.expiredRimeProcs;
  }

  get wastedProcRate() {
    return this.totalWastedProcs / this.rimeProcs;
  }

  get efficiency() {
    return 1 - this.wastedProcRate;
  }

  get suggestionThresholds() {
    return {
      actual: this.efficiency,
      isLessThan: {
        minor: .95,
        average: .90,
        major: .85,
      },
      style: ThresholdStyle.PERCENTAGE,
      suffix: 'Average',
    };
  }

  suggestions(when: When) {
    when(this.suggestionThresholds)
      .addSuggestion((suggest, actual, recommended) => suggest(<> You are wasting <SpellLink id={SPELLS.RIME.id} /> procs. You should be casting <SpellLink id={SPELLS.HOWLING_BLAST.id} /> as soon as possible when you have a Rime proc to avoid wasting it.</>)
        .icon(SPELLS.RIME.icon)
        .actual(t({
      id: "deathknight.frost.suggestions.rime.wastedProcs",
      message: `${formatPercentage(this.wastedProcRate)}% of Rime procs were either refreshed and lost or expired without being used`
    }))
        .recommended(`<${recommended} is recommended`));
  }

  statistic() {
    return (
      <Statistic
        position={STATISTIC_ORDER.CORE(5)}
        size="flexible"
        tooltip={`You wasted ${this.totalWastedProcs} out of ${this.rimeProcs} Rime procs (${formatPercentage(this.wastedProcRate)}%).  ${this.expiredRimeProcs} procs expired without being used and ${this.refreshedRimeProcs} procs were overwritten by new procs.`}
      >
        <BoringSpellValueText spell={SPELLS.RIME}>
          <>
            {formatPercentage(this.efficiency)} % <small>efficiency</small>
          </>
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default RimeEfficiency;
