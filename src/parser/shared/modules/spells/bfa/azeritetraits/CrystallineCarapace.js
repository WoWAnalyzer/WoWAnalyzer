import React from 'react';

import SPELLS from 'common/SPELLS/index';
import { formatNumber, formatPercentage } from 'common/format';
import { calculateAzeriteEffects } from 'common/stats';
import Analyzer, { SELECTED_PLAYER } from 'parser/core/Analyzer';
import TraitStatisticBox, { STATISTIC_ORDER } from 'interface/others/TraitStatisticBox';
import StatTracker from 'parser/shared/modules/StatTracker';
import Events from 'parser/core/Events';

const crystallineCarapaceStats = traits => Object.values(traits).reduce((total, rank) => {
  const [armor] = calculateAzeriteEffects(SPELLS.CRYSTALLINE_CARAPACE.id, rank);
  return total + armor;
}, 0);

/**
 * Crystalline Carapace
 * When dealt damage greater than 10% of your maximum health, gain 56 Armor and cause melee attackers to suffer 65 Physical damage.
 *
 * Example report: https://www.warcraftlogs.com/reports/BHx6LdtGKW7XnQvp#fight=9&type=summary&source=6&translate=true
 */
class CrystallineCarapace extends Analyzer {
  static dependencies = {
    statTracker: StatTracker,
  };

  armor = 0;
  damage = 0;
  constructor(...args) {
    super(...args);
    this.active = this.selectedCombatant.hasTrait(SPELLS.CRYSTALLINE_CARAPACE.id);
    if (!this.active) {return;}

    this.armor = crystallineCarapaceStats(this.selectedCombatant.traitsBySpellId[SPELLS.CRYSTALLINE_CARAPACE.id]);
    this.statTracker.add(SPELLS.CRYSTALLINE_CARAPACE_BUFF.id, { armor: this.armor });
    this.addEventListener(Events.damage.to(SELECTED_PLAYER), this.onDamageTaken);
    this.addEventListener(Events.damage.by(SELECTED_PLAYER), this.onDamage);
  }

  get uptime() {
    return this.selectedCombatant.getBuffUptime(SPELLS.CRYSTALLINE_CARAPACE_BUFF.id) / this.owner.fightDuration;
  }
  get avgArmor() {
    return this.uptime * this.armor;
  }

  _hitsMitigated = 0;
  _totalHits = 0;
  get pctHitsMitigated() {
    return this._hitsMitigated / this._totalHits;
  }

  get dps() {
    return this.damage / (this.owner.fightDuration / 1000);
  }

  onDamageTaken(event) {
    if (event.sourceIsFriendly) {
      return;
    }

    this._totalHits += 1;
    this._hitsMitigated += this.selectedCombatant.hasBuff(SPELLS.CRYSTALLINE_CARAPACE_BUFF.id) ? 1 : 0;
  }

  onDamage(event) {
    if (event.targetIsFriendly) {
      return;
    }

    if (event.ability.guid === SPELLS.CRYSTALLINE_CARAPACE_REFLECT.id) {
      this.damage += event.amount;
    }
  }

  statistic() {
    return (
      <TraitStatisticBox
        position={STATISTIC_ORDER.OPTIONAL()}
        trait={SPELLS.CRYSTALLINE_CARAPACE.id}
        value={(
          <>
            {formatNumber(this.avgArmor)} Armor <br />
            {formatNumber(this.damage)} Damage ({formatNumber(this.dps)} DPS)
          </>
        )}
        tooltip={(
          <>
            Crystalline Carapace grants <strong>{this.armor} Armor</strong> while active.<br />
            It was active for <strong>{formatPercentage(this.uptime)}%</strong> of the fight, mitigating <strong>{formatPercentage(this.pctHitsMitigated)}%</strong> of incoming hits.
          </>
        )}
      />
    );
  }
}

export default CrystallineCarapace;
