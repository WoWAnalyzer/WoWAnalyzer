import React from 'react';

import SPELLS from 'common/SPELLS/TALENTS/WARRIOR';
import SpellIcon from 'common/SpellIcon';
import { formatThousands, formatNumber } from 'common/format';
import Analyzer from 'Parser/Core/Analyzer';
import StatisticBox, { STATISTIC_ORDER } from 'Interface/Others/StatisticBox';

class DefensiveStance extends Analyzer {
  perSecond(amount) {
    return amount / this.owner.fightDuration * 1000;
  }
  totalDamageMitigated = 0;

  get drps() {
    return this.perSecond(this.totalDamageMitigated);
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
  }

  handleDamageTaken(event) {
    if(this.selectedCombatant.hasBuff(SPELLS.DEFENSIVE_STANCE_TALENT.id)) {
      this.totalDamageMitigated += (event.mitigated || 0);
    }
  }

  statistic() {
    const tooltip = `
      <b>Total:</b><br />
      Effective damage reduction: ${formatThousands(this.totalDamageMitigated)} damage (${formatThousands(this.perSecond(this.totalDamageMitigated))} DRPS)<br /><br />`;
    const footer = (
      <div className="statistic-bar">
        <div
          className="stat-health-bg"
          data-tip={`You effectively reduced damage taken by a total of ${formatThousands(this.totalDamageMitigated)} damage (${formatThousands(this.perSecond(this.totalDamageMitigated))} DRPS).`}
        >
          <img src="/img/shield.png" alt="Damage reduced" />
        </div>
      </div>
    );

    return (
      <StatisticBox
        position={STATISTIC_ORDER.OPTIONAL(60)}
        icon={<SpellIcon id={SPELLS.DEFENSIVE_STANCE_TALENT.id} />}
        value={`≈${formatNumber(this.drps)} DRPS`}
        label="Damage reduced"
        tooltip={tooltip}
        footer={footer}
        footerStyle={{ overflow: 'hidden' }}
      />
    );
  }
}

export default DefensiveStance;
