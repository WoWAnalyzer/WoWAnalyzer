import React from 'react';
import SPELLS from 'common/SPELLS';
import SpellIcon from 'common/SpellIcon';
import { STATISTIC_ORDER } from 'interface/others/StatisticBox';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import SpellUsable from 'parser/shared/modules/SpellUsable';
import Statistic from 'interface/statistics/Statistic';
import BoringSpellValueText from 'interface/statistics/components/BoringSpellValueText/index';
import Events, { CastEvent } from 'parser/core/Events';
import { t } from '@lingui/macro';
import { ThresholdStyle, When } from 'parser/core/ParseResults';

import { BLACKOUT_KICK_COOLDOWN_REDUCTION_MS } from '../../constants';

/**
 *  Inspired by filler modules in Holy Paladin Analyzer
 */

class BlackoutKick extends Analyzer {
  static dependencies = {
    spellUsable: SpellUsable,
  };

  protected spellUsable!: SpellUsable;

  IMPORTANT_SPELLS = [
    SPELLS.RISING_SUN_KICK.id,
    SPELLS.FISTS_OF_FURY_CAST.id,
  ];
  effectiveRisingSunKickReductionMs = 0;
  wastedRisingSunKickReductionMs = 0;
  effectiveFistsOfFuryReductionMs = 0;
  wastedFistsOfFuryReductionMs = 0;

  constructor(options: Options) {
    super(options);

    if (this.selectedCombatant.hasTalent(SPELLS.WHIRLING_DRAGON_PUNCH_TALENT.id)) {
      this.IMPORTANT_SPELLS.push(SPELLS.WHIRLING_DRAGON_PUNCH_TALENT.id);
    }
    this.addEventListener(Events.cast.by(SELECTED_PLAYER).spell(SPELLS.BLACKOUT_KICK), this.onCast);
  }

  onCast(event: CastEvent) {
    const hasImportantCastsAvailable = this.IMPORTANT_SPELLS.some(spellId => this.spellUsable.isAvailable(spellId));
    /** 
     * Weapons of Order increases this reduction, but i'm opting to handle it in its own module and leave the extra CDR untracked here.
     * We probably wouldn't care too much about wasting the extra CDR anyway
     */
    const currentCooldownReductionMS = (this.selectedCombatant.hasBuff(SPELLS.SERENITY_TALENT.id) ? 0.5 : 1) * BLACKOUT_KICK_COOLDOWN_REDUCTION_MS;
    if (hasImportantCastsAvailable && !this.selectedCombatant.hasBuff(SPELLS.WEAPONS_OF_ORDER_BUFF_AND_HEAL.id)) {
      event.meta = event.meta || {};
      event.meta.isInefficientCast = true;
      event.meta.inefficientCastReason = 'You cast this Blackout Kick while more important spells were available';
    }

    if (!this.spellUsable.isOnCooldown(SPELLS.RISING_SUN_KICK.id)) {
      this.wastedRisingSunKickReductionMs += currentCooldownReductionMS;
    } else {
      const reductionMs = this.spellUsable.reduceCooldown(SPELLS.RISING_SUN_KICK.id, currentCooldownReductionMS);
      this.effectiveRisingSunKickReductionMs += reductionMs;
      this.wastedRisingSunKickReductionMs += currentCooldownReductionMS - reductionMs;
    }
    if (!this.spellUsable.isOnCooldown(SPELLS.FISTS_OF_FURY_CAST.id)) {
      this.wastedFistsOfFuryReductionMs += currentCooldownReductionMS;
    } else {
      const reductionMs = this.spellUsable.reduceCooldown(SPELLS.FISTS_OF_FURY_CAST.id, currentCooldownReductionMS);
      this.effectiveFistsOfFuryReductionMs += reductionMs;
      this.wastedFistsOfFuryReductionMs += currentCooldownReductionMS - reductionMs;
    }
  }

  get totalWastedReductionPerMinute() {
    return (this.wastedFistsOfFuryReductionMs + this.wastedRisingSunKickReductionMs) / (this.owner.fightDuration) * 60;
  }

  get suggestionThresholds() {
    return {
      actual: this.totalWastedReductionPerMinute,
      isGreaterThan: {
        minor: 0,
        average: 2,
        major: 4,
      },
      style: ThresholdStyle.DECIMAL,
    };
  }

  suggestions(when: When) {
    when(this.suggestionThresholds).addSuggestion((suggest, actual, recommended) => suggest('You are wasting cooldown reduction by casting Blackout Kick while having important casts available')
      .icon(SPELLS.BLACKOUT_KICK.icon)
      .actual(t({
      id: "monk.windwalker.suggestions.blackoutKick.cdrWasted",
      message: `${actual.toFixed(2)} seconds of wasted cooldown reduction per minute`
    }))
      .recommended(`${recommended} is recommended`));
  }

  statistic() {
    return (
      <Statistic
        position={STATISTIC_ORDER.CORE(3)}
        size="flexible"
      >
        <BoringSpellValueText spell={SPELLS.BLACKOUT_KICK}>
          <span>
            <SpellIcon
              id={SPELLS.RISING_SUN_KICK.id}
              style={{
                height: '1.3em',
                marginTop: '-1.em',
              }}
            /> {(this.effectiveRisingSunKickReductionMs / 1000).toFixed(1)} <small>Seconds reduced</small>
            <br />
            <SpellIcon
              id={SPELLS.FISTS_OF_FURY_CAST.id}
              style={{
                height: '1.3em',
                marginTop: '-1.em',
              }}
            /> {(this.effectiveFistsOfFuryReductionMs / 1000).toFixed(1)} <small>Seconds reduced</small>
          </span>
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default BlackoutKick;
