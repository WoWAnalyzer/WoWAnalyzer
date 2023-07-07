import { Trans } from '@lingui/macro';
import { formatPercentage } from 'common/format';
import SPELLS from 'common/SPELLS';
import TALENTS from 'common/TALENTS/shaman';
import { SpellLink } from 'interface';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { BeginCastEvent, CastEvent } from 'parser/core/Events';
import { ThresholdStyle, When } from 'parser/core/ParseResults';

import RestorationAbilityTracker from '../core/RestorationAbilityTracker';

const TIDAL_WAVES_BUFF_MINIMAL_ACTIVE_TIME = 100; // Minimal duration for which you must have tidal waves. Prevents it from counting a HS/HW as buffed when you cast a riptide at the end.

class TidalWaves extends Analyzer {
  static dependencies = {
    abilityTracker: RestorationAbilityTracker,
  };
  protected abilityTracker!: RestorationAbilityTracker;

  constructor(options: Options) {
    super(options);

    this.addEventListener(
      Events.cast.by(SELECTED_PLAYER).spell(SPELLS.HEALING_SURGE),
      this._onHealingSurge,
    );
    this.addEventListener(
      Events.begincast.by(SELECTED_PLAYER).spell(TALENTS.HEALING_WAVE_TALENT),
      this._onHealingWave,
    );
    this.addEventListener(
      Events.cast.by(SELECTED_PLAYER).spell(TALENTS.CHAIN_HEAL_TALENT),
      this._onChainHeal,
    );
  }

  _onHealingSurge(event: CastEvent) {
    const hasTw = this.selectedCombatant.hasBuff(
      SPELLS.TIDAL_WAVES_BUFF.id,
      event.timestamp,
      0,
      TIDAL_WAVES_BUFF_MINIMAL_ACTIVE_TIME,
    );
    if (hasTw) {
      const cast = this.abilityTracker.getAbility(event.ability.guid, event.ability);
      cast.healingTwHits = (cast.healingTwHits || 0) + 1;
    }
  }

  _onHealingWave(event: BeginCastEvent) {
    if (event.isCancelled) {
      return;
    }

    const hasTw = this.selectedCombatant.hasBuff(
      SPELLS.TIDAL_WAVES_BUFF.id,
      event.timestamp,
      0,
      TIDAL_WAVES_BUFF_MINIMAL_ACTIVE_TIME,
    );
    if (hasTw) {
      const cast = this.abilityTracker.getAbility(event.ability.guid, event.ability);
      cast.healingTwHits = (cast.healingTwHits || 0) + 1;
    }
  }

  _onChainHeal(event: CastEvent) {
    const hasTw = this.selectedCombatant.hasBuff(
      SPELLS.TIDAL_WAVES_BUFF.id,
      event.timestamp,
      0,
      TIDAL_WAVES_BUFF_MINIMAL_ACTIVE_TIME,
    );
    if (hasTw) {
      const cast = this.abilityTracker.getAbility(event.ability.guid, event.ability);
      cast.healingTwHits = (cast.healingTwHits || 0) + 1;
    }
  }

  suggestions(when: When) {
    const suggestedThresholds = this.suggestionThresholds;
    when(suggestedThresholds.actual)
      .isGreaterThan(suggestedThresholds.isGreaterThan.minor)
      .addSuggestion((suggest) =>
        suggest(
          <Trans id="shaman.restoration.suggestions.tidalWaves.label">
            <SpellLink spell={SPELLS.TIDAL_WAVES_BUFF} /> buffed{' '}
            <SpellLink spell={TALENTS.HEALING_WAVE_TALENT} /> can make for some very efficient
            healing, consider casting more of them if you are running into mana issues (
            {formatPercentage(suggestedThresholds.actual)}% unused Tidal Waves).
          </Trans>,
        )
          .icon(SPELLS.TIDAL_WAVES_BUFF.icon)
          .actual(
            <Trans id="shaman.restoration.suggestions.tidalWaves.actual">
              {formatPercentage(suggestedThresholds.actual)}% unused Tidal waves
            </Trans>,
          )
          .recommended(
            <Trans id="shaman.restoration.suggestions.tidalWaves.recommended">
              Less than {formatPercentage(suggestedThresholds.isGreaterThan.minor, 0)}% unused is
              recommended
            </Trans>,
          )
          .regular(suggestedThresholds.isGreaterThan.average)
          .major(suggestedThresholds.isGreaterThan.major),
      );
  }

  get suggestionThresholds() {
    const riptide = this.abilityTracker.getAbility(TALENTS.RIPTIDE_TALENT.id);
    const healingWave = this.abilityTracker.getAbility(TALENTS.HEALING_WAVE_TALENT.id);
    const healingSurge = this.abilityTracker.getAbility(SPELLS.HEALING_SURGE.id);
    const chainHeal = this.abilityTracker.getAbility(TALENTS.CHAIN_HEAL_TALENT.id);

    const riptideCasts = riptide.casts || 0;
    const totalTwGenerated = riptideCasts * 2;
    const twHealingWaves = healingWave.healingTwHits || 0;
    const twHealingSurges = healingSurge.healingTwHits || 0;
    const twChainHeals = chainHeal.healingTwHits || 0;

    const totalTwUsed = twHealingWaves + twHealingSurges + twChainHeals;

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
