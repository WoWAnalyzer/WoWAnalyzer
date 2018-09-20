import React from 'react';

import SPELLS from 'common/SPELLS/TALENTS/WARRIOR';
import SpellIcon from 'common/SpellIcon';
import { formatThousands, formatNumber } from 'common/format';
import Analyzer from 'Parser/Core/Analyzer';
import StatisticBox, { STATISTIC_ORDER } from 'Interface/Others/StatisticBox';

const DEFENSIVE_STANCE_DR = 0.2;
const DEFENSIVE_STANCE_DL = 0.1;
const MIN_WIDTH = .1;

class DefensiveStance extends Analyzer {
  perSecond(amount) {
    return amount / this.owner.fightDuration * 1000;
  }
  damageTradeoff() {
    if(this.totalDamageLost === 0) {
      return this.totalDamageMitigated / (this.totalDamageMitigated * (1 + MIN_WIDTH));
    }
    return this.totalDamageMitigated / (this.totalDamageLost + this.totalDamageMitigated);
  }
  totalDamageMitigated = 0;
  totalDamageLost = 0;

  get drps() {
    return this.perSecond(this.totalDamageMitigated);
  }

  get dlps() {
    return this.perSecond(this.totalDamageLost);
  }

  constructor(...args) {
    super(...args);
    this.active = this.selectedCombatant.hasTalent(SPELLS.DEFENSIVE_STANCE_TALENT.id);
    if (!this.active) {
      return;
    }
    this.addEventListener('damage', this.handleDamageTaken, {
      toPlayer: true,
    });
    this.addEventListener('damage', this.handleDamageDone, {
      byPlayer: true,
    });
  }

  handleDamageTaken(event) {
    if(this.selectedCombatant.hasBuff(SPELLS.DEFENSIVE_STANCE_TALENT.id)) {
      const preMitigatedDefensiveStance = (event.amount + event.absorbed) / (1 - DEFENSIVE_STANCE_DR);
      this.totalDamageMitigated += preMitigatedDefensiveStance * DEFENSIVE_STANCE_DR;
    }
  }
  handleDamageDone(event) {
    if(this.selectedCombatant.hasBuff(SPELLS.DEFENSIVE_STANCE_TALENT.id)) {
      const damageDone = event.amount / (1 - DEFENSIVE_STANCE_DL);
      this.totalDamageLost += damageDone * DEFENSIVE_STANCE_DL;
    }
  }

  statistic() {
    const tooltip = `
      <b>Total:</b><br />
      Effective damage reduction: ${formatThousands(this.totalDamageMitigated)} damage (${formatThousands(this.perSecond(this.totalDamageMitigated))} DRPS)<br />
      Effective damage lost: ${formatThousands(this.totalDamageLost)} damage (${formatThousands(this.perSecond(this.totalDamageLost))} DLPS)<br /><br />`;
    const footer = (
      <div className="statistic-bar">
        <div
          className="stat-health-bg"
          style={{ width: `${this.damageTradeoff() * 100}%` }}
          data-tip={`You effectively reduced damage taken by a total of ${formatThousands(this.totalDamageMitigated)} damage (${formatThousands(this.perSecond(this.totalDamageMitigated))} DRPS).`}
        >
          <img src="/img/shield.png" alt="Damage reduced" />
        </div>
        <div
          className="remainder DeathKnight-bg"
          data-tip={`You lost ${formatThousands(this.totalDamageLost)} damage through the use of Defensive Stance. (${formatThousands(this.perSecond(this.totalDamageLost))} DLPS).`}
        >
          <img src="/img/sword.png" alt="Damage lost" />
        </div>
      </div>
    );

    return (
      <StatisticBox
        position={STATISTIC_ORDER.OPTIONAL(60)}
        icon={<SpellIcon id={SPELLS.DEFENSIVE_STANCE_TALENT.id} />}
        value={`≈${formatNumber(this.drps)} DRPS, ${formatNumber(this.dlps)} DLPS`}
        label="Damage reduced & lost"
        tooltip={tooltip}
        footer={footer}
        footerStyle={{ overflow: 'hidden' }}
      />
    );
  }
}

export default DefensiveStance;
