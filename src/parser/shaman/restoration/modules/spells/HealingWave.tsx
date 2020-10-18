import React from 'react';
import SPELLS from 'common/SPELLS';
import SpellLink from 'common/SpellLink';

import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import { formatPercentage } from 'common/format';
import SpellUsable from 'parser/shared/modules/SpellUsable';
import Events, { BeginCastEvent, CastEvent } from 'parser/core/Events';
import { When } from 'parser/core/ParseResults';

import { i18n } from '@lingui/core';
import { t, Trans } from '@lingui/macro';

import RestorationAbilityTracker from '../core/RestorationAbilityTracker';

class HealingWave extends Analyzer {
  static dependencies = {
    abilityTracker: RestorationAbilityTracker,
    spellUsable: SpellUsable,
  };

  protected abilityTracker!: RestorationAbilityTracker;
  protected spellUsable!: SpellUsable;

  constructor(options: Options) {
    super(options);

    this.addEventListener(Events.begincast.by(SELECTED_PLAYER).spell(SPELLS.HEALING_WAVE), this.onHealingWaveBegincast);
    this.addEventListener(Events.cast.by(SELECTED_PLAYER).spell(SPELLS.HEALING_WAVE), this.onHealingWaveCast);
  }

  _isCurrentCastInefficient = false;
  onHealingWaveBegincast(event: BeginCastEvent) {
    if (this._isInefficientCastEvent(event)) {
      this._isCurrentCastInefficient = true;
    } else {
      this._isCurrentCastInefficient = false;
    }
  }

  _isInefficientCastEvent(event: BeginCastEvent) {
    const hasTidalWave = this.selectedCombatant.hasBuff(SPELLS.TIDAL_WAVES_BUFF.id, event.timestamp, -1);
    const hasFlashFlood = this.selectedCombatant.hasBuff(SPELLS.FLASH_FLOOD_BUFF.id, event.timestamp, -1);
    if (hasTidalWave || hasFlashFlood) {
      return false;
    }

    const hasRiptideAvailable = this.spellUsable.isAvailable(SPELLS.RIPTIDE.id);
    if (!hasRiptideAvailable) {
      return false;
    }
    return true;
  }

  /**
   * This marks spells as inefficient casts in the timeline.
   * @param event
   */
  onHealingWaveCast(event: CastEvent) {
    if (this._isCurrentCastInefficient) {
      event.meta = event.meta || {};
      event.meta.isInefficientCast = true;
      event.meta.inefficientCastReason = <Trans id="shaman.restoration.healingWave.inefficientCast.reason">Riptide was off cooldown when you started casting this unbuffed Healing Wave. Casting Riptide into Healing Wave to generate and use a Tidal Wave stack, or using a Flash Flood buff (if talented) is a lot more efficient compared to casting a full-length Healing Wave.</Trans>;
    }
  }

  get suggestedThreshold() {
    const healingWave = this.abilityTracker.getAbility(SPELLS.HEALING_WAVE.id);

    const twHealingWaves = healingWave.healingTwHits || 0;
    const healingWaveCasts = healingWave.casts || 0;
    const unbuffedHealingWaves = healingWaveCasts - twHealingWaves;
    const unbuffedHealingWavesPerc = unbuffedHealingWaves / healingWaveCasts;

    return {
      actual: unbuffedHealingWavesPerc,
      isGreaterThan: {
        minor: 0.20,
        average: 0.40,
        major: 0.60,
      },
      style: 'percentage',
    };
  }

  suggestions(when: When) {
    const suggestedThreshold = this.suggestedThreshold;
    when(suggestedThreshold.actual).isGreaterThan(suggestedThreshold.isGreaterThan.minor)
      .addSuggestion((suggest) => suggest(<span>Casting <SpellLink id={SPELLS.HEALING_WAVE.id} /> without <SpellLink id={SPELLS.TIDAL_WAVES_BUFF.id} icon /> is slow and generally inefficient. Consider casting a riptide first to generate <SpellLink id={SPELLS.TIDAL_WAVES_BUFF.id} icon /></span>)
          .icon(SPELLS.HEALING_WAVE.icon)
          .actual(i18n._(t('shaman.restoration.suggestions.healingWave.unbuffed')`${formatPercentage(suggestedThreshold.actual)}% of unbuffed Healing Waves`))
          .recommended(`${formatPercentage(suggestedThreshold.isGreaterThan.minor)}% of unbuffed Healing Waves`)
          .regular(suggestedThreshold.isGreaterThan.average).major(suggestedThreshold.isGreaterThan.major));
  }
}

export default HealingWave;
