import React from 'react';

import SPELLS from 'common/SPELLS';
import { formatNumber, formatPercentage } from 'common/format';
import { calculateAzeriteEffects } from 'common/stats';
import SpellLink from 'common/SpellLink';
import UptimeIcon from 'interface/icons/Uptime';
import PrimaryStatIcon from 'interface/icons/PrimaryStat';
import AzeritePowerStatistic from 'interface/statistics/AzeritePowerStatistic';
import ItemDamageTaken from 'interface/ItemDamageTaken';
import Analyzer, { SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events from 'parser/core/Events';
import StatTracker from 'parser/shared/modules/StatTracker';

const treacherousCovenantStat = traits => Object.values(traits).reduce((obj, rank) => {
  const stat = calculateAzeriteEffects(SPELLS.TREACHEROUS_COVENANT.id, rank);
  obj.stat += Number(stat);
  return obj;
}, {
  stat: 0,
});

const DAMAGE_MODIFIER = .15;

/**
 * Treacherous Covenant
 * Your primary stat is increased by 151 while you are above 50% health. You take 15% increased damage while below 20% health..
 *
 * Example reports
 *  Int: /report/L9AFD1kHxTrGK43t/1-Heroic+Champion+of+the+Light+-+Kill+(3:08)/20-Wiridian
 *  Agi: /report/1YJ98MzR6qPvydGA/13-Heroic+Grong+-+Kill+(4:56)/19-Cleah
 *  Str: /report/TMjpXkaYKVhncmfb/11-Heroic+Jadefire+Masters+-+Kill+(4:45)/11-Jhonson
 *
 *  @property {StatTracker} statTracker
 */
class TreacherousCovenant extends Analyzer {
  static dependencies = {
    statTracker: StatTracker,
  };

  statModifier = 0;
  debuffActive = false;
  extraDamageTaken = 0;

  constructor(...args) {
    super(...args);
    this.active = this.selectedCombatant.hasTrait(SPELLS.TREACHEROUS_COVENANT.id);
    if (!this.active) {
      return;
    }
    const { stat } = treacherousCovenantStat(this.selectedCombatant.traitsBySpellId[SPELLS.TREACHEROUS_COVENANT.id]);
    this.statModifier = stat;

    this.addEventListener(Events.applydebuff.to(SELECTED_PLAYER).spell(SPELLS.TREACHEROUS_COVENANT_DEBUFF), this._applyDebuff);
    this.addEventListener(Events.removedebuff.to(SELECTED_PLAYER).spell(SPELLS.TREACHEROUS_COVENANT_DEBUFF), this._removeDebuff);

    this.addEventListener(Events.damage.to(SELECTED_PLAYER), this._takeDamage);

    this.statTracker.add(SPELLS.TREACHEROUS_COVENANT_BUFF.id, {
      strength: this.statModifier,
      intellect: this.statModifier,
      agility: this.statModifier,
    });
  }

  _applyDebuff(event) {
    this.debuffActive = true;
  }

  _removeDebuff(event) {
    this.debuffActive = false;
  }

  _takeDamage(event) {
    if (this.debuffActive) {
      this.extraDamageTaken += (event.amount || 0) * DAMAGE_MODIFIER;
    }
  }

  get debuffUptime() {
    return this.selectedCombatant.getBuffUptime(SPELLS.TREACHEROUS_COVENANT_DEBUFF.id) / this.owner.fightDuration;
  }

  get buffUptime() {
    return this.selectedCombatant.getBuffUptime(SPELLS.TREACHEROUS_COVENANT_BUFF.id) / this.owner.fightDuration;
  }

  get averageStatModifier() {
    return this.buffUptime * this.statModifier;
  }

  statistic() {
    return (
      <AzeritePowerStatistic
        size="flexible"
        tooltip={(
          <>
            Grants <b>{this.statModifier} {this.selectedCombatant.spec.primaryStat}</b> while above 50% health.<br />
            Extra damage taken: {formatNumber(this.extraDamageTaken)}.
          </>
        )}
      >
        <div className="pad">
          <label><SpellLink id={SPELLS.TREACHEROUS_COVENANT.id} /></label>

          <div className="value">
            <UptimeIcon /> {formatPercentage(this.buffUptime)}% <small>buff uptime</small><br />
            <PrimaryStatIcon stat={this.selectedCombatant.spec.primaryStat} /> {formatNumber(this.averageStatModifier)} <small>average {this.selectedCombatant.spec.primaryStat} gained</small><br />
            <UptimeIcon /> {formatPercentage(this.debuffUptime)}% <small>debuff uptime</small><br />
            <ItemDamageTaken amount={this.extraDamageTaken} />
          </div>
        </div>
      </AzeritePowerStatistic>
    );
  }
}

export default TreacherousCovenant;
