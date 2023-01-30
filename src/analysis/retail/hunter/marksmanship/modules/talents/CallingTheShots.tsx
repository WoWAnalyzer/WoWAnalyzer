import { t } from '@lingui/macro';
import { CTS_CDR_PER_FOCUS } from 'analysis/retail/hunter/marksmanship/constants';
import { formatNumber, formatPercentage } from 'common/format';
import { TALENTS_HUNTER } from 'common/TALENTS';
import RESOURCE_TYPES from 'game/RESOURCE_TYPES';
import { SpellLink } from 'interface';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { CastEvent } from 'parser/core/Events';
import { ThresholdStyle, When } from 'parser/core/ParseResults';
import SpellUsable from 'parser/shared/modules/SpellUsable';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';

/**
 * Every 50 Focus spent reduces the cooldown of Trueshot by 1.5 sec.
 *
 * Example log:
 *
 */

class CallingTheShots extends Analyzer {
  static dependencies = {
    spellUsable: SpellUsable,
  };

  effectiveTrueshotReductionMs = 0;
  wastedTrueshotReductionMs = 0;
  lastFocusCost = 0;

  protected spellUsable!: SpellUsable;

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(TALENTS_HUNTER.CALLING_THE_SHOTS_TALENT);
    this.addEventListener(Events.cast.by(SELECTED_PLAYER), this.onCast);
  }

  get callingTheShotsEfficacy() {
    return (
      this.effectiveTrueshotReductionMs /
      (this.effectiveTrueshotReductionMs + this.wastedTrueshotReductionMs)
    );
  }

  get callingTheShotsEfficacyThresholds() {
    return {
      actual: this.callingTheShotsEfficacy,
      isLessThan: {
        minor: 0.975,
        average: 0.95,
        major: 0.9,
      },
      style: ThresholdStyle.PERCENTAGE,
    };
  }

  onCast(event: CastEvent) {
    const resource = event.classResources?.find(
      (resource) => resource.type === RESOURCE_TYPES.FOCUS.id,
    );
    if (!resource) {
      return;
    }

    this.lastFocusCost = resource.cost || 0;
    const cooldownReductionMS = CTS_CDR_PER_FOCUS * this.lastFocusCost;
    if (!this.spellUsable.isOnCooldown(TALENTS_HUNTER.TRUESHOT_TALENT.id)) {
      this.wastedTrueshotReductionMs += cooldownReductionMS;
      return;
    }
    if (
      this.spellUsable.cooldownRemaining(TALENTS_HUNTER.TRUESHOT_TALENT.id) < cooldownReductionMS
    ) {
      const effectiveReductionMs = this.spellUsable.reduceCooldown(
        TALENTS_HUNTER.TRUESHOT_TALENT.id,
        cooldownReductionMS,
      );
      this.effectiveTrueshotReductionMs += effectiveReductionMs;
      this.wastedTrueshotReductionMs += cooldownReductionMS - effectiveReductionMs;
      return;
    }
    this.effectiveTrueshotReductionMs += this.spellUsable.reduceCooldown(
      TALENTS_HUNTER.TRUESHOT_TALENT.id,
      cooldownReductionMS,
    );
  }

  suggestions(when: When) {
    when(this.callingTheShotsEfficacyThresholds).addSuggestion((suggest, actual, recommended) =>
      suggest(
        <>
          When talented into <SpellLink id={TALENTS_HUNTER.CALLING_THE_SHOTS_TALENT.id} />, it is
          important to maximize its potential by not spending focus while{' '}
          <SpellLink id={TALENTS_HUNTER.TRUESHOT_TALENT.id} /> isn't on cooldown.
        </>,
      )
        .icon(TALENTS_HUNTER.CALLING_THE_SHOTS_TALENT.icon)
        .actual(
          t({
            id: 'hunter.marksmanship.suggestions.callingTheShots.efficiency',
            message: `You had ${formatPercentage(
              actual,
            )}% effective cooldown reduction from Calling the Shots`,
          }),
        )
        .recommended(`>${formatPercentage(recommended)}% is recommended`),
    );
  }

  statistic() {
    return (
      <Statistic
        position={STATISTIC_ORDER.OPTIONAL(13)}
        size="flexible"
        category={STATISTIC_CATEGORY.TALENTS}
      >
        <BoringSpellValueText spellId={TALENTS_HUNTER.CALLING_THE_SHOTS_TALENT.id}>
          <>
            {formatNumber(this.effectiveTrueshotReductionMs / 1000)}s /{' '}
            {formatNumber(
              (this.effectiveTrueshotReductionMs + this.wastedTrueshotReductionMs) / 1000,
            )}
            s <small>CDR</small>
          </>
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default CallingTheShots;
