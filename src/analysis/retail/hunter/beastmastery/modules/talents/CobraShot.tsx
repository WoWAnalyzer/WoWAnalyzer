import { formatNumber, formatPercentage } from 'common/format';
import TALENTS from 'common/TALENTS/hunter';
import RESOURCE_TYPES from 'game/RESOURCE_TYPES';
import { SpellLink } from 'interface';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { CastEvent } from 'parser/core/Events';
import { ThresholdStyle } from 'parser/core/ParseResults';
import SpellUsable from 'parser/shared/modules/SpellUsable';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';

import { COBRA_SHOT_KC_CDR_MS, COBRA_SHOT_FOCUS_THRESHOLD_TO_WAIT } from '../../constants';
import { addInefficientCastReason } from 'parser/core/EventMetaLib';

/**
 * A quick shot causing Physical damage.
 * Reduces the cooldown of Kill Command by 1 sec.
 *
 * Example log:
 * https://www.warcraftlogs.com/reports/bf3r17Yh86VvDLdF#fight=8&type=damage-done&source=1&ability=193455
 */

class CobraShot extends Analyzer {
  static dependencies = {
    spellUsable: SpellUsable,
  };

  effectiveKCReductionMs = 0;
  wastedKCReductionMs = 0;
  wastedCasts = 0;
  casts = 0;
  castsWithBarbedShotAvailable = 0;
  cobraShotCDR = COBRA_SHOT_KC_CDR_MS;

  protected spellUsable!: SpellUsable;

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(TALENTS.COBRA_SHOT_TALENT);
    this.addEventListener(
      Events.cast.by(SELECTED_PLAYER).spell(TALENTS.COBRA_SHOT_TALENT),
      this.onCobraShotCast,
    );
  }

  get totalPossibleCDR() {
    return Math.max(this.casts * this.cobraShotCDR, 1);
  }

  get wastedCDR() {
    return this.wastedKCReductionMs / 1000;
  }

  get cdrEfficiencyCobraShotThreshold() {
    return {
      actual: this.effectiveKCReductionMs / this.totalPossibleCDR,
      isLessThan: {
        minor: 0.85,
        average: 0.8,
        major: 0.75,
      },
      style: ThresholdStyle.PERCENTAGE,
    };
  }

  get wastedCobraShotsThreshold() {
    return {
      actual: this.wastedCasts,
      isGreaterThan: {
        minor: 0,
        average: 1,
        major: 2,
      },
      style: ThresholdStyle.NUMBER,
    };
  }

  onCobraShotCast(event: CastEvent) {
    this.casts += 1;

    if (
      this.selectedCombatant.hasTalent(TALENTS.BARBED_SHOT_TALENT) &&
      this.spellUsable.isAvailable(TALENTS.BARBED_SHOT_TALENT.id)
    ) {
      this.castsWithBarbedShotAvailable += 1;
      addInefficientCastReason(
        event,
        <>
          Cast while <SpellLink spell={TALENTS.BARBED_SHOT_TALENT} /> was available. Barbed Shot
          should always be prioritized over Cobra Shot.
        </>,
      );
    }

    if (!this.spellUsable.isOnCooldown(TALENTS.KILL_COMMAND_BEAST_MASTERY_TALENT.id)) {
      // Kill Command has both charges available - there's no cooldown for this to reduce.
      this.wastedCasts += 1;
      this.wastedKCReductionMs += this.cobraShotCDR;
      addInefficientCastReason(event, 'Cobra Shot cast while Kill Command is not on cooldown.');
      return;
    }
    // Kill Command has a charge recharging (whether or not another charge is already
    // banked) - reduceCooldown already accounts for multiple charges recharging and caps
    // the effective reduction at however much cooldown is actually left to remove.
    const effectiveReductionMs = this.spellUsable.reduceCooldown(
      TALENTS.KILL_COMMAND_BEAST_MASTERY_TALENT.id,
      this.cobraShotCDR,
    );
    this.effectiveKCReductionMs += effectiveReductionMs;
    this.wastedKCReductionMs += this.cobraShotCDR - effectiveReductionMs;

    if (effectiveReductionMs >= this.cobraShotCDR) {
      return;
    }
    const resource = event.classResources?.find(
      (resource) => resource.type === RESOURCE_TYPES.FOCUS.id,
    );
    if (!resource) {
      return;
    }
    if (resource.amount < COBRA_SHOT_FOCUS_THRESHOLD_TO_WAIT) {
      addInefficientCastReason(
        event,
        "Cobra Shot cast while Kill Command's remaining cooldown was under " +
          (this.cobraShotCDR / 1000).toFixed(1) +
          's and you were not close to capping focus as you only had ' +
          resource.amount +
          ' focus.',
      );
    }
  }

  statistic() {
    return (
      <>
        <Statistic
          position={STATISTIC_ORDER.OPTIONAL(3)}
          size="flexible"
          tooltip={
            this.wastedCasts > 0 && (
              <>
                You had {this.wastedCasts} {this.wastedCasts > 1 ? 'casts' : 'cast'} of Cobra Shot
                when Kill Command wasn't on cooldown.
              </>
            )
          }
        >
          <BoringSpellValueText spell={TALENTS.COBRA_SHOT_TALENT}>
            <>
              {formatNumber(this.effectiveKCReductionMs / 1000)}s / {this.totalPossibleCDR / 1000}s{' '}
              <small>effective CDR</small>
              <p />
              {formatPercentage(this.effectiveKCReductionMs / this.totalPossibleCDR)}%{' '}
              <small>effectiveness</small>
            </>
          </BoringSpellValueText>
        </Statistic>
        <Statistic
          position={STATISTIC_ORDER.OPTIONAL(4)}
          size="flexible"
          category={STATISTIC_CATEGORY.TALENTS}
          tooltip={
            <>
              Barbed Shot should always be prioritized over Cobra Shot - there's no scenario where
              casting Cobra Shot instead of an available Barbed Shot is correct.
            </>
          }
        >
          <BoringSpellValueText spell={TALENTS.COBRA_SHOT_TALENT}>
            <>
              {this.castsWithBarbedShotAvailable}/{this.casts}{' '}
              <small>Cobra Shots cast with Barbed Shot available</small>
            </>
          </BoringSpellValueText>
        </Statistic>
      </>
    );
  }
}

export default CobraShot;
