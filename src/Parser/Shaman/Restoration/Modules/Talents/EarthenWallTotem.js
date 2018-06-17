import React from 'react';

import SpellIcon from 'common/SpellIcon';
import SpellLink from 'common/SpellLink';
import SPELLS from 'common/SPELLS';
import { formatNumber, formatPercentage } from 'common/format';

import Analyzer from 'Parser/Core/Analyzer';

import Combatants from 'Parser/Core/Modules/Combatants';
import AbilityTracker from 'Parser/Core/Modules/AbilityTracker';

import StatisticBox, { STATISTIC_ORDER } from 'Main/StatisticBox';

class EarthenWallTotem extends Analyzer {
  static dependencies = {
    abilityTracker: AbilityTracker,
    combatants: Combatants,
  };

  prePullCast = true;
  prePullCastConfirmed = false;
  potentialHealing = 0;
  healing = 0;

  on_initialized() {
    this.active = this.combatants.selected.hasTalent(SPELLS.EARTHEN_WALL_TOTEM_TALENT.id);
  }

  on_toPlayerPet_damage(event) {
    const spellId = event.ability.guid;

    if (spellId !== SPELLS.EARTHEN_SHIELD_TOTEM_SELF_DAMAGE.id) {
      return;
    }

    if (this.prePullCast) {
      this.potentialHealing += event.maxHitPoints; // this is taking the totems max HP, which is the same result as the players anyway
      this.prePullCast = false;
      this.prePullCastConfirmed = true;
    }

    this.healing += (event.amount || 0) + (event.overheal || 0) + (event.absorbed || 0);
  }

  on_byPlayer_cast(event) {
    const spellId = event.ability.guid;

    if (spellId !== SPELLS.EARTHEN_WALL_TOTEM_TALENT.id) {
      return;
    }

    if (this.prePullCast) {
      this.prePullCast = false;
    }

    this.potentialHealing += event.maxHitPoints; 
  }

  get earthenShieldEfficiency() {
    return this.healing / this.potentialHealing;
  }

  // If Mag'har Orc, +10% totem health (FeelsBadMan, no player race data)  
  on_finished() {
    if (this.abilityTracker.getAbility(SPELLS.ANCESTRAL_CALL.id).casts || 0) {
      this.potentialHealing *= 1.1;
    }
  }

  suggestions(when) {
    when(this.earthenShieldEfficiency).isLessThan(0.75)
      .addSuggestion((suggest, actual, recommended) => {
        return suggest(<span>Try to cast <SpellLink id={SPELLS.EARTHEN_WALL_TOTEM_TALENT.id} /> at times - and positions where there will be as many people taking damage possible inside of it to maximize the amount it absorbs.</span>)
          .icon(SPELLS.EARTHEN_WALL_TOTEM_TALENT.icon)
          .actual(`${this.earthenShieldEfficiency.toFixed(2)}%`)
          .recommended(`${recommended}%`)
          .regular(recommended - .15).major(recommended - .3);
      });
  }

  statistic() {
    const casts = this.abilityTracker.getAbility(SPELLS.EARTHEN_WALL_TOTEM_TALENT.id).casts + (this.prePullCastConfirmed ? 1 : 0);

    return (
      <StatisticBox
        icon={<SpellIcon id={SPELLS.EARTHEN_WALL_TOTEM_TALENT.id} />}
        value={`${formatPercentage(this.earthenShieldEfficiency)} %`}
        label={(
          <dfn data-tip={`The percentage of the potential absorb of Earthen Wall Totem that was actually used. You cast a total of ${casts} Earthen Wall Totems with a combined health of ${formatNumber(this.potentialHealing)}, which absorbed a total of ${formatNumber(this.healing)} damage.`}>
            Earthen Wall Totem efficiency
          </dfn>
        )}
      />
    );
  }
  statisticOrder = STATISTIC_ORDER.OPTIONAL(70);

  subStatistic() {
    return (
      <div className="flex">
        <div className="flex-main">
          <SpellLink id={SPELLS.EARTHEN_WALL_TOTEM_TALENT.id} />
        </div>
        <div className="flex-sub text-right">
          {formatPercentage(this.owner.getPercentageOfTotalHealingDone(this.healing))} %
        </div>
      </div>
    );
  }
}

export default EarthenWallTotem;

