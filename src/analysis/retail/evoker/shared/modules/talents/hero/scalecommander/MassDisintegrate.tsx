import { Options } from 'parser/core/Analyzer';
import TALENTS from 'common/TALENTS/evoker';
import SPELLS from 'common/SPELLS/evoker';
import {
  ApplyBuffEvent,
  ApplyBuffStackEvent,
  CastEvent,
  RefreshBuffEvent,
  RemoveBuffEvent,
  RemoveBuffStackEvent,
} from 'parser/core/Events';
import {
  getDisintegrateDamageEvents,
  isMassDisintegrateTick,
} from 'analysis/retail/evoker/devastation/modules/normalizers/CastLinkNormalizer';
import { calculateEffectiveDamage } from 'parser/core/EventCalculateLib';
import {
  MASS_DISINTEGRATE_TARGETS,
  MASS_DISINTEGRATE_MULTIPLIER_PER_MISSING_TARGET,
  MASS_ERUPTION_MULTIPLIER_PER_MISSING_TARGET,
  CONCENTRATED_POWER_EXTRA_TARGETS,
} from 'analysis/retail/evoker/shared/constants';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import ItemDamageDone from 'parser/ui/ItemDamageDone';
import SpellLink from 'interface/SpellLink';
import { formatNumber } from 'common/format';
import { InformationIcon, WarningIcon } from 'interface/icons';
import {
  getEruptionDamageEvents,
  getMassEruptionDamageEvents,
} from 'analysis/retail/evoker/augmentation/modules/normalizers/CastLinkNormalizer';
import { getMassCast, getMassEventTargetCount } from './ScalecommanderTargetHelper';
import { QualitativePerformance } from 'parser/ui/QualitativePerformance';
import { AnalysisData } from 'analysis/retail/evoker/shared/modules/components/ProcAnalysis';
import ProcBuffAnalyzer, { ProcBuffAnalyzerOptions } from '../../../core/ProcBuffAnalyzer';

type DamageResult = {
  ampedDamage: number;
  extraDamage: number;
};

const ProcBuffOptions: ProcBuffAnalyzerOptions = {
  trackedBuffs: [SPELLS.MASS_DISINTEGRATE_BUFF, SPELLS.MASS_ERUPTION_BUFF],
  inactiveListeners: {},
  stackOptions: {
    amountOfStacksGenerated: 1,
    maxStacks: 2,
    settings: {
      overcapBuffIsFail: true,
      refreshingBuffIsFail: false,
    },
  },
};

/**
 * Empower spells cause your next Disintegrate/Eruption to strike up to 3 targets.
 * When striking less than 3 targets, Disintegrate damage is increased by 15% for each missing target.
 *
 * Concentrated Power:
 * Mass Disintegrate/Eruption strikes 1 additional target.
 */
class MassDisintegrate extends ProcBuffAnalyzer {
  buffCount = 0;
  castCount = 0;
  targetCount = 0;
  damageFromAmp = 0;
  damageFromExtraTargets = 0;

  isDevastation = this.selectedCombatant.hasTalent(TALENTS.MASS_DISINTEGRATE_TALENT);

  maxTargets = MASS_DISINTEGRATE_TARGETS;
  maxBaseTargets = MASS_DISINTEGRATE_TARGETS;
  maxTargetsForAmp = MASS_DISINTEGRATE_TARGETS;

  damageFromConcentratedPowerAmp = 0;
  damageFromConcentratedPowerExtraTargets = 0;
  hasConcentratedPower = this.selectedCombatant.hasTalent(TALENTS.CONCENTRATED_POWER_TALENT);

  constructor(options: Options) {
    super(options, ProcBuffOptions);
    this.active =
      this.selectedCombatant.hasTalent(TALENTS.MASS_DISINTEGRATE_TALENT) ||
      this.selectedCombatant.hasTalent(TALENTS.MASS_ERUPTION_TALENT);

    if (this.hasConcentratedPower) {
      this.maxTargets += CONCENTRATED_POWER_EXTRA_TARGETS;
      this.maxTargetsForAmp += CONCENTRATED_POWER_EXTRA_TARGETS;
    }
  }

  onApplyBuff(event: ApplyBuffEvent) {
    this.onAddBuff();
  }
  onApplyBuffStack(event: ApplyBuffStackEvent) {
    this.onAddBuff();
  }
  private onAddBuff() {
    this.buffCount += 1;
  }

  onRefreshBuff(event: RefreshBuffEvent) {
    return;
  }
  onRemoveBuff(event: RemoveBuffEvent) {
    this.onMassBuffRemove(event);
  }
  onRemoveBuffStack(event: RemoveBuffStackEvent) {
    this.onMassBuffRemove(event);
  }

  // Shared cast handler that delegates to the appropriate spell handler for the damage specifics.
  private onMassBuffRemove(event: RemoveBuffEvent | RemoveBuffStackEvent) {
    const castEvent = getMassCast(event);

    if (castEvent === undefined) {
      this.pushCastData(
        event,
        `Buff expired, wasting ${-this.stackDifference} stack(s)`,
        QualitativePerformance.Fail,
      );
      return;
    }

    this.castCount += 1;
    const targetCount = getMassEventTargetCount(castEvent, this.maxTargetsForAmp);
    const missingTargetCount = this.maxTargetsForAmp - targetCount;
    this.targetCount += targetCount;

    const damageResult =
      castEvent.ability.guid === SPELLS.DISINTEGRATE.id
        ? this.onDisintegrateCast(castEvent, missingTargetCount)
        : this.onEruptionCast(castEvent, missingTargetCount);

    this.attributeDamage(damageResult, targetCount);
    this.pushCastData(castEvent, 'Buff used', QualitativePerformance.Good);
  }

  private onEruptionCast(event: CastEvent, missingTargetCount: number) {
    const eruptionDamageEvents = getEruptionDamageEvents(event);
    const massEruptionDamageEvents = getMassEruptionDamageEvents(event);

    const damageResult: DamageResult = {
      ampedDamage: 0,
      extraDamage: 0,
    };

    if (missingTargetCount > 0) {
      eruptionDamageEvents.forEach((damageEvent) => {
        damageResult.ampedDamage += calculateEffectiveDamage(
          damageEvent,
          MASS_ERUPTION_MULTIPLIER_PER_MISSING_TARGET * missingTargetCount,
        );
      });

      massEruptionDamageEvents.forEach((damageEvent) => {
        const extraAmpDamage = calculateEffectiveDamage(
          damageEvent,
          MASS_ERUPTION_MULTIPLIER_PER_MISSING_TARGET * missingTargetCount,
        );

        damageResult.ampedDamage += extraAmpDamage;
        damageResult.extraDamage +=
          damageEvent.amount + (damageEvent.absorbed || 0) - extraAmpDamage;
      });
    } else {
      damageResult.extraDamage += massEruptionDamageEvents.reduce((total, damageEvent) => {
        return total + damageEvent.amount + (damageEvent.absorbed || 0);
      }, 0);
    }
    return damageResult;
  }

  private onDisintegrateCast(event: CastEvent, missingTargetCount: number) {
    const damageEvents = getDisintegrateDamageEvents(event);

    const damageResult: DamageResult = damageEvents.reduce(
      (acc, damageEvent) => {
        const ampedDamage =
          missingTargetCount > 0
            ? calculateEffectiveDamage(
                damageEvent,
                MASS_DISINTEGRATE_MULTIPLIER_PER_MISSING_TARGET * missingTargetCount,
              )
            : 0;
        acc.ampedDamage += ampedDamage;

        if (isMassDisintegrateTick(damageEvent)) {
          acc.extraDamage += damageEvent.amount + (damageEvent.absorbed || 0) - ampedDamage;
        }

        return acc;
      },
      { ampedDamage: 0, extraDamage: 0 },
    );

    return damageResult;
  }

  private attributeDamage(damageResult: DamageResult, targetCount: number) {
    if (!this.hasConcentratedPower) {
      this.damageFromAmp += damageResult.ampedDamage;
      this.damageFromExtraTargets += damageResult.extraDamage;
      return;
    }

    // For simplicity’s sake we just attribute a relative fraction of the damage to concentrated power
    if (targetCount > this.maxBaseTargets) {
      const extraTargetsHit = targetCount - 1;
      const damagePerTarget = damageResult.extraDamage / extraTargetsHit;

      const concentratedPowerExtraTargetsHit = targetCount - this.maxBaseTargets;

      this.damageFromConcentratedPowerExtraTargets +=
        damagePerTarget * concentratedPowerExtraTargetsHit;
      this.damageFromExtraTargets +=
        damagePerTarget * (extraTargetsHit - concentratedPowerExtraTargetsHit);
      return;
    }

    this.damageFromExtraTargets += damageResult.extraDamage;

    if (targetCount === this.maxBaseTargets) {
      // If we have hit the max base targets, we only received amped from the missing concentrated power targets
      this.damageFromConcentratedPowerAmp += damageResult.ampedDamage;
      return;
    }

    // TODO: if they ever bump concentrated power to more than +1 target revisit this, might have a off-by-one error
    //  kinda doesn't matter for now since it's only +1 target
    const amountOfMissingTargets = this.maxTargetsForAmp - targetCount;
    const ampedDamagePerMissingTarget = damageResult.ampedDamage / amountOfMissingTargets;

    this.damageFromConcentratedPowerAmp +=
      ampedDamagePerMissingTarget * CONCENTRATED_POWER_EXTRA_TARGETS;
    this.damageFromAmp +=
      ampedDamagePerMissingTarget * (amountOfMissingTargets - CONCENTRATED_POWER_EXTRA_TARGETS);
    return damageResult;
  }

  get averageTargets() {
    return this.targetCount / this.castCount;
  }

  get consumedBuffs() {
    return this.castCount;
  }

  get wastedBuffs() {
    return this.buffCount - this.castCount;
  }

  get totalBuffs() {
    return this.buffCount;
  }

  get procUsageData(): AnalysisData {
    return {
      casts: this.casts,
      spell: this.selectedCombatant.hasTalent(TALENTS.MASS_DISINTEGRATE_TALENT)
        ? SPELLS.MASS_DISINTEGRATE_BUFF
        : SPELLS.MASS_ERUPTION_BUFF,
    };
  }

  statistic() {
    const concentratedPowerTargetsTerm =
      CONCENTRATED_POWER_EXTRA_TARGETS > 1 ? 'targets' : 'target';

    return (
      <Statistic
        position={STATISTIC_ORDER.CORE()}
        size="flexible"
        category={STATISTIC_CATEGORY.HERO_TALENTS}
        tooltip={
          <>
            <li>Damage from amp: {formatNumber(this.damageFromAmp)}</li>
            <li>Damage from extra targets: {formatNumber(this.damageFromExtraTargets)}</li>
            {this.hasConcentratedPower && (
              <>
                {this.damageFromConcentratedPowerAmp > 0 && (
                  <li>
                    Damage from <SpellLink spell={TALENTS.CONCENTRATED_POWER_TALENT} /> amp:{' '}
                    {formatNumber(this.damageFromConcentratedPowerAmp)}
                  </li>
                )}
                <li>
                  Damage from extra <SpellLink spell={TALENTS.CONCENTRATED_POWER_TALENT} />{' '}
                  {concentratedPowerTargetsTerm}:{' '}
                  {formatNumber(this.damageFromConcentratedPowerExtraTargets)}
                </li>
              </>
            )}
          </>
        }
      >
        <div className="pad">
          <label>
            <SpellLink
              spell={
                this.isDevastation ? TALENTS.MASS_DISINTEGRATE_TALENT : TALENTS.MASS_ERUPTION_TALENT
              }
            />
          </label>

          <strong>Damage from amp:</strong>
          <div className="value">
            <ItemDamageDone amount={this.damageFromAmp} />
          </div>

          <strong>Damage from extra targets:</strong>
          <div className="value">
            <ItemDamageDone amount={this.damageFromExtraTargets} />
          </div>

          <div className="value">
            <InformationIcon /> {this.averageTargets.toFixed(2)}
            <small> average targets per cast</small>
          </div>

          {this.wastedBuffs > 0 && (
            <div className="value">
              <WarningIcon /> {this.wastedBuffs}{' '}
              <small>
                <SpellLink
                  spell={
                    this.isDevastation ? SPELLS.MASS_DISINTEGRATE_BUFF : SPELLS.MASS_ERUPTION_BUFF
                  }
                />{' '}
                wasted
              </small>
            </div>
          )}
        </div>
        {this.hasConcentratedPower && (
          <div className="pad">
            <label>
              <SpellLink spell={TALENTS.CONCENTRATED_POWER_TALENT} />
            </label>
            {this.damageFromConcentratedPowerAmp > 0 && (
              <>
                <strong>Damage from amp:</strong>
                <div className="value">
                  <ItemDamageDone amount={this.damageFromConcentratedPowerAmp} />
                </div>
              </>
            )}
            <strong>Damage from extra {concentratedPowerTargetsTerm}:</strong>
            <div className="value">
              <ItemDamageDone amount={this.damageFromConcentratedPowerExtraTargets} />
            </div>
          </div>
        )}
      </Statistic>
    );
  }
}

export default MassDisintegrate;
