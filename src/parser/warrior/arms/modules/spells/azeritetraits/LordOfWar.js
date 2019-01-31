import { calculateAzeriteEffects } from 'common/stats';
import SPELLS from 'common/SPELLS';
import Analyzer, { SELECTED_PLAYER } from 'parser/core/Analyzer';
import TraitStatisticBox, { STATISTIC_ORDER } from 'interface/others/TraitStatisticBox';
import React from 'react';
import Events from 'parser/core/Events';
import { formatNumber } from 'common/format';

const lordOfWarDamage = traits => Object.values(traits).reduce((obj, rank) => {
  const [damage] = calculateAzeriteEffects(SPELLS.LORD_OF_WAR.id, rank);
  obj.damage += damage;
  obj.traits += 1;
  return obj;
}, {
  damage: 0,
  traits: 0,
});

/**
 * Example report: /report/YXFby87mzNrLtwj1/7-Normal+Conclave+of+the+Chosen+-+Kill+(4:17)/30-Korebian/timeline
 */

class LordOfWar extends Analyzer {

  damage = 0;
  traits = 0;

  lordOfWarDamage = 0;

  constructor(...args) {
    super(...args);
    
    this.active = this.selectedCombatant.hasTrait(SPELLS.LORD_OF_WAR.id);

    const { damage, traits } = lordOfWarDamage(this.selectedCombatant.traitsBySpellId[SPELLS.LORD_OF_WAR.id]);
    this.damage = damage;
    this.traits = traits;

    const spell = this.selectedCombatant.hasTalent(SPELLS.WARBREAKER_TALENT.id) ? SPELLS.WARBREAKER_TALENT : SPELLS.COLOSSUS_SMASH;
    this.addEventListener(Events.damage.by(SELECTED_PLAYER).spell(spell), this._onColossusSmashDamage);
  }

  _onColossusSmashDamage() {
    this.lordOfWarDamage += this.damage;
  }

  statistic() {
    return (
      <TraitStatisticBox
        position={STATISTIC_ORDER.OPTIONAL()}
        trait={SPELLS.LORD_OF_WAR.id}
        value={`${this.owner.formatItemDamageDone(this.lordOfWarDamage)}`}
        tooltip={`Damage done: <b>${formatNumber(this.lordOfWarDamage)}</b>`}
      />
    );
  }
}

export default LordOfWar;
