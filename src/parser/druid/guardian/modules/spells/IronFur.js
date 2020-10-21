import React from 'react';
import { formatPercentage } from 'common/format';
import SCHOOLS from 'game/MAGIC_SCHOOLS';
import SpellIcon from 'common/SpellIcon';
import SpellLink from 'common/SpellLink';
import StatisticBox, { STATISTIC_ORDER } from 'interface/others/StatisticBox';
import Analyzer, { SELECTED_PLAYER } from 'parser/core/Analyzer';
import SPELLS from 'common/SPELLS';
import Events from 'parser/core/Events';
import { i18n } from '@lingui/core';
import { t } from '@lingui/macro';

const debug = false;

class IronFur extends Analyzer {
  _hitsPerStack = [];

  constructor(options){
    super(options);
    this.addEventListener(Events.damage.to(SELECTED_PLAYER), this.onDamageTaken);
    this.addEventListener(Events.fightend, this.onFightend);
  }

  registerHit(stackCount) {
    if (!this._hitsPerStack[stackCount]) {
      this._hitsPerStack[stackCount] = 0;
    }

    this._hitsPerStack[stackCount] += 1;
  }

  onDamageTaken(event) {
    // Physical
    if (event.ability.type === SCHOOLS.ids.PHYSICAL) {
      const ironfur = this.selectedCombatant.getBuff(SPELLS.IRONFUR.id);
      this.registerHit(ironfur ? ironfur.stacks : 0);
    }
  }

  get hitsMitigated() {
    return this._hitsPerStack.slice(1).reduce((sum, x) => sum + x, 0);
  }

  get hitsUnmitigated() {
    return this._hitsPerStack[0] || 0;
  }

  get ironfurStacksApplied() {
    return this._hitsPerStack.reduce((sum, x, i) => sum + (x * i), 0);
  }

  get totalHitsTaken() {
    return this._hitsPerStack.reduce((sum, x) => sum + x, 0);
  }

  get overallIronfurUptime() {
    // Avoid NaN display errors
    if (this.totalHitsTaken === 0) {
      return 0;
    }

    return this.ironfurStacksApplied / this.totalHitsTaken;
  }

  get percentOfHitsMitigated() {
    if (this.totalHitsTaken === 0) {
      return 0;
    }
    return this.hitsMitigated / this.totalHitsTaken;
  }

  computeIronfurUptimeArray() {
    return this._hitsPerStack.map(hits => hits / this.totalHitsTaken);
  }

  onFightend() {
    if (debug) {
      console.log(`Hits with ironfur ${this.hitsMitigated}`);
      console.log(`Hits without ironfur ${this.hitsUnmitigated}`);
      console.log('Ironfur uptimes:', this.computeIronfurUptimeArray());
    }
  }

  suggestions(when) {

    when(this.percentOfHitsMitigated).isLessThan(0.90)
      .addSuggestion((suggest, actual, recommended) => suggest(<span>You only had the <SpellLink id={SPELLS.IRONFUR.id} /> buff for {formatPercentage(actual)}% of physical damage taken. You should have the Ironfur buff up to mitigate as much physical damage as possible.</span>)
          .icon(SPELLS.IRONFUR.icon)
          .actual(i18n._(t('druid.guardian.suggestions.ironfur.uptime')`${formatPercentage(actual)}% was mitigated by Ironfur`))
          .recommended(`${Math.round(formatPercentage(recommended))}% or more is recommended`)
          .regular(recommended - 0.10).major(recommended - 0.2));
  }

  statistic() {
    const totalIronFurTime = this.selectedCombatant.getBuffUptime(SPELLS.IRONFUR.id);
    const uptimes = this.computeIronfurUptimeArray().reduce((str, uptime, stackCount) => (
      <>{str}<li>{stackCount} stack{stackCount !== 1 ? 's' : ''}: {formatPercentage(uptime)}%</li></>
    ), null);

    return (
      <StatisticBox
        position={STATISTIC_ORDER.CORE(10)}
        icon={<SpellIcon id={SPELLS.IRONFUR.id} />}
        value={`${formatPercentage(this.percentOfHitsMitigated)}% / ${this.overallIronfurUptime.toFixed(2)}`}
        label="Hits mitigated with Ironfur / Average Stacks"
        tooltip={(
          <>
            Ironfur usage breakdown:
            <ul>
                <li>You were hit <strong>{this.hitsMitigated}</strong> times with your Ironfur buff.</li>
                <li>You were hit <strong>{this.hitsUnmitigated}</strong> times <strong><em>without</em></strong> your Ironfur buff.</li>
            </ul>
            <strong>Uptimes per stack: </strong>
            <ul>
              {uptimes}
            </ul>
            <strong>{formatPercentage(this.percentOfHitsMitigated)}%</strong> of physical attacks were mitigated with Ironfur, and your overall uptime was <strong>{formatPercentage(totalIronFurTime / this.owner.fightDuration)}%</strong>.
          </>
        )}
      />
    );
  }
}

export default IronFur;
