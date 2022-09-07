import { t } from '@lingui/macro';
import { CTS_CDR_MS } from 'analysis/retail/hunter/marksmanship/constants';
import { MS_BUFFER_100 } from 'analysis/retail/hunter/shared';
import { formatNumber, formatPercentage } from 'common/format';
import SPELLS from 'common/SPELLS';
import { SpellLink } from 'interface';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { DamageEvent } from 'parser/core/Events';
import { ThresholdStyle, When } from 'parser/core/ParseResults';
import SpellUsable from 'parser/shared/modules/SpellUsable';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';

/**
 * Casting Arcane Shot, Chimaera Shot or Multi-Shot reduces the cooldown of Trueshot by 2.5 sec.
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
  reductionTimestamp = 0;

  protected spellUsable!: SpellUsable;

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(SPELLS.CALLING_THE_SHOTS_TALENT.id);
    this.addEventListener(
      Events.damage
        .by(SELECTED_PLAYER)
        .spell([
          SPELLS.ARCANE_SHOT,
          SPELLS.MULTISHOT_MM,
          SPELLS.CHIMAERA_SHOT_MM_NATURE_DAMAGE,
          SPELLS.CHIMAERA_SHOT_MM_FROST_DAMAGE,
        ]),
      this.onCTSPotentialProc,
    );
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

  onCTSPotentialProc(event: DamageEvent) {
    if (event.timestamp > this.reductionTimestamp + MS_BUFFER_100) {
      if (this.spellUsable.isOnCooldown(SPELLS.TRUESHOT.id)) {
        if (this.spellUsable.cooldownRemaining(SPELLS.TRUESHOT.id) < CTS_CDR_MS) {
          const effectiveReductionMs = this.spellUsable.reduceCooldown(
            SPELLS.TRUESHOT.id,
            CTS_CDR_MS,
          );
          this.effectiveTrueshotReductionMs += effectiveReductionMs;
          this.wastedTrueshotReductionMs += CTS_CDR_MS - effectiveReductionMs;
        } else {
          this.effectiveTrueshotReductionMs += this.spellUsable.reduceCooldown(
            SPELLS.TRUESHOT.id,
            CTS_CDR_MS,
          );
        }
      } else {
        this.wastedTrueshotReductionMs += CTS_CDR_MS;
      }
    }
    this.reductionTimestamp = event.timestamp;
  }

  suggestions(when: When) {
    when(this.callingTheShotsEfficacyThresholds).addSuggestion((suggest, actual, recommended) =>
      suggest(
        <>
          When talented into <SpellLink id={SPELLS.CALLING_THE_SHOTS_TALENT.id} />, it is important
          to maximize its potential by not casting{' '}
          {this.selectedCombatant.hasTalent(SPELLS.CHIMAERA_SHOT_TALENT_MARKSMANSHIP.id) ? (
            <SpellLink id={SPELLS.CHIMAERA_SHOT_TALENT_MARKSMANSHIP.id} />
          ) : (
            <SpellLink id={SPELLS.ARCANE_SHOT.id} />
          )}{' '}
          or <SpellLink id={SPELLS.MULTISHOT_MM.id} /> while <SpellLink id={SPELLS.TRUESHOT.id} />{' '}
          isn't on cooldown.
        </>,
      )
        .icon(SPELLS.CALLING_THE_SHOTS_TALENT.icon)
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
        <BoringSpellValueText spellId={SPELLS.CALLING_THE_SHOTS_TALENT.id}>
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
