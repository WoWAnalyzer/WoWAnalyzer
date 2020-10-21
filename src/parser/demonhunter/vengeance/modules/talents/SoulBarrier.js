import React from 'react';

import Analyzer, { SELECTED_PLAYER } from 'parser/core/Analyzer';
import Enemies from 'parser/shared/modules/Enemies';
import DamageTracker from 'parser/shared/modules/AbilityTracker';

import SPELLS from 'common/SPELLS/index';
import SpellLink from 'common/SpellLink';
import { formatPercentage, formatNumber } from 'common/format';
import TalentStatisticBox from 'interface/others/TalentStatisticBox';
import STATISTIC_ORDER from 'interface/others/STATISTIC_ORDER';
import { i18n } from '@lingui/core';
import { t } from '@lingui/macro';
import Events from 'parser/core/Events';

class SoulBarrier extends Analyzer {
  static dependencies = {
    damageTracker: DamageTracker,
    enemies: Enemies,
  };

  casts = 0;
  totalAbsorbed = 0;
  buffApplied = 0;
  buffRemoved = 0;
  buffLength = 0;
  avgBuffLength = 0;
  totalBuffLength = 0;


  constructor(...args) {
    super(...args);
    this.active = this.selectedCombatant.hasTalent(SPELLS.SOUL_BARRIER_TALENT.id);
    this.addEventListener(Events.applybuff.to(SELECTED_PLAYER).spell(SPELLS.SOUL_BARRIER_TALENT), this.onApplyBuff);
    this.addEventListener(Events.absorbed.to(SELECTED_PLAYER).spell(SPELLS.SOUL_BARRIER_TALENT), this.onAbsorb);
    this.addEventListener(Events.removebuff.to(SELECTED_PLAYER).spell(SPELLS.SOUL_BARRIER_TALENT), this.onRemoveBuff);
  }

  get uptime() {
    return this.selectedCombatant.getBuffUptime(SPELLS.SOUL_BARRIER_TALENT.id) / this.owner.fightDuration;
  }

  onApplyBuff(event) {
    this.casts += 1;
    this.buffApplied = event.timestamp;
  }

  onAbsorb(event) {
    this.totalAbsorbed+= event.amount;
  }

  onRemoveBuff(event) {
    if (event.ability.guid !== SPELLS.SOUL_BARRIER_TALENT.id) {
      return;
    }
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
      style: 'percentage',
    };
  }

  suggestions(when) {
    when(this.suggestionThresholdsEfficiency)
      .addSuggestion((suggest, actual, recommended) => suggest(<>Your uptime with <SpellLink id={SPELLS.SOUL_BARRIER_TALENT.id} /> can be improved.</>)
          .icon(SPELLS.SOUL_BARRIER_TALENT.icon)
          .actual(i18n._(t('demonhunter.vengeance.suggestions.soulBarrier.uptime')`${formatPercentage(actual)}% Soul Barrier`))
          .recommended(`>${formatPercentage(recommended)}% is recommended`));
  }

  statistic() {
    const avgBuffLength = (this.totalBuffLength / this.casts) / 1000;
    return (
      <TalentStatisticBox
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
