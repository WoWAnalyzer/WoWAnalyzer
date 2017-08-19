import React from 'react';

import SPELLS from 'common/SPELLS';
import SpellLink from 'common/SpellLink';
import { formatPercentage } from 'common/format';

import AbilityTracker from 'Parser/Core/Modules/AbilityTracker';

const TIDAL_WAVES_SPELL_ID = 53390;
const TIDAL_WAVES_BUFF_EXPIRATION_BUFFER = 50; // the buff expiration can occur several MS before the heal event is logged, this is the buffer time that an IoL charge may have dropped during which it will still be considered active.
const TIDAL_WAVES_BUFF_MINIMAL_ACTIVE_TIME = 100; // Minimal duration for which you must have tidal waves. Prevents it from counting a HS/HW as buffed when you cast a riptide at the end.

class ShamanAbilityTracker extends AbilityTracker {
  on_byPlayer_cast(event) {
    if (super.on_byPlayer_cast) {
      super.on_byPlayer_cast(event);
    }

    const spellId = event.ability.guid;
    if (spellId !== SPELLS.HEALING_RAIN_CAST.id) {
      return;
    }

    if (!this.owner.selectedCombatant.hasBuff(SPELLS.RESTORATION_SHAMAN_T20_4SET_BONUS_BUFF.id, event.timestamp)) {
      return;
    }

    const cast = this.getAbility(spellId, event.ability);
    cast.withT20Buff = (cast.withT20Buff || 0) + 1;
  }

  on_byPlayer_heal(event) {
    if (super.on_byPlayer_heal) {
      super.on_byPlayer_heal(event);
    }
    const spellId = event.ability.guid;
    const cast = this.getAbility(spellId, event.ability);

    if (spellId === SPELLS.HEALING_WAVE.id || spellId === SPELLS.HEALING_SURGE_RESTORATION.id) {
      const hasTw = this.owner.selectedCombatant.hasBuff(TIDAL_WAVES_SPELL_ID, event.timestamp, TIDAL_WAVES_BUFF_EXPIRATION_BUFFER,TIDAL_WAVES_BUFF_MINIMAL_ACTIVE_TIME);

      if (hasTw) {
        cast.healingTwHits = (cast.healingTwHits || 0) + 1;
        cast.healingTwHealing = (cast.healingTwHealing || 0) + (event.amount || 0);
        cast.healingTwAbsorbed = (cast.healingTwAbsorbed || 0) + (event.absorbed || 0);
        cast.healingTwOverheal = (cast.healingTwOverheal || 0) + (event.overheal || 0);
      }
    }

  }

  suggestions(when) {
    const healingRain = this.getAbility(SPELLS.HEALING_RAIN_CAST.id);
    const has4PT20 = this.owner.selectedCombatant.hasBuff(SPELLS.RESTORATION_SHAMAN_T20_4SET_BONUS_BUFF.id);
    const unbuffedHealingRainsPercentage = has4PT20 && ((healingRain.casts - healingRain.withT20Buff) / healingRain.casts);
    if (has4PT20) {
      when(unbuffedHealingRainsPercentage).isGreaterThan(0)
        .addSuggestion((suggest, actual, recommended) => 
          suggest(<span><SpellLink id={SPELLS.RESTORATION_SHAMAN_T20_4SET_BONUS_BUFF.id} /> buffed <SpellLink id={SPELLS.HEALING_RAIN_CAST.id} /> can make for some very efficient healing, consider ensure casting them with <SpellLink id={SPELLS.RESTORATION_SHAMAN_T20_4SET_BONUS_BUFF.id} />({formatPercentage(unbuffedHealingRainsPercentage)}% healing rains were casted without <SpellLink id={SPELLS.RESTORATION_SHAMAN_T20_4SET_BONUS_BUFF.id} />).</span>)
            .icon(SPELLS.HEALING_RAIN_CAST.icon)
            .actual(`${formatPercentage(unbuffedHealingRainsPercentage)}% unbuffed healing rain casts.`)
            .recommended(`${recommended} is recommended`)
            .regular(recommended + 0.15).major(recommended + 0.3)
        );
    }
  }
}

export default ShamanAbilityTracker;
