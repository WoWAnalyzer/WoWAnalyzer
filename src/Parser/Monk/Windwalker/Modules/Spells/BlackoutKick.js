import React from 'react';

import SPELLS from 'common/SPELLS';
import SpellIcon from 'common/SpellIcon';
import StatisticBox, { STATISTIC_ORDER } from 'Main/StatisticBox';

import Analyzer from 'Parser/Core/Analyzer';
import Combatants from 'Parser/Core/Modules/Combatants';
import SpellUsable from 'Parser/Core/Modules/SpellUsable';
import AbilityTracker from 'Parser/Core/Modules/AbilityTracker';

/**
 *  Inspired by filler modules in Holy Paladin Analyzer
 */

const COOLDOWN_REDUCTION_MS = 1000;

class BlackoutKick extends Analyzer {
  static dependencies = {
    combatants: Combatants,
    spellUsable: SpellUsable,
    abilityTracker: AbilityTracker,
  };
  IMPORTANT_SPELLS = [
    SPELLS.RISING_SUN_KICK.id,
    SPELLS.FISTS_OF_FURY_CAST.id,
    SPELLS.STRIKE_OF_THE_WINDLORD.id,
    SPELLS.WHIRLING_DRAGON_PUNCH_TALENT.id,
  ];
  inefficientCasts = 0;

  effectiveRisingSunKickReductionMs = 0;
  wastedRisingSunKickReductionMs = 0;
  effectiveFistsOfFuryReductionMs = 0;
  wastedFistsOfFuryReductionMs = 0;

  on_byPlayer_cast(event) {
    const spellId = event.ability.guid;
    if (spellId !== SPELLS.BLACKOUT_KICK.id) {
      return;
    }

    this.casts += 1;
    const combatant = this.combatants.selected;
    // Blackout Kick sometimes take priority if you're using T21
    if (combatant.hasBuff(SPELLS.COMBO_BREAKER_BUFF.id) && combatant.hasBuff(SPELLS.WW_TIER21_2PC.id)) {
      return;
    }
    
    const hasImportantCastsAvailable = this.IMPORTANT_SPELLS.some(spellId => this.spellUsable.isAvailable(spellId));

    if (hasImportantCastsAvailable) {
      this.inefficientCasts += 1;
      event.meta = event.meta || {};
      event.meta.isInefficientCast = true;
      event.meta.inefficientCastReason = 'You cast this Blackout Kick while more important spells were available';
    }

    if (this.spellUsable.isAvailable(SPELLS.RISING_SUN_KICK.id)) {
      this.wastedRisingSunKickReductionMs += COOLDOWN_REDUCTION_MS;
    } else {
      const reductionMs = this.spellUsable.reduceCooldown(SPELLS.RISING_SUN_KICK.id, COOLDOWN_REDUCTION_MS);
      this.effectiveRisingSunKickReductionMs += reductionMs;
      this.wastedRisingSunKickReductionMs += COOLDOWN_REDUCTION_MS - reductionMs;
    }
    if (this.spellUsable.isAvailable(SPELLS.FISTS_OF_FURY_CAST.id)) {
      this.wastedFistsOfFuryReductionMs += COOLDOWN_REDUCTION_MS;
    } else {
      const reductionMs = this.spellUsable.reduceCooldown(SPELLS.FISTS_OF_FURY_CAST.id, COOLDOWN_REDUCTION_MS);
      this.effectiveFistsOfFuryReductionMs += reductionMs;
      this.wastedFistsOfFuryReductionMs += COOLDOWN_REDUCTION_MS - reductionMs;
    }
  }

  get inefficientCastsPerMinute() {
    return this.inefficientCasts / (this.owner.fightDuration / 1000) * 60;
  }

  get suggestionThresholds() {
    return {
      actual: this.inefficientCastsPerMinute,
      isGreaterThan: {
        minor: 0,
        average: 1,
        major: 2,
      },
      style: 'decimal',
    };
  }

  suggestions(when) {
    when(this.suggestionThresholds).addSuggestion((suggest, actual, recommended) => {
      return suggest('You are casting Blackout Kick while having important casts available')
        .icon(SPELLS.BLACKOUT_KICK.icon)
        .actual(`${this.inefficientCastsPerMinute.toFixed(2)} Bad Blackout Kick casts per minute`)
        .recommended(`${recommended} is recommended`);
    });
  }

  statistic() {
    return (
      <StatisticBox
        icon={<SpellIcon id={SPELLS.BLACKOUT_KICK.id} />}
        value={this.inefficientCasts}
        label={`Bad Blackout Kick Casts`}
        tooltip={`Bad casts are Blackout Kicks used while important spells like Rising Sun Kick and Fists of Fury are available.`}
      />
    );
  }
  statisticOrder = STATISTIC_ORDER.CORE(5);
}

export default BlackoutKick;
