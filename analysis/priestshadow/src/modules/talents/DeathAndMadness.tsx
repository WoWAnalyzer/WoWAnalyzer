import React from 'react';

import Analyzer, { SELECTED_PLAYER, Options } from 'parser/core/Analyzer';
import Events, { EnergizeEvent } from 'parser/core/Events';
import SPELLS from 'common/SPELLS';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import { formatNumber, formatPercentage } from 'common/format';
import { t } from '@lingui/macro';
import Insanity from 'interface/icons/Insanity';
import { When, ThresholdStyle } from 'parser/core/ParseResults';
import { SpellLink } from 'interface';

class DeathAndMadness extends Analyzer {
  casts = 0;
  resets = 0;
  insanityGained = 0;

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(SPELLS.DEATH_AND_MADNESS_TALENT.id);
    this.addEventListener(Events.cast.by(SELECTED_PLAYER).spell(SPELLS.SHADOW_WORD_DEATH), this.onCast);
    this.addEventListener(Events.applybuff.by(SELECTED_PLAYER).spell(SPELLS.DEATH_AND_MADNESS_BUFF), this.onBuff);
    this.addEventListener(Events.refreshbuff.by(SELECTED_PLAYER).spell(SPELLS.DEATH_AND_MADNESS_BUFF), this.onBuff);
    this.addEventListener(Events.energize.by(SELECTED_PLAYER).spell(SPELLS.DEATH_AND_MADNESS_BUFF), this.onEnergize);
  }

  // Since the actual buff only applies/refreshes as a reward for getting a kill within 7s of using SW: Death, don't have to do much to check
  onBuff() {
    this.resets += 1;
  }

  onCast() {
    this.casts += 1;
  }

  onEnergize(event: EnergizeEvent) {
    this.insanityGained += event.resourceChange;
  }

  get resetPercentage() {
    return this.resets / this.casts;
  }

  get suggestionThresholds() {
    return {
      actual: this.resetPercentage,
      isLessThan: {
        minor: 0.8,
        average: 0.7,
        major: 0.6,
      },
      style: ThresholdStyle.PERCENTAGE,
    };
  }

  suggestions(when: When) {
    when(this.suggestionThresholds).addSuggestion((suggest, actual, recommended) =>
      suggest(
        <>
          You reset <SpellLink id={SPELLS.SHADOW_WORD_DEATH.id} /> with {formatNumber(this.resets)}{' '}
          of your casts. Make sure that you are resetting{' '}
          <SpellLink id={SPELLS.SHADOW_WORD_DEATH.id} /> as often as possible while taking the
          talent to benefit from the bonus insanity gained.
        </>,
      )
        .icon(SPELLS.DEATH_AND_MADNESS_TALENT.icon)
        .actual(
          t({
            id: 'priest.shadow.suggestions.deathAndMadness.efficiency',
            message: `Reset ${formatPercentage(
              actual,
            )}% of Shadow Word: Death casts. If you're not getting enough resets from Death and Madness, you'll likely benefit more from using a different talent.`,
          }),
        )
        .recommended(`>${formatPercentage(recommended)}% is recommended.`),
    );
  }

  statistic() {
    return (
      <Statistic
        category={STATISTIC_CATEGORY.TALENTS}
        size="flexible"
        tooltip="Number of casts where the target was killed and insanity generated from it."
      >
        <BoringSpellValueText spell={SPELLS.DEATH_AND_MADNESS_TALENT}>
          <>
            {formatNumber(this.resets)} CD Resets
            <br />
            <Insanity /> {formatNumber(this.insanityGained)} <small>Insanity generated</small>
          </>
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default DeathAndMadness;
