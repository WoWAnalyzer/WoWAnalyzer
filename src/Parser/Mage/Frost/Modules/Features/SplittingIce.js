import React from 'react';
import SPELLS from 'common/SPELLS';
import SpellIcon from 'common/SpellIcon';
import { formatPercentage } from 'common/format';
import StatisticBox, { STATISTIC_ORDER } from 'Main/StatisticBox';
import Combatants from 'Parser/Core/Modules/Combatants';
import Analyzer from 'Parser/Core/Analyzer';
import { encodeTargetString } from 'Parser/Core/Modules/EnemyInstances';
import calculateEffectiveDamage from 'Parser/Core/calculateEffectiveDamage';

const debug = false;

const DAMAGE_BONUS = 0.05;
const GLACIAL_SPIKE_BONUS_PORTION = 0.65; // GS benefits from Icicles in it, but totals less than the full 5%. This number currently a guess.

class SplittingIce extends Analyzer {
  static dependencies = {
    combatants: Combatants,
	}

  cleaveDamage = 0; // all damage to secondary target
  boostDamage = 0; // damage to primary target attributable to boost

  castTarget; // player's last directly targeted foe, used to tell which hit was on primary target

  on_initialized() {
	   this.active = this.combatants.selected.hasTalent(SPELLS.SPLITTING_ICE_TALENT.id);
     this.hasGlacialSpike = this.combatants.selected.hasTalent(SPELLS.GLACIAL_SPIKE_TALENT.id);
  }

  on_byPlayer_cast(event) {
    const spellId = event.ability.guid;
    // we check Frostbolt cast even though it doesn't split because it can launch overcapped icicles.
    if(spellId !== SPELLS.ICE_LANCE.id && spellId !== SPELLS.FROSTBOLT.id && spellId !== SPELLS.GLACIAL_SPIKE_TALENT.id) {
      return;
    }

    if(event.targetID) {
      this.castTarget = encodeTargetString(event.targetID, event.targetInstance);
    }
  }

  on_byPlayer_damage(event) {
    const spellId = event.ability.guid;
    if(spellId !== SPELLS.ICE_LANCE_DAMAGE.id && spellId !== SPELLS.ICICLE_DAMAGE.id && spellId !== SPELLS.GLACIAL_SPIKE_DAMAGE.id) {
      return;
    }

    const damageTarget = encodeTargetString(event.targetID, event.targetInstance);
    if(this.castTarget === damageTarget) {
      let damageBonus = DAMAGE_BONUS;
      if(spellId === SPELLS.GLACIAL_SPIKE_DAMAGE.id) {
        damageBonus *= GLACIAL_SPIKE_BONUS_PORTION;
      }
      this.boostDamage += calculateEffectiveDamage(event, damageBonus);
    } else {
      this.cleaveDamage += event.amount + (event.absorbed || 0);
      if(debug) { console.log(`Splitting Ice cleave for ${event.amount + (event.absorbed || 0)} : castTarget=${this.castTarget} damageTarget=${damageTarget}`); }
    }
  }

  get damage() {
    return this.cleaveDamage + this.boostDamage;
  }

  get damagePercent() {
    return this.owner.getPercentageOfTotalDamageDone(this.damage);
  }

  get cleaveDamagePercent() {
    return this.owner.getPercentageOfTotalDamageDone(this.cleaveDamage);
  }

  get boostDamagePercent() {
    return this.owner.getPercentageOfTotalDamageDone(this.boostDamage);
  }

  statistic() {
    return (
      <StatisticBox
        icon={<SpellIcon id={SPELLS.SPLITTING_ICE_TALENT.id} />}
        value={`${this.hasGlacialSpike ? '≈' : ''}${formatPercentage(this.damagePercent)} %`}
        label="Splitting Ice damage"
        tooltip={`This is all the secondary target damage summed with the portion of primary target damage attributable to Splitting Ice.${this.hasGlacialSpike ? ' Because only the icicles inside each Glacial Spike are boosted, the damage bonus to Glacial Spike is estimated.' : ''}
          <ul>
            <li>Primary Target Boosted: <b>${this.hasGlacialSpike ? '≈' : ''}${formatPercentage(this.boostDamagePercent)}%</b></li>
            <li>Secondary Target Total: <b>${formatPercentage(this.cleaveDamagePercent)}%</b></li>
          </ul>
        `}
      />
    );
  }
  statisticOrder = STATISTIC_ORDER.OPTIONAL(10);

}

export default SplittingIce;
