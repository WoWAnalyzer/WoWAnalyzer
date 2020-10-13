import React from 'react';

import Analyzer, { SELECTED_PLAYER, Options } from 'parser/core/Analyzer';
import { When, ThresholdStyle } from 'parser/core/ParseResults';
import Events, { CastEvent, ApplyDebuffEvent, RefreshDebuffEvent } from 'parser/core/Events';
import Enemies from 'parser/shared/modules/Enemies';
import SPELLS from 'common/SPELLS';
import SpellLink from 'common/SpellLink';
import { formatPercentage } from 'common/format';
import Statistic from 'interface/statistics/Statistic';
import STATISTIC_ORDER from 'interface/others/STATISTIC_ORDER';
import BoringSpellValueText from 'interface/statistics/components/BoringSpellValueText';
import AbilityTracker from 'parser/priest/shadow/modules/core/AbilityTracker';

import { MS_BUFFER } from '../../constants';

/*
  Shadow word pain can be created by:

  Hard casting
  Misery
  Dark Void

  Shadow Word pain can be refreshed by:

  Hard casting
  Misery
  Dark Void
  Void Bolt
 */
class ShadowWordPain extends Analyzer {
  static dependencies = {
    enemies: Enemies,
    abilityTracker: AbilityTracker,
  };
  protected enemies!: Enemies;
  protected abilityTracker!: AbilityTracker;

  lastCastTimestamp = 0;
  castedShadowWordPains = 0;
  appliedShadowWordPains = 0;
  refreshedShadowWordPains = 0;

  // Dark Void
  lastDarkVoidCastTimestamp = 0;
  darkVoidShadowWordPainApplications = 0;
  darkVoidShadowWordPainRefreshes = 0;

  constructor(options: Options) {
    super(options);
    this.addEventListener(Events.cast.by(SELECTED_PLAYER).spell(SPELLS.SHADOW_WORD_PAIN), this.onCast);
    this.addEventListener(Events.applydebuff.by(SELECTED_PLAYER).spell(SPELLS.SHADOW_WORD_PAIN), this.onDebuffApplied);
    this.addEventListener(Events.refreshdebuff.by(SELECTED_PLAYER).spell(SPELLS.SHADOW_WORD_PAIN), this.onDebuffRefreshed);
  }

  get uptime() {
    return this.enemies.getBuffUptime(SPELLS.SHADOW_WORD_PAIN.id) / this.owner.fightDuration;
  }

  get damage() {
    const spell = this.abilityTracker.getAbility(SPELLS.SHADOW_WORD_PAIN.id);
    return spell.damageEffective + spell.damageAbsorbed;
  }

  onCast(event: CastEvent) {
    this.castedShadowWordPains += 1;
  }

  onDebuffApplied(event: ApplyDebuffEvent) {
    this.appliedShadowWordPains += 1;

    if (this.lastCastTimestamp !== 0 && event.timestamp < this.lastCastTimestamp + MS_BUFFER) {
      this.darkVoidShadowWordPainApplications += 1;
    }
  }

  onDebuffRefreshed(event: RefreshDebuffEvent) {
    this.refreshedShadowWordPains += 1;

    if (this.lastCastTimestamp !== 0 && event.timestamp < this.lastCastTimestamp + MS_BUFFER) {
      this.darkVoidShadowWordPainRefreshes += 1;
    }
  }

  get suggestionThresholds() {
    return {
      actual: this.uptime,
      isLessThan: {
        minor: 0.95,
        average: 0.90,
        major: 0.8,
      },
      style: ThresholdStyle.PERCENTAGE,
    };
  }

  suggestions(when: When) {
    when(this.suggestionThresholds)
      .addSuggestion((suggest, actual, recommended) => suggest(<span>Your <SpellLink id={SPELLS.SHADOW_WORD_PAIN.id} /> uptime can be improved. Try to pay more attention to your <SpellLink id={SPELLS.SHADOW_WORD_PAIN.id} /> on the boss.</span>)
          .icon(SPELLS.SHADOW_WORD_PAIN.icon)
          .actual(`${formatPercentage(actual)}% Shadow Word: Pain uptime`)
          .recommended(`>${formatPercentage(recommended)}% is recommended`));
  }

  statistic() {
    return (
      <Statistic
        position={STATISTIC_ORDER.CORE(4)}
        size="flexible"
      >
        <BoringSpellValueText spell={SPELLS.SHADOW_WORD_PAIN}>
          <>
          {formatPercentage(this.uptime)}% <small>Uptime</small>
          </>
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default ShadowWordPain;
