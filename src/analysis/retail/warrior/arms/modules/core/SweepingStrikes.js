import { t } from '@lingui/macro';
import { formatPercentage } from 'common/format';
import SPELLS from 'common/SPELLS';
import { SpellLink } from 'interface';
import Analyzer, { SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events from 'parser/core/Events';
import Abilities from 'parser/core/modules/Abilities';
import { ThresholdStyle } from 'parser/core/ParseResults';

import SpellUsable from '../features/SpellUsable';

/**
 * Example report: /report/YXFby87mzNrLtwj1/12-Normal+King+Rastakhan+-+Wipe+1+(3:32)/30-Korebian/timeline
 */

class SweepingStrikes extends Analyzer {
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

  static dependencies = {
    spellUsable: SpellUsable,
    abilities: Abilities,
  };
  totalCasts = 0;
  badCasts = 0;

  constructor(...args) {
    super(...args);
    this.addEventListener(
      Events.cast.by(SELECTED_PLAYER).spell(SPELLS.SWEEPING_STRIKES),
      this._castSweepingStrikes,
    );
  }

  _castSweepingStrikes(event) {
    this.totalCasts += 1;

    const spell = this.selectedCombatant.hasTalent(SPELLS.WARBREAKER_TALENT)
      ? SPELLS.WARBREAKER_TALENT
      : SPELLS.COLOSSUS_SMASH;
    const spellCd = this.abilities.getAbility(spell.id).cooldown;
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

  suggestions(when) {
    when(this.suggestionThresholds).addSuggestion((suggest, actual, recommended) =>
      suggest(
        <>
          Try to cast <SpellLink id={SPELLS.SWEEPING_STRIKES.id} icon /> before{' '}
          <SpellLink id={SPELLS.COLOSSUS_SMASH.id} /> (or{' '}
          <SpellLink id={SPELLS.WARBREAKER_TALENT.id} /> if talented).
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
