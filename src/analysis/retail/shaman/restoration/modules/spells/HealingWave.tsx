import { defineMessage, Trans } from '@lingui/macro';
import { formatPercentage } from 'common/format';
import SPELLS from 'common/SPELLS';
import TALENTS from 'common/TALENTS/shaman';
import { SpellLink } from 'interface';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { BeginCastEvent, CastEvent } from 'parser/core/Events';
import { When } from 'parser/core/ParseResults';
import SpellUsable from 'parser/shared/modules/SpellUsable';
import { addInefficientCastReason } from 'parser/core/EventMetaLib';

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
    this.addEventListener(
      Events.begincast.by(SELECTED_PLAYER).spell(SPELLS.HEALING_WAVE),
      this.onHealingWaveBegincast,
    );
    this.addEventListener(
      Events.cast.by(SELECTED_PLAYER).spell(SPELLS.HEALING_WAVE),
      this.onHealingWaveCast,
    );
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
    const hasTidalWave = this.selectedCombatant.hasBuff(
      SPELLS.TIDAL_WAVES_BUFF.id,
      event.timestamp,
      -1,
    );
    const hasFlashFlood = this.selectedCombatant.hasBuff(
      SPELLS.FLASH_FLOOD_BUFF.id,
      event.timestamp,
      -1,
    );
    if (hasTidalWave || hasFlashFlood) {
      return false;
    }

    const hasRiptideAvailable = this.spellUsable.isAvailable(TALENTS.RIPTIDE_TALENT.id);
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
      addInefficientCastReason(
        event,
        <Trans id="shaman.restoration.healingWave.inefficientCast.reason">
          Riptide was off cooldown when you started casting this unbuffed Healing Wave. Casting
          Riptide into Healing Wave to generate and use a Tidal Wave stack, or using a Flash Flood
          buff (if talented) is a lot more efficient compared to casting a full-length Healing Wave.
        </Trans>,
      );
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
        minor: 0.2,
        average: 0.4,
        major: 0.6,
      },
      style: 'percentage',
    };
  }

  suggestions(when: When) {
    const suggestedThreshold = this.suggestedThreshold;
    when(suggestedThreshold.actual)
      .isGreaterThan(suggestedThreshold.isGreaterThan.minor)
      .addSuggestion((suggest) =>
        suggest(
          <span>
            Casting <SpellLink spell={SPELLS.HEALING_WAVE} /> without{' '}
            <SpellLink spell={SPELLS.TIDAL_WAVES_BUFF} icon /> is slow and generally inefficient.
            Consider casting a riptide first to generate{' '}
            <SpellLink spell={SPELLS.TIDAL_WAVES_BUFF} icon />
          </span>,
        )
          .icon(SPELLS.HEALING_WAVE.icon)
          .actual(
            defineMessage({
              id: 'shaman.restoration.suggestions.healingWave.unbuffed',
              message: `${formatPercentage(suggestedThreshold.actual)}% of unbuffed Healing Waves`,
            }),
          )
          .recommended(
            `${formatPercentage(
              suggestedThreshold.isGreaterThan.minor,
            )}% of unbuffed Healing Waves`,
          )
          .regular(suggestedThreshold.isGreaterThan.average)
          .major(suggestedThreshold.isGreaterThan.major),
      );
  }
}

export default HealingWave;
