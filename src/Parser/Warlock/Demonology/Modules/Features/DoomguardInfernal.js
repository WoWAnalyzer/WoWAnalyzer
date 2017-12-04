import React from 'react';

import Analyzer from 'Parser/Core/Analyzer';
import AbilityTracker from 'Parser/Core/Modules/AbilityTracker';
import Combatants from 'Parser/Core/Modules/Combatants';

import calculateMaxCasts from 'Parser/Core/calculateMaxCasts';
import SPELLS from 'common/SPELLS';
import SpellLink from 'common/SpellLink';

import WilfredRing from '../Items/Legendaries/WilfredRing';

const SUMMON_COOLDOWN = 180;

class DoomguardInfernal extends Analyzer {
  static dependencies = {
    abilityTracker: AbilityTracker,
    wilfredRing: WilfredRing,
    combatants: Combatants,
  };

  on_initialized() {
    this.active = !this.combatants.selected.hasTalent(SPELLS.GRIMOIRE_OF_SUPREMACY_TALENT.id);
  }

  suggestions(when) {
    const wilfredExtraSummons = (this.wilfredRing.active) ? this.wilfredRing.extraSummons : 0;
    const maxCasts = Math.ceil(calculateMaxCasts(SUMMON_COOLDOWN, this.owner.fightDuration)) + wilfredExtraSummons;
    const doomguardCasts = this.abilityTracker.getAbility(SPELLS.SUMMON_DOOMGUARD_UNTALENTED.id).casts || 0;
    const infernalCasts = this.abilityTracker.getAbility(SPELLS.SUMMON_INFERNAL_UNTALENTED.id).casts || 0;
    const actualCasts = doomguardCasts + infernalCasts;
    const percentage = actualCasts / maxCasts;
    when(percentage).isLessThan(1)
      .addSuggestion((suggest, actual, recommended) => {
        return suggest(<span>You should cast <SpellLink id={SPELLS.SUMMON_DOOMGUARD_UNTALENTED.id} /> or <SpellLink id={SPELLS.SUMMON_INFERNAL_UNTALENTED.id} /> more often. Doomguard is best for single target while Infernal is better for AoE. Try to pair up the cooldowns with haste buffs like <SpellLink id={SPELLS.BLOODLUST.id}/>, <SpellLink id={SPELLS.TIME_WARP.id}/> etc..</span>)
          .icon(SPELLS.SUMMON_DOOMGUARD_UNTALENTED.icon)
          .actual(`${actualCasts} out of ${maxCasts} summons.`)
          .recommended(`${maxCasts} is recommended`)
          .regular(recommended - 0.25).major(recommended - 0.5);
      });
  }
}

export default DoomguardInfernal;
