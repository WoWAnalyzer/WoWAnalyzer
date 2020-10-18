import React from 'react';

import SpellLink from 'common/SpellLink';
import SPELLS from 'common/SPELLS';
import { formatPercentage } from 'common/format';

import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';

import { ThresholdStyle, When } from 'parser/core/ParseResults';
import Events, { BeginCastEvent, CastEvent } from 'parser/core/Events';

import { i18n } from '@lingui/core';
import { t, Trans } from '@lingui/macro';

import RestorationAbilityTracker from '../core/RestorationAbilityTracker';

const TIDAL_WAVES_BUFF_MINIMAL_ACTIVE_TIME = 100; // Minimal duration for which you must have tidal waves. Prevents it from counting a HS/HW as buffed when you cast a riptide at the end.

class TidalWaves extends Analyzer {
  static dependencies = {
    abilityTracker: RestorationAbilityTracker,
  };
  protected abilityTracker!: RestorationAbilityTracker;

  constructor(options: Options) {
    super(options);

    this.addEventListener(Events.cast.by(SELECTED_PLAYER).spell(SPELLS.HEALING_SURGE_RESTORATION), this._onHealingSurge);
    this.addEventListener(Events.begincast.by(SELECTED_PLAYER).spell(SPELLS.HEALING_WAVE), this._onHealingWave);
  }

  _onHealingSurge(event: CastEvent) {
    const hasTw = this.selectedCombatant.hasBuff(SPELLS.TIDAL_WAVES_BUFF.id, event.timestamp, 0, TIDAL_WAVES_BUFF_MINIMAL_ACTIVE_TIME);
    if (hasTw) {
      const cast = this.abilityTracker.getAbility(event.ability.guid, event.ability);
      cast.healingTwHits = (cast.healingTwHits || 0) + 1;
    }
  }

  _onHealingWave(event: BeginCastEvent) {
    if (event.isCancelled) {
      return;
    }

    const hasTw = this.selectedCombatant.hasBuff(SPELLS.TIDAL_WAVES_BUFF.id, event.timestamp, 0, TIDAL_WAVES_BUFF_MINIMAL_ACTIVE_TIME);
    if (hasTw) {
      const cast = this.abilityTracker.getAbility(event.ability.guid, event.ability);
      cast.healingTwHits = (cast.healingTwHits || 0) + 1;
    }
  }

  suggestions(when: When) {
    const suggestedThresholds = this.suggestionThresholds;
    when(suggestedThresholds.actual).isGreaterThan(suggestedThresholds.isGreaterThan.minor)
      .addSuggestion((suggest) => suggest(<Trans id="shaman.restoration.suggestions.tidalWaves.label"><SpellLink id={SPELLS.TIDAL_WAVES_BUFF.id} /> buffed <SpellLink id={SPELLS.HEALING_WAVE.id} /> can make for some very efficient healing, consider casting more of them if you are running into mana issues ({formatPercentage(suggestedThresholds.actual)}% unused Tidal Waves).</Trans>)
          .icon(SPELLS.TIDAL_WAVES_BUFF.icon)
          .actual(`${formatPercentage(suggestedThresholds.actual)}% ${i18n._(t('shaman.restoration.suggestions.tidalWaves.unused')`unused Tidal waves`)}`)
          .recommended(`<${formatPercentage(suggestedThresholds.isGreaterThan.minor, 0)}% ${i18n._(t('shaman.restoration.suggestions.tidalWaves.unused')`unused Tidal waves`)}`)
          .regular(suggestedThresholds.isGreaterThan.average).major(suggestedThresholds.isGreaterThan.major));
  }

  get suggestionThresholds() {
    const riptide = this.abilityTracker.getAbility(SPELLS.RIPTIDE.id);
    const healingWave = this.abilityTracker.getAbility(SPELLS.HEALING_WAVE.id);
    const healingSurge = this.abilityTracker.getAbility(SPELLS.HEALING_SURGE_RESTORATION.id);
    const chainHeal = this.abilityTracker.getAbility(SPELLS.CHAIN_HEAL.id);

    const chainHealCasts = chainHeal.casts || 0;
    const riptideCasts = riptide.casts || 0;
    const totalTwGenerated = riptideCasts + chainHealCasts;
    const twHealingWaves = healingWave.healingTwHits || 0;
    const twHealingSurges = healingSurge.healingTwHits || 0;

    const totalTwUsed = twHealingWaves + twHealingSurges;

    const unusedTwRate = 1 - totalTwUsed / totalTwGenerated;

    return {
      actual: unusedTwRate,
      isGreaterThan: {
        minor: 0.5,
        average: 0.8,
        major: 0.9,
      },
      style: ThresholdStyle.PERCENTAGE,
    };
  }
}

export default TidalWaves;
