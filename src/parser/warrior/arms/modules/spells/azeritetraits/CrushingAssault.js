import { calculateAzeriteEffects } from 'common/stats';
import SPELLS from 'common/SPELLS';
import Analyzer, { SELECTED_PLAYER } from 'parser/core/Analyzer';
import TraitStatisticBox, { STATISTIC_ORDER } from 'interface/others/TraitStatisticBox';
import React from 'react';
import Events from 'parser/core/Events';
import { formatNumber } from 'common/format';

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
  }

  _onSlamDamage() {
    if (!this.selectedCombatant.hasBuff(SPELLS.CRUSHING_ASSAULT_BUFF.id)) {
      return;
    }
    this.crushingAssaultDamage += this.damage;
  }

  statistic() {
    return (
      <TraitStatisticBox
        position={STATISTIC_ORDER.OPTIONAL()}
        trait={SPELLS.CRUSHING_ASSAULT_TRAIT.id}
        value={`${this.owner.formatItemDamageDone(this.crushingAssaultDamage)}`}
        tooltip={`Damage done: ${formatNumber(this.crushingAssaultDamage)}`}
      />
    );
  }
}

export default CrushingAssault;
