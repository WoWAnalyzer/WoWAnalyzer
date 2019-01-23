import React from 'react';

import SPELLS from 'common/SPELLS';
import { formatNumber, formatPercentage } from 'common/format';
import { calculateAzeriteEffects } from 'common/stats';
import Analyzer, { SELECTED_PLAYER } from 'parser/core/Analyzer';
import TraitStatisticBox from 'interface/others/TraitStatisticBox';
import Events from 'parser/core/Events';
import ItemDamageTaken from 'interface/others/ItemDamageTaken';

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
 * Example report: /report/L9AFD1kHxTrGK43t/1-Heroic+Champion+of+the+Light+-+Kill+(3:08)/20-Wiridian
 */
class TreacherousCovenant extends Analyzer {
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

  get averageStatModifier(){
    return this.buffUptime * this.statModifier;
  }

  get primaryStat() {
    return this.selectedCombatant.spec.primaryStat.substring(0,3);
  }

  statistic() {
    return (
      <TraitStatisticBox
        trait={SPELLS.TREACHEROUS_COVENANT.id}
        value={(
          <>
            {formatNumber(this.averageStatModifier)} Average {this.selectedCombatant.spec.primaryStat}<br />
            {formatPercentage(this.buffUptime)}% buff uptime<br />
            <ItemDamageTaken amount={this.extraDamageTaken} /><br />
            {formatPercentage(this.debuffUptime)}% debuff uptime
          </>
        )}
        tooltip={`

          Grants <b>${this.statModifier} ${this.selectedCombatant.spec.primaryStat}</b> while above 50% health.<br/>
          Extra damage taken: ${formatNumber(this.extraDamageTaken)}.
        `}
      />
    );
  }
}

export default TreacherousCovenant;
