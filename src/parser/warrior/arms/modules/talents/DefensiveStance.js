import React from 'react';

import SPELLS from 'common/SPELLS/talents/warrior';
import SpellIcon from 'common/SpellIcon';
import SpellLink from 'common/SpellLink';
import { formatThousands, formatNumber } from 'common/format';
import Analyzer from 'parser/core/Analyzer';
import StatisticBox, { STATISTIC_ORDER } from 'interface/others/StatisticBox';

/**
 * A defensive combat state that reduces all damage you take by 20%,
 * and all damage you deal by 10%. Lasts 0 sec.
 */

// TODO: Add a suggestion regarding having this up too little

const DEFENSIVE_STANCE_DR = 0.2;
const DEFENSIVE_STANCE_DL = 0.1;
const MAX_WIDTH = .9;

class DefensiveStance extends Analyzer {
  perSecond(amount) {
    return amount / this.owner.fightDuration * 1000;
  }
  damageTradeoff() {
    let tradeoff = this.totalDamageMitigated / (this.totalDamageLost + this.totalDamageMitigated);
    if(tradeoff > MAX_WIDTH) {
      tradeoff = MAX_WIDTH;
    }
    else if(tradeoff < 1 - MAX_WIDTH) {
      tradeoff = 1 - MAX_WIDTH;
    }
    return tradeoff;
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
        position={STATISTIC_ORDER.CORE(5)}
        icon={<SpellIcon id={SPELLS.DEFENSIVE_STANCE_TALENT.id} />}
        value={`≈${formatNumber(this.drps)} DRPS, ${formatNumber(this.dlps)} DLPS`}
        label="Damage reduced & lost"
        tooltip={tooltip}
        footer={footer}
        footerStyle={{ overflow: 'hidden' }}
      />
    );
  }
  
  suggestions(when) {
    when(this.totalDamageLost).isGreaterThan(this.totalDamageMitigated)
      .addSuggestion((suggest, dl, dr) => {
        return suggest('While Defensive Stance was up, your damage done was reduced by more than the damage you mitigated. Ensure that you are only using Defensive Stance when you are about to take a lot of damage and that you cancel it quickly to minimize the time spent dealing less damage.')
          .icon(SPELLS.DEFENSIVE_STANCE_TALENT.icon)
          .actual(`A total of ${formatNumber(dl)} of your damage has been reduced compared to ${formatNumber(dr)} of the damage from the boss.`)
          .recommended('Reduced damage taken should be higher than your reduced damage.');
      });
    when(this.totalDamageMitigated).isLessThan(1)
      .addSuggestion((suggest) => {
      return suggest(<> You never used <SpellLink id={SPELLS.DEFENSIVE_STANCE_TALENT.id} />. Try to use it to reduce incoming damage or use another talent that would be more useful. </>)
        .icon(SPELLS.DEFENSIVE_STANCE_TALENT.icon);
      });
  }
}

export default DefensiveStance;
