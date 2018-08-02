import React from 'react';

import SpellIcon from 'common/SpellIcon';
import SPELLS from 'common/SPELLS';
import { formatNumber, formatPercentage } from 'common/format';
import { calculateAzeriteEffects } from 'common/stats';
import Analyzer from 'Parser/Core/Analyzer';
import StatisticBox, { STATISTIC_ORDER } from 'Interface/Others/StatisticBox';

const gemhideStats = traits => Object.values(traits).reduce((obj, rank) => {
  const [avoidance, armor] = calculateAzeriteEffects(SPELLS.GEMHIDE.id, rank);
  obj.avoidance += avoidance;
  obj.armor += armor;
  return obj;
}, {
  avoidance: 0,
  armor: 0,
});

export const STAT_TRACKER = {
  armor: combatant => gemhideStats(combatant.traitsBySpellId[SPELLS.GEMHIDE.id]).armor,
  avoidance: combatant => gemhideStats(combatant.traitsBySpellId[SPELLS.GEMHIDE.id]).avoidance,
};

/**
 * Gemhide
 * When dealt damage greater than 10% of your maximum health, gain 95 Avoidance and 475 Armor for 10 sec.
 *
 * Example report: https://www.warcraftlogs.com/reports/vyfNxYzcHr8mLXZ6#fight=12&type=summary&source=18
 */
class Gemhide extends Analyzer {
  armor = 0;
  avoidance = 0;
  constructor(...args) {
    super(...args);
    this.active = this.selectedCombatant.hasTrait(SPELLS.GEMHIDE.id);
    if (!this.active) {
      return;
    }

    const { armor, avoidance } = gemhideStats(this.selectedCombatant.traitsBySpellId[SPELLS.GEMHIDE.id]);
    this.armor = armor;
    this.avoidance = avoidance;
  }

  get uptime() {
    return this.selectedCombatant.getBuffUptime(SPELLS.GEMHIDE_BUFF.id) / this.owner.fightDuration;
  }
  get avgArmor() {
    return this.uptime * this.armor;
  }
  get avgAvoidance() {
    return this.uptime * this.avoidance;
  }

  _hitsMitigated = 0;
  _totalHits = 0;
  get pctHitsMitigated() {
    return this._hitsMitigated / this._totalHits;
  }

  on_toPlayer_damage(event) {
    if (event.sourceIsFriendly) {
      return;
    }

    this._totalHits += 1;
    this._hitsMitigated += this.selectedCombatant.hasBuff(SPELLS.GEMHIDE_BUFF.id) ? 1 : 0;
  }

  statistic() {
    return (
      <StatisticBox
        position={STATISTIC_ORDER.OPTIONAL()}
        icon={<SpellIcon id={SPELLS.GEMHIDE.id} />}
        value={(
          <React.Fragment>
            {formatNumber(this.avgArmor)} Armor<br />
            {formatNumber(this.avgAvoidance)} Avoidance
          </React.Fragment>
        )}
        label="Avg. Stats from Gemhide"
        tooltip={`Gemhide grants <b>${this.armor} Armor</b> and <b>${this.avoidance} Avoidance</b> while active.<br/>It was active for <b>${formatPercentage(this.uptime)}%</b> of the fight, mitigating <b>${formatPercentage(this.pctHitsMitigated)}%</b> of incoming hits.`}
      />
    );
  }
}

export default Gemhide;
