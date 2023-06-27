import { defineMessage } from '@lingui/macro';
import { formatPercentage } from 'common/format';
import SPELLS from 'common/SPELLS';
import { SpellLink } from 'interface';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { CastEvent } from 'parser/core/Events';
import { NumberThreshold, ThresholdStyle, When } from 'parser/core/ParseResults';
import * as React from 'react';
import TALENTS from 'common/TALENTS/rogue';

import RollTheBonesCastTracker, {
  ROLL_THE_BONES_CATEGORIES,
  RTBCast,
} from '../features/RollTheBonesCastTracker';

const HIGH_TIER_REFRESH_TIME = 3000;

export interface RTBSuggestion {
  label: string;
  pass: number;
  total: number;
  extraSuggestion: React.ReactElement;
  suggestionThresholds: NumberThreshold;
}

/**
 * Roll the Bones is pretty complex with a number of rules around when to use it. I've done my best to break this down into four main suggestions
 * Ruthless Precision and Grand Melee are the two 'good' buffs. The other four are 'bad' buffs
 *
 * 1 - Uptime (handled in separate module, as close to 100% as possible)
 * 2 - Low value rolls (1 'bad' buff, reroll as soon as you can)
 * 3 - Mid value rolls (2 'bad' buffs, reroll at the pandemic window)
 * 4 - High value rolls (1 'good' buff, 2 buffs where at least one is a 'good' buff, or 5 buffs, keep as long as you can, rerolling under 3 seconds is considered fine)
 */
class RollTheBonesEfficiency extends Analyzer {
  get goodLowValueRolls(): number {
    const delayedRolls = this.rollTheBonesCastTracker.rolltheBonesCastValues[
      ROLL_THE_BONES_CATEGORIES.LOW_VALUE
    ].filter((cast: RTBCast) => cast.RTBIsDelayed).length;
    const totalRolls =
      this.rollTheBonesCastTracker.rolltheBonesCastValues[ROLL_THE_BONES_CATEGORIES.LOW_VALUE]
        .length;

    return totalRolls - delayedRolls;
  }

  get goodHighValueRolls(): number {
    return this.rollTheBonesCastTracker.rolltheBonesCastValues[
      ROLL_THE_BONES_CATEGORIES.HIGH_VALUE
    ].filter(
      (cast: RTBCast) =>
        this.rollTheBonesCastTracker.castRemainingDuration(cast) <= HIGH_TIER_REFRESH_TIME,
    ).length;
  }

  get rollSuggestions(): RTBSuggestion[] {
    const rtbCastValues = this.rollTheBonesCastTracker.rolltheBonesCastValues;
    return [
      // Percentage of low rolls that weren't rerolled right away, meaning a different finisher was cast first
      // Inverted to make all three suggestions consistent
      {
        label: 'low value',
        pass: this.goodLowValueRolls,
        total: rtbCastValues[ROLL_THE_BONES_CATEGORIES.LOW_VALUE].length,
        extraSuggestion: (
          <>
            If you roll a single buff and it's not one of the two highest value, try to reroll it as
            soon as you can. If you roll a single buff and use{' '}
            <SpellLink spell={TALENTS.SLEIGHT_OF_HAND_TALENT} /> reroll any single roll, regardless
            of the buff.
          </>
        ),
        suggestionThresholds: this.rollSuggestionThreshold(
          this.goodLowValueRolls,
          rtbCastValues[ROLL_THE_BONES_CATEGORIES.LOW_VALUE].length,
        ),
      },
      // Percentage of good rolls that were rerolled below 3 seconds
      {
        label: 'high value',
        pass: this.goodHighValueRolls,
        total: rtbCastValues[ROLL_THE_BONES_CATEGORIES.HIGH_VALUE].length,
        extraSuggestion: (
          <>
            If you ever roll a high value buff or multiple bufss, try to leave keep them as long as
            possible, refreshing with less than 3 seconds remaining. If you're using
            <SpellLink spell={TALENTS.SLEIGHT_OF_HAND_TALENT} /> no single buff is considered high
            value.
          </>
        ),
        suggestionThresholds: this.rollSuggestionThreshold(
          this.goodHighValueRolls,
          rtbCastValues[ROLL_THE_BONES_CATEGORIES.HIGH_VALUE].length,
        ),
      },
    ];
  }

  static dependencies = {
    rollTheBonesCastTracker: RollTheBonesCastTracker,
  };
  protected rollTheBonesCastTracker!: RollTheBonesCastTracker;

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(TALENTS.ROLL_THE_BONES_TALENT);
    this.addEventListener(
      Events.cast.by(SELECTED_PLAYER).spell([SPELLS.DISPATCH, SPELLS.BETWEEN_THE_EYES]),
      this.onCast,
    );
  }

  onCast(event: CastEvent) {
    if (
      event.ability.guid !== SPELLS.DISPATCH.id &&
      event.ability.guid !== SPELLS.BETWEEN_THE_EYES.id
    ) {
      return;
    }

    const lastCast = this.rollTheBonesCastTracker.lastCast;
    if (
      lastCast &&
      this.rollTheBonesCastTracker.categorizeCast(lastCast) === ROLL_THE_BONES_CATEGORIES.LOW_VALUE
    ) {
      //FIX WHEN UPDATING ROGUE TO TS
      lastCast.RTBIsDelayed = true;
    }
  }

  rollSuggestionThreshold(pass: number, total: number): NumberThreshold {
    return {
      actual: total === 0 ? 1 : pass / total,
      isLessThan: {
        minor: 1,
        average: 0.9,
        major: 0.8,
      },
      style: ThresholdStyle.PERCENTAGE,
    };
  }

  suggestions(when: When) {
    this.rollSuggestions.forEach((suggestion) => {
      when(suggestion.suggestionThresholds).addSuggestion((suggest, actual, recommended) =>
        suggest(
          <>
            Your efficiency with refreshing <SpellLink spell={TALENTS.ROLL_THE_BONES_TALENT} />{' '}
            after a {suggestion.label} roll could be improved.{' '}
            <SpellLink spell={SPELLS.BROADSIDE} /> and <SpellLink spell={SPELLS.TRUE_BEARING} /> are
            your highest value buffs from <SpellLink spell={TALENTS.ROLL_THE_BONES_TALENT} />.{' '}
            {suggestion.extraSuggestion || ''}
          </>,
        )
          .icon(TALENTS.ROLL_THE_BONES_TALENT.icon)
          .actual(
            defineMessage({
              id: 'rogue.outlaw.suggestions.rollTheBones.efficiency',
              message: `${formatPercentage(actual)}% (${suggestion.pass} out of ${
                suggestion.total
              }) efficient rerolls`,
            }),
          )
          .recommended(`${formatPercentage(recommended)}% is recommended`),
      );
    });
  }
}

export default RollTheBonesEfficiency;
