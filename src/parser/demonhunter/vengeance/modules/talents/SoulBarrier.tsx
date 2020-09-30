import React from 'react';

import Analyzer, { SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { AbsorbedEvent, ApplyBuffEvent, RemoveBuffEvent } from 'parser/core/Events';
import { ThresholdStyle, When } from 'parser/core/ParseResults';
import Enemies from 'parser/shared/modules/Enemies';
import DamageTracker from 'parser/shared/modules/AbilityTracker';

import SPELLS from 'common/SPELLS/index';
import SpellLink from 'common/SpellLink';
import { formatPercentage, formatNumber } from 'common/format';
import TalentStatisticBox from 'interface/others/TalentStatisticBox';
import STATISTIC_ORDER from 'interface/others/STATISTIC_ORDER';

class SoulBarrier extends Analyzer {
  static dependencies = {
    damageTracker: DamageTracker,
    enemies: Enemies,
  };
  protected damageTracker!: DamageTracker;
  protected enemies!: Enemies;

  casts = 0;
  totalAbsorbed = 0;
  buffApplied = 0;
  buffRemoved = 0;
  buffLength = 0;
  avgBuffLength = 0;
  totalBuffLength = 0;

  constructor(options: any) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(SPELLS.SOUL_BARRIER_TALENT.id);
    this.addEventListener(Events.applybuff.to(SELECTED_PLAYER).spell(SPELLS.SOUL_BARRIER_TALENT), this.onBarrierApply);
    this.addEventListener(Events.absorbed.to(SELECTED_PLAYER).spell(SPELLS.SOUL_BARRIER_TALENT), this.onBarrierAbsorb);
    this.addEventListener(Events.removebuff.to(SELECTED_PLAYER).spell(SPELLS.SOUL_BARRIER_TALENT), this.onBarrierRemove);
  }

  get uptime() {
    return this.selectedCombatant.getBuffUptime(SPELLS.SOUL_BARRIER_TALENT.id) / this.owner.fightDuration;
  }

  onBarrierApply(event: ApplyBuffEvent) {
    this.casts += 1;
    this.buffApplied = event.timestamp;
  }

  onBarrierAbsorb(event: AbsorbedEvent) {
    this.totalAbsorbed += event.amount;
  }

  onBarrierRemove(event: RemoveBuffEvent) {
    this.buffRemoved = event.timestamp;
    this.buffLength = this.buffRemoved - this.buffApplied;
    this.totalBuffLength += this.buffLength;
  }

  get suggestionThresholdsEfficiency() {
    return {
      actual: this.uptime,
      isLessThan: {
        minor: 0.35,
        average: 0.30,
        major: .25,
      },
      style: ThresholdStyle.PERCENTAGE,
    };
  }

  suggestions(when: When) {
    when(this.suggestionThresholdsEfficiency)
      .addSuggestion((suggest, actual, recommended) => {
        return suggest(<>Your uptime with <SpellLink id={SPELLS.SOUL_BARRIER_TALENT.id} /> can be improved.</>)
          .icon(SPELLS.SOUL_BARRIER_TALENT.icon)
          .actual(`${formatPercentage(actual)}% Soul Barrier`)
          .recommended(`>${formatPercentage(recommended)}% is recommended`);
      });
  }

  statistic() {
    const avgBuffLength = (this.totalBuffLength / this.casts) / 1000;
    return (
      <TalentStatisticBox
        icon={undefined}
        talent={SPELLS.SOUL_BARRIER_TALENT.id}
        position={STATISTIC_ORDER.CORE(7)}
        value={`${formatPercentage(this.uptime)} %`}
        label="Soul Barrier uptime"
        tooltip={(
          <>
            Average Buff Length: <strong>{formatNumber(avgBuffLength)} seconds</strong><br />
            Total Damage Absorbed: <strong>{formatNumber(this.totalAbsorbed)}</strong><br />
            Healing <strong>{this.owner.formatItemHealingDone(this.totalAbsorbed)}</strong><br />
            Total Casts: <strong>{this.casts}</strong>
          </>
        )}
      />
    );
  }
}

export default SoulBarrier;
