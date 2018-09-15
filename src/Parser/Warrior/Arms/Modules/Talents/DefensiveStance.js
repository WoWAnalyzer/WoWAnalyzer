import React from 'react';

import SPELLS from 'common/SPELLS/TALENTS/WARRIOR';
import fetchWcl from 'common/fetchWclApi';
import SpellIcon from 'common/SpellIcon';
import { formatThousands, formatNumber } from 'common/format';
import Analyzer from 'Parser/Core/Analyzer';
import LazyLoadStatisticBox, { STATISTIC_ORDER } from 'Interface/Others/LazyLoadStatisticBox';
import makeWclUrl from 'common/makeWclUrl';

const DEFENSIVE_STANCE_DAMAGE_REDUCED = 0.25;

class DefensiveStance extends Analyzer {
  perSecond(amount) {
    return amount / this.owner.fightDuration * 1000;
  }
  totalDamageMitigated = 0;

  get drps() {
    return this.perSecond(this.totalDamageMitigated);
  }

  get filter() {
    const playerName = this.owner.player.name;
    // Include any damage while selected player has Defensive Stance active.
    return `type='applybuff' AND ability.id=${SPELLS.DEFENSIVE_STANCE_TALENT.id} TO target.name='${playerName}' AND type='removebuff' AND ability.id=${SPELLS.DEFENSIVE_STANCE_TALENT.id} END`;
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
    this.totalDamageMitigated += (event.mitigated || 0);
  }

  loaded = false;
  load() {
    return fetchWcl(`report/tables/damage-taken/${this.owner.report.code}`, {
      start: this.owner.fight.start_time,
      end: this.owner.fight.end_time,
      filter: this.filter,
    })
      .then(json => {
        console.log('Received damage taken while Defensive Stance is up', json);
        const actualDamageTaken = json.entries
          .filter(entry => entry.id === this.owner.playerId)
          .reduce((damageTaken, entry) => damageTaken + entry.total, 0);
        const damageMitigated = actualDamageTaken * DEFENSIVE_STANCE_DAMAGE_REDUCED;
        this.totalDamageMitigated += damageMitigated;
        this.loaded = true;
      });
  }

  statistic() {
    const tooltip = this.loaded ? `
      <b>Total:</b><br />
      Effective damage reduction: ${formatThousands(this.totalDamageMitigated)} damage (${formatThousands(this.perSecond(this.totalDamageMitigated))} DRPS)<br /><br />
    ` : 'Click to load the required data.';
    const footer = this.loaded && (
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
      <LazyLoadStatisticBox
        position={STATISTIC_ORDER.OPTIONAL(60)}
        loader={this.load.bind(this)}
        icon={<SpellIcon id={SPELLS.DEFENSIVE_STANCE_TALENT.id} />}
        value={`≈${formatNumber(this.drps)} DRPS`}
        label="Damage reduced"
        tooltip={tooltip}
        footer={footer}
        footerStyle={{ overflow: 'hidden' }}
        warcraftLogs={makeWclUrl(this.owner.report.code, {
          fight: this.owner.fightId,
          type: 'damage-taken',
          pins: `2$Off$#244F4B$expression$${this.filter}`,
          view: 'events',
        })}
      />
    );
  }
}

export default DefensiveStance;
