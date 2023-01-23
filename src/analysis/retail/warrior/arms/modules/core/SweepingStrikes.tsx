import { t } from '@lingui/macro';
import { formatPercentage } from 'common/format';
import SPELLS from 'common/SPELLS';
import TALENTS from 'common/TALENTS/warrior';
import { SpellLink } from 'interface';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { CastEvent } from 'parser/core/Events';
import Abilities from 'parser/core/modules/Abilities';
import { ThresholdStyle, When } from 'parser/core/ParseResults';

import SpellUsable from '../features/SpellUsable';

/**
 * Example report: /report/YXFby87mzNrLtwj1/12-Normal+King+Rastakhan+-+Wipe+1+(3:32)/30-Korebian/timeline
 */

class SweepingStrikes extends Analyzer {
  static dependencies = {
    spellUsable: SpellUsable,
    abilities: Abilities,
  };

  protected spellUsable!: SpellUsable;
  protected abilities!: Abilities;

  totalCasts = 0;
  badCasts = 0;

  get suggestionThresholds() {
    return {
      actual: this.badCasts / this.totalCasts,
      isGreaterThan: {
        minor: 0,
        average: 0.2,
        major: 0.5,
      },
      style: ThresholdStyle.PERCENTAGE,
    };
  }

  constructor(options: Options) {
    super(options);
    this.addEventListener(
      Events.cast.by(SELECTED_PLAYER).spell(SPELLS.SWEEPING_STRIKES),
      this._castSweepingStrikes,
    );
  }

  _castSweepingStrikes(event: CastEvent) {
    this.totalCasts += 1;

    const spell = this.selectedCombatant.hasTalent(TALENTS.WARBREAKER_TALENT)
      ? TALENTS.WARBREAKER_TALENT
      : SPELLS.COLOSSUS_SMASH;
    const spellCd = this.abilities.getAbility(spell.id)?.cooldown || 30;
    if (this.spellUsable.isOnCooldown(spell.id)) {
      const cdElapsed = spellCd * 1000 - this.spellUsable.cooldownRemaining(spell.id);
      if (cdElapsed < 1000) {
        this.badCasts += 1;
        event.meta = event.meta || {};
        event.meta.isInefficientCast = true;
        event.meta.inefficientCastReason = `This Sweeping Strikes was used on a target during ${spell.name}.`;
      }
    }
  }

  suggestions(when: When) {
    when(this.suggestionThresholds).addSuggestion((suggest, actual, recommended) =>
      suggest(
        <>
          Try to cast <SpellLink id={SPELLS.SWEEPING_STRIKES.id} icon /> before{' '}
          <SpellLink id={SPELLS.COLOSSUS_SMASH.id} /> (or{' '}
          <SpellLink id={TALENTS.WARBREAKER_TALENT.id} /> if talented).
        </>,
      )
        .icon(SPELLS.SWEEPING_STRIKES.icon)
        .actual(
          t({
            id: 'warrior.arms.suggestions.sweepingStrikes.efficiency',
            message: `Sweeping Strikes was used ${formatPercentage(
              actual,
            )}% of the time shortly after Colossus Smash/Warbreaker.`,
          }),
        )
        .recommended(`${formatPercentage(recommended)}% is recommended`),
    );
  }
}

export default SweepingStrikes;
