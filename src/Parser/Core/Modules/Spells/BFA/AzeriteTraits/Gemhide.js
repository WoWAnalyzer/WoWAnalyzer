import React from 'react';
import SpellIcon from 'common/SpellIcon';
import { formatNumber, formatPercentage } from 'common/format';
import StatisticBox, { STATISTIC_ORDER } from 'Interface/Others/StatisticBox';
import Analyzer from 'Parser/Core/Analyzer';
import { calculateAzeriteEffects } from 'common/stats';
import SPELLS from 'common/SPELLS';

export function gemhideStats(combatant) {
  if (!combatant.hasTrait(SPELLS.GEMHIDE.id)) {
    return null;
  }
  let armor = 0;
  let avoidance = 0;
  for (const rank of combatant.traitsBySpellId[SPELLS.GEMHIDE.id]) {
    const [av, ar] = calculateAzeriteEffects(SPELLS.GEMHIDE.id, rank);
    armor += ar;
    avoidance += av;
  }
  return { armor, avoidance };
}

export const STAT_TRACKER = {
  armor: (combatant) => gemhideStats(combatant).armor,
  avoidance: (combatant) => gemhideStats(combatant).avoidance,
};

class Gemhide extends Analyzer {
  armor = 0;
  avoidance = 0;
  constructor(...args) {
    super(...args);
    const resp = gemhideStats(this.selectedCombatant);
    if (resp === null) {
      this.active = false;
      return;
    }
    const { armor, avoidance } = resp;
    this.armor += armor;
    this.avoidance += avoidance;
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
        label={'Avg. Stats from Gemhide'}
        tooltip={`Gemhide grants <b>${this.armor} Armor</b> and <b>${this.avoidance} Avoidance</b> while active.<br/>It was active for <b>${formatPercentage(this.uptime)}%</b> of the fight, mitigating <b>${formatPercentage(this.pctHitsMitigated)}%</b> of incoming hits.`}
      />
    );
  }
}

export default Gemhide;
