import { calculateAzeriteEffects } from 'common/stats';
import SPELLS from 'common/SPELLS';
import Analyzer, { SELECTED_PLAYER } from 'parser/core/Analyzer';
import TraitStatisticBox, { STATISTIC_ORDER } from 'interface/others/TraitStatisticBox';
import React from 'react';
import Events from 'parser/core/Events';
import { formatNumber, formatPercentage } from 'common/format';
import HIT_TYPES from 'game/HIT_TYPES';

const crushingAssaultDamage = traits => Object.values(traits).reduce((obj, rank) => {
  const [damage] = calculateAzeriteEffects(SPELLS.CRUSHING_ASSAULT_TRAIT.id, rank);
  obj.damage += damage;
  obj.traits += 1;
  return obj;
}, {
  damage: 0,
  traits: 0,
});

/**
 * Example report: /report/4h3ZrkcXBYgzVtaL/14-Normal+Fetid+Devourer+-+Kill+(1:38)/32-Prime
 */

class CrushingAssault extends Analyzer {

  damage = 0;
  traits = 0;

  crushingAssaultDamage = 0;
  totalProcs = 0;
  crits = 0;

  constructor(...args) {
    super(...args);
    this.active = this.selectedCombatant.hasTrait(SPELLS.CRUSHING_ASSAULT_TRAIT.id);
    if (!this.active) {
      return;
    }

    const { damage, traits } = crushingAssaultDamage(this.selectedCombatant.traitsBySpellId[SPELLS.CRUSHING_ASSAULT_TRAIT.id]);
    this.damage = damage;
    this.traits = traits;

    this.addEventListener(Events.damage.by(SELECTED_PLAYER).spell(SPELLS.SLAM), this._onSlamDamage);
    this.addEventListener(Events.applybuff.by(SELECTED_PLAYER).spell(SPELLS.CRUSHING_ASSAULT_BUFF), this._countCrushingAssaultProc);
    this.addEventListener(Events.refreshbuff.by(SELECTED_PLAYER).spell(SPELLS.CRUSHING_ASSAULT_BUFF), this._countCrushingAssaultProc);
  }

  _onSlamDamage(event) {
    if (!this.selectedCombatant.hasBuff(SPELLS.CRUSHING_ASSAULT_BUFF.id)) {
      return;
    }
    this.crushingAssaultDamage += this.damage;
    this.crits += event.hitType === HIT_TYPES.CRIT ? 1 : 0;
  }

  _countCrushingAssaultProc() {
    this.totalProcs += 1;
  }

  statistic() {
    const critPercent = (this.crits === 0 || this.totalProcs === 0) ? 'none' : `${formatPercentage((this.crits / this.totalProcs), 0)}%`;
    return (
      <TraitStatisticBox
        position={STATISTIC_ORDER.OPTIONAL()}
        trait={SPELLS.CRUSHING_ASSAULT_TRAIT.id}
        value={`${this.owner.formatItemDamageDone(this.crushingAssaultDamage)}`}
        tooltip={`Damage done: <b>${formatNumber(this.crushingAssaultDamage)}</b><br />
        Crushing Assault procced a total of <b>${this.totalProcs}</b> times, <b>${critPercent}</b> of which were critital hits.`}
      />
    );
  }
}

export default CrushingAssault;
