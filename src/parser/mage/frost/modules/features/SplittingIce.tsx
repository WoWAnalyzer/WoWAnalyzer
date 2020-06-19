import React from 'react';
import SPELLS from 'common/SPELLS';
import Analyzer, { SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { CastEvent, DamageEvent } from 'parser/core/Events';
import Statistic from 'interface/statistics/Statistic';
import STATISTIC_CATEGORY from 'interface/others/STATISTIC_CATEGORY';
import BoringSpellValueText from 'interface/statistics/components/BoringSpellValueText';
import { formatPercentage } from 'common/format';
import { encodeTargetString } from 'parser/shared/modules/EnemyInstances';
import calculateEffectiveDamage from 'parser/core/calculateEffectiveDamage';
import { SPLITTABLE_CASTS, SPLITTABLE_DAMAGE, SPLITTING_ICE_DAMAGE_BONUS, GLACIAL_SPIKE_DAMAGE_BONUS } from '../../constants';

const debug = false;

class SplittingIce extends Analyzer {

  hasGlacialSpike: boolean;
  hasEbonbolt: boolean;

  cleaveDamage = 0; // all damage to secondary target
  boostDamage = 0; // damage to primary target attributable to boost

  castTarget = ""; // player's last directly targeted foe, used to tell which hit was on primary target

  constructor(options: any) {
    super(options);
	   this.active = this.selectedCombatant.hasTalent(SPELLS.SPLITTING_ICE_TALENT.id);
     this.hasGlacialSpike = this.selectedCombatant.hasTalent(SPELLS.GLACIAL_SPIKE_TALENT.id);
     this.hasEbonbolt = this.selectedCombatant.hasTalent(SPELLS.EBONBOLT_TALENT.id);

     this.addEventListener(Events.cast.by(SELECTED_PLAYER).spell(SPLITTABLE_CASTS), this.onCast);
     this.addEventListener(Events.damage.by(SELECTED_PLAYER).spell(SPLITTABLE_DAMAGE), this.onDamage);
  }

  onCast(event: CastEvent) {
    if(event.targetID) {
      this.castTarget = encodeTargetString(event.targetID, event.targetInstance);
    }
  }

  onDamage(event: DamageEvent) {
    const spellId = event.ability.guid;
    const damageTarget = encodeTargetString(event.targetID, event.targetInstance);
    if(this.castTarget === damageTarget) {
      let damageBonus = SPLITTING_ICE_DAMAGE_BONUS;
      if(spellId === SPELLS.GLACIAL_SPIKE_DAMAGE.id) {
        damageBonus *= GLACIAL_SPIKE_DAMAGE_BONUS;
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
      <Statistic
        size="flexible"
        category={STATISTIC_CATEGORY.TALENTS}
        tooltip={(
          <>
            This is all the secondary target damage summed with the portion of primary target damage attributable to Splitting Ice.{this.hasGlacialSpike && ' Because only the icicles inside each Glacial Spike are boosted, the damage bonus to Glacial Spike is estimated.'}
            <ul>
              <li>Primary Target Boosted: <strong>{this.hasGlacialSpike && '≈'}{formatPercentage(this.boostDamagePercent)}%</strong></li>
              <li>Secondary Target Total: <strong>{formatPercentage(this.cleaveDamagePercent)}%</strong></li>
            </ul>
          </>
        )}
      >
        <BoringSpellValueText spell={SPELLS.SPLITTING_ICE_TALENT}>
          <>
            {this.hasGlacialSpike ? '≈' : ''}{formatPercentage(this.damagePercent)}%
          </>
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default SplittingIce;
