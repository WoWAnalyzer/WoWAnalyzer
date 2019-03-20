import React from 'react';

import SPELLS from 'common/SPELLS';
import { formatPercentage, formatNumber } from 'common/format';
import { calculateAzeriteEffects } from 'common/stats';
import Statistic from 'interface/statistics/Statistic';
import STATISTIC_CATEGORY from 'interface/others/STATISTIC_CATEGORY';
import HasteIcon from 'interface/icons/Haste';
import Analyzer, { SELECTED_PLAYER } from 'parser/core/Analyzer';
import StatTracker from 'parser/shared/modules/StatTracker';
import Events from 'parser/core/Events';
import SpellLink from 'common/SpellLink';
import ItemHealingDone from 'interface/others/ItemHealingDone';

const bloodRiteStats = traits => Object.values(traits).reduce((obj, rank) => {
  const [haste] = calculateAzeriteEffects(SPELLS.BONDED_SOULS_TRAIT.id, rank);
  obj.haste += haste;
  return obj;
}, {
  haste: 0,
});

/**
 * Blood Rite
 * Gain x haste while active
 *
 * Example report: https://www.warcraftlogs.com/reports/k4bAJZKWVaGt12j9#fight=3&type=auras&source=14
 */
class BondedSouls extends Analyzer {
  static dependencies = {
    statTracker: StatTracker,
  };

  haste = 0;
  healing = 0;
  get uptime() {
    return this.selectedCombatant.getBuffUptime(SPELLS.BONDED_SOULS_BUFF_AND_HEAL.id) / this.owner.fightDuration;
  }
  get averageHaste() {
    return this.haste * this.uptime;
  }

  constructor(...args) {
    super(...args);
    this.active = this.selectedCombatant.hasTrait(SPELLS.BONDED_SOULS_TRAIT.id);
    if (!this.active) {
      return;
    }

    const { haste } = bloodRiteStats(this.selectedCombatant.traitsBySpellId[SPELLS.BONDED_SOULS_TRAIT.id]);
    this.haste = haste;

    this.statTracker.add(SPELLS.BONDED_SOULS_BUFF_AND_HEAL.id, {
      haste,
    });

    this.addEventListener(Events.heal.by(SELECTED_PLAYER).spell(SPELLS.BONDED_SOULS_BUFF_AND_HEAL), this._onHeal);
  }

  _onHeal(event) {
    this.healing += event.amount + (event.absorbed || 0);
  }

  statistic() {
    return (
      <Statistic
        category={STATISTIC_CATEGORY.ITEMS}
        size="flexible"
        tooltip={<><strong>{formatPercentage(this.uptime)}% uptime</strong>. Each proc grants <strong>{this.haste} Haste</strong> while active.</>}
      >
        <div className="pad">
          <label><SpellLink id={SPELLS.BONDED_SOULS_TRAIT.id} /></label>

          <div className="value">
            <ItemHealingDone amount={this.healing} /><br />
            <HasteIcon /> {formatNumber(this.averageHaste)} <small>average Haste gained</small>
          </div>
        </div>
      </Statistic>
    );
  }
}

export default BondedSouls;
