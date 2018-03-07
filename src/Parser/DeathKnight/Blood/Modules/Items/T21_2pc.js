import React from 'react';

import SPELLS from 'common/SPELLS';
import SpellLink from 'common/SpellLink';
import SpellIcon from 'common/SpellIcon';
import Wrapper from 'common/Wrapper';
import { formatPercentage, formatNumber } from 'common/format';

import Analyzer from 'Parser/Core/Analyzer';
import Combatants from 'Parser/Core/Modules/Combatants';
import SpellUsable from 'Parser/Core/Modules/SpellUsable';

const COOLDOWN_REDUCTION_PER_STACK_MS = 3000;

class T21_2pc extends Analyzer {
  static dependencies = {
    combatants: Combatants,
    spellUsable: SpellUsable,
  };

  boneShieldCurrentStacks = 0;
  effectiveReduction = 0;
  wastedReduction = 0;
  dancingRuneWeaponCasts = 0;

  on_initialized() {
    this.active = this.combatants.selected.hasBuff(SPELLS.BLOOD_DEATH_KNIGHT_T21_2SET_BONUS_BUFF.id);
  }

  get averageReduction() {
    return this.effectiveReduction / this.dancingRuneWeaponCasts / 1000 || 0;
  }

  get wastedPercent() {
    return this.wastedReduction / (this.wastedReduction + this.effectiveReduction) || 0;
  }

  on_byPlayer_cast(event) {
    if (event.ability.guid === SPELLS.DANCING_RUNE_WEAPON.id) {
      this.dancingRuneWeaponCasts += 1;
    }
  }

  on_toPlayer_applybuffstack(event) {
    if (event.ability.guid !== SPELLS.BONE_SHIELD.id){
      return;
    }
    this.boneShieldCurrentStacks = event.stack;
  }

  on_toPlayer_removebuffstack(event) {
    if (event.ability.guid !== SPELLS.BONE_SHIELD.id){
      return;
    }
    const stacksConsumed = this.boneShieldCurrentStacks - event.stack;
    this.boneShieldCurrentStacks = event.stack;
    if(this.spellUsable.isOnCooldown(SPELLS.DANCING_RUNE_WEAPON.id)){
      const reduction = stacksConsumed * COOLDOWN_REDUCTION_PER_STACK_MS;
      const reductionEffective = this.spellUsable.reduceCooldown(SPELLS.DANCING_RUNE_WEAPON.id, reduction);
      this.effectiveReduction += reductionEffective;
      this.wastedReduction += reduction - reductionEffective;
    }else{
      this.wastedReduction += stacksConsumed * COOLDOWN_REDUCTION_PER_STACK_MS;
    }
  }

  item() {
    return {
      id: `spell-${SPELLS.BLOOD_DEATH_KNIGHT_T21_2SET_BONUS_BUFF.id}`,
      icon: <SpellIcon id={SPELLS.BLOOD_DEATH_KNIGHT_T21_2SET_BONUS_BUFF.id} />,
      title: <SpellLink id={SPELLS.BLOOD_DEATH_KNIGHT_T21_2SET_BONUS_BUFF.id} />,
      result: (
        <dfn data-tip={`${formatNumber(this.effectiveReduction / 1000)} sec total effective reduction and ${formatNumber(this.wastedReduction)} sec (${formatPercentage(this.wastedPercent)}%) wasted reduction.`}>
          <Wrapper>Reduced the cooldown of <SpellLink id={SPELLS.DANCING_RUNE_WEAPON.id} /> by an average of {formatNumber(this.averageReduction)} seconds.</Wrapper>
        </dfn>
      ),
    };
  }
}

export default T21_2pc;
