import React from 'react';

import SPELLS from 'common/SPELLS';
import { formatNumber, formatPercentage } from 'common/format';
import { calculateAzeriteEffects } from 'common/stats';
import Analyzer, { SELECTED_PLAYER } from 'parser/core/Analyzer';
import ItemStatistic from 'interface/statistics/ItemStatistic';
import BoringSpellValueText from 'interface/statistics/components/BoringSpellValueText';
import ArmorIcon from 'interface/icons/Armor';
import AvoidanceIcon from 'interface/icons/Avoidance';
import StatTracker from 'parser/shared/modules/StatTracker';
import Events from 'parser/core/Events';

const gemhideStats = traits => Object.values(traits).reduce((obj, rank) => {
  const [avoidance, armor] = calculateAzeriteEffects(SPELLS.GEMHIDE.id, rank);
  obj.avoidance += avoidance;
  obj.armor += armor;
  return obj;
}, {
  avoidance: 0,
  armor: 0,
});

/**
 * Gemhide
 * When dealt damage greater than 10% of your maximum health, gain 95 Avoidance and 475 Armor for 10 sec.
 *
 * Example report: /report/ABH7D8W1Qaqv96mt/2-Mythic+Taloc+-+Kill+(4:12)/Ghaz/statistics
 */
class Gemhide extends Analyzer {
  static dependencies = {
    statTracker: StatTracker,
  };

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

    this.statTracker.add(SPELLS.GEMHIDE_BUFF.id, {
      armor,
      avoidance,
    });
    this.addEventListener(Events.damage.to(SELECTED_PLAYER), this.onDamageTaken);
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

  onDamageTaken(event) {
    if (event.sourceIsFriendly) {
      return;
    }

    this._totalHits += 1;
    this._hitsMitigated += this.selectedCombatant.hasBuff(SPELLS.GEMHIDE_BUFF.id) ? 1 : 0;
  }

  statistic() {
    return (
      <ItemStatistic
        size="flexible"
        tooltip={(
          <>
            Gemhide grants <strong>{this.armor} Armor</strong> and <strong>{this.avoidance} Avoidance</strong> while active.<br />
            It was active for <strong>{formatPercentage(this.uptime)}%</strong> of the fight, mitigating <strong>{formatPercentage(this.pctHitsMitigated)}%</strong> of incoming hits.
          </>
        )}
      >
        <BoringSpellValueText spell={SPELLS.GEMHIDE}>
          <ArmorIcon /> {formatNumber(this.avgArmor)} <small>average Armor</small> <br />
          <AvoidanceIcon /> {formatNumber(this.avgAvoidance)} <small>average Avoidance</small>
        </BoringSpellValueText>
      </ItemStatistic>
    );
  }
}

export default Gemhide;
