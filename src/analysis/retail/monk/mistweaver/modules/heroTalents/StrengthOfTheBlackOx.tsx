import type { JSX } from 'react';
import SPELLS from 'common/SPELLS';
import { TALENTS_MONK } from 'common/TALENTS';
import { formatNumber } from 'common/format';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, {
  AbsorbedEvent,
  AnyEvent,
  ApplyBuffEvent,
  CastEvent,
  HealEvent,
  RefreshBuffEvent,
  RemoveBuffEvent,
} from 'parser/core/Events';
import { getStrengthOfTheBlackOxConsumingCast } from '../../normalizers/CastLinkNormalizer';
import SpellLink from 'interface/SpellLink';
import { GUIDE_CORE_EXPLANATION_PERCENT } from '../../Guide';
import {
  QualitativePerformance,
  evaluateQualitativePerformanceByThreshold,
} from 'parser/ui/QualitativePerformance';
import GuideSection from 'interface/guide/components/GuideSection';
import CastDetail, { type PerCastData } from 'interface/guide/components/CastDetail';
import CastOverview from 'interface/guide/components/CastOverview';
import { CelestialHooks } from 'analysis/retail/monk/shared';
import {
  ENVELOPING_MIST_INCREASE,
  getCurrentCelestialTalent,
  MISTWRAP_INCREASE,
} from '../../constants';
import { STAMPEDE_OF_THE_ANCIENTS_INCREASE } from 'analysis/retail/monk/shared/hero/ConduitOfTheCelestials/constants';
import { addEnhancedCastReason } from 'parser/core/EventMetaLib';
import Statistic from 'parser/ui/Statistic';
import TalentSpellText from 'parser/ui/TalentSpellText';
import ItemHealingDone from 'parser/ui/ItemHealingDone';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import { CAST_BUFFER_MS } from '../../normalizers/EventLinks/EventLinkConstants';
import HotTrackerMW from '../core/HotTrackerMW';
import { calculateEffectiveHealing } from 'parser/core/EventCalculateLib';
import { ABILITIES_AFFECTED_BY_HEALING_INCREASES } from 'analysis/retail/monk/shared/constants';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';

const BATCH_TOLERANCE_MS = 100;
// a stampede boosted shield is 5x a normal one, this leaves room for external absorb increases on a single target
const BOOST_DETECTION_RATIO = 3;

export enum HealingSource {
  Shield,
  UnityShield,
  EnvelopingMist,
  EnvelopingMistBonus,
  MistyPeaks,
  MistyPeaksBonus,
  RenewingMist,
  StampedeBonus,
  StampedeWasted,
}

interface ShieldInfo {
  absorb: number;
  absorbed: number;
  base: number;
  boosted: boolean;
  fromUnity: boolean;
}

// due to a bug the target sometimes doesn't get a shield at all, in which case nothing is boosted
// the enveloping mist that consumes the buff is also counted since it (likely) would not have been cast otherwise
class StrengthOfTheBlackOx extends Analyzer.withDependencies({
  celestial: CelestialHooks,
  hotTracker: HotTrackerMW,
}) {
  talent = TALENTS_MONK.STRENGTH_OF_THE_BLACK_OX_TALENT;
  refreshedBuffs = 0;
  expiredBuffs = 0;
  entries: PerCastData[] = [];

  healingBySource = new Map<HealingSource, number>();
  evmHealingIncrease = 0;
  boostedShields = 0;
  batchesWithoutBoost = 0;
  hasStampede = false;
  lastUnityTimestamp = Number.MIN_SAFE_INTEGER;
  lastUnityOnFriendly = false;
  lastUnityCastTimestamp = Number.MIN_SAFE_INTEGER;
  unityBatchesWithTarget = 0;
  unityBatchesWithoutTarget = 0;
  activeShields = new Map<number, ShieldInfo>();
  pendingBatch: ShieldInfo[] = [];
  pendingBatchTimestamp = 0;

  constructor(options: Options) {
    super(options);

    this.active = this.selectedCombatant.hasTalent(this.talent);
    this.hasStampede = this.selectedCombatant.hasTalent(
      TALENTS_MONK.STAMPEDE_OF_THE_ANCIENTS_TALENT,
    );
    this.evmHealingIncrease = this.selectedCombatant.hasTalent(TALENTS_MONK.MIST_WRAP_TALENT)
      ? ENVELOPING_MIST_INCREASE + MISTWRAP_INCREASE
      : ENVELOPING_MIST_INCREASE;

    this.addEventListener(
      Events.refreshbuff.to(SELECTED_PLAYER).spell(SPELLS.STRENGTH_OF_THE_BLACK_OX_BUFF),
      this.onRefreshBuff,
    );
    this.addEventListener(
      Events.removebuff.to(SELECTED_PLAYER).spell(SPELLS.STRENGTH_OF_THE_BLACK_OX_BUFF),
      this.onRemoveBuff,
    );
    this.addEventListener(
      Events.cast.by(SELECTED_PLAYER).spell(SPELLS.UNITY_WITHIN_CAST),
      this.onUnityCast,
    );
    this.addEventListener(
      Events.removebuff.to(SELECTED_PLAYER).spell(SPELLS.UNITY_WITHIN_BUFF),
      this.onUnityWithin,
    );
    this.addEventListener(
      Events.applybuff.by(SELECTED_PLAYER).spell(SPELLS.STRENGTH_OF_THE_BLACK_OX_SHIELD),
      this.onApplyShield,
    );
    this.addEventListener(
      Events.refreshbuff.by(SELECTED_PLAYER).spell(SPELLS.STRENGTH_OF_THE_BLACK_OX_SHIELD),
      this.onApplyShield,
    );
    this.addEventListener(
      Events.absorbed.by(SELECTED_PLAYER).spell(SPELLS.STRENGTH_OF_THE_BLACK_OX_SHIELD),
      this.onAbsorbed,
    );
    this.addEventListener(
      Events.removebuff.by(SELECTED_PLAYER).spell(SPELLS.STRENGTH_OF_THE_BLACK_OX_SHIELD),
      this.onRemoveShield,
    );
    this.addEventListener(
      Events.heal.by(SELECTED_PLAYER).spell(TALENTS_MONK.ENVELOPING_MIST_TALENT),
      this.onEnvelopingMistHeal,
    );
    this.addEventListener(Events.heal.by(SELECTED_PLAYER), this.onEnvelopingMistBuffedHeal);
    this.addEventListener(
      Events.heal.by(SELECTED_PLAYER).spell(SPELLS.RENEWING_MIST_HEAL),
      this.onRenewingMistHeal,
    );
    this.addEventListener(Events.fightend, this.onFightEnd);
  }

  getHealing(source: HealingSource) {
    return this.healingBySource.get(source) || 0;
  }

  private addHealing(source: HealingSource, amount: number) {
    this.healingBySource.set(source, this.getHealing(source) + amount);
  }

  // unity shield and misty peaks are subsets of shield and enveloping mist
  get healing() {
    return (
      this.getHealing(HealingSource.Shield) +
      this.getHealing(HealingSource.EnvelopingMist) +
      this.getHealing(HealingSource.EnvelopingMistBonus) +
      this.getHealing(HealingSource.RenewingMist)
    );
  }

  private onRenewingMistHeal(event: HealEvent) {
    const hot = this.deps.hotTracker.getHot(event, SPELLS.RENEWING_MIST_HEAL.id);
    if (hot && this.deps.hotTracker.fromStrengthOfTheBlackOxRem(hot)) {
      this.addHealing(HealingSource.RenewingMist, (event.amount || 0) + (event.absorbed || 0));
    }
  }

  private onEnvelopingMistHeal(event: HealEvent) {
    const hot = this.deps.hotTracker.getHot(event, TALENTS_MONK.ENVELOPING_MIST_TALENT.id);
    if (hot && this.deps.hotTracker.fromStrengthOfTheBlackOx(hot)) {
      const healing = (event.amount || 0) + (event.absorbed || 0);
      if (!this.deps.celestial.celestialActive) {
        this.addHealing(HealingSource.EnvelopingMist, healing);
      }
      if (this.deps.hotTracker.fromMistyPeaks(hot)) {
        this.addHealing(HealingSource.MistyPeaks, healing);
      }
    }
  }

  private onEnvelopingMistBuffedHeal(event: HealEvent) {
    if (
      event.ability.guid === TALENTS_MONK.ENVELOPING_MIST_TALENT.id ||
      !ABILITIES_AFFECTED_BY_HEALING_INCREASES.includes(event.ability.guid)
    ) {
      return;
    }
    const hot = this.deps.hotTracker.getHot(event, TALENTS_MONK.ENVELOPING_MIST_TALENT.id);
    if (hot && this.deps.hotTracker.fromStrengthOfTheBlackOx(hot)) {
      const healing = calculateEffectiveHealing(event, this.evmHealingIncrease);
      if (!this.deps.celestial.celestialActive) {
        this.addHealing(HealingSource.EnvelopingMistBonus, healing);
      }
      if (this.deps.hotTracker.fromMistyPeaks(hot)) {
        this.addHealing(HealingSource.MistyPeaksBonus, healing);
      }
    }
  }

  isUnityTriggered(timestamp: number): boolean {
    return timestamp - this.lastUnityTimestamp <= CAST_BUFFER_MS;
  }

  // casting unity on a friendly gives it a primary target to boost, the boosted shield then lands
  // on someone in the batch rather than on the cast target itself
  // letting the buff expire instead fires unity with no cast and no target, so nothing is boosted -.-
  private get unityHasPrimaryTarget(): boolean {
    return (
      this.lastUnityOnFriendly &&
      Math.abs(this.lastUnityCastTimestamp - this.lastUnityTimestamp) <= CAST_BUFFER_MS
    );
  }

  private onUnityCast(event: CastEvent) {
    this.lastUnityOnFriendly = event.targetIsFriendly;
    this.lastUnityCastTimestamp = event.timestamp;
  }

  private onUnityWithin(event: RemoveBuffEvent) {
    this.lastUnityTimestamp = event.timestamp;
  }

  private onApplyShield(event: ApplyBuffEvent | RefreshBuffEvent) {
    this.flushBatch(event);
    const previous = this.activeShields.get(event.targetID);
    if (previous) {
      this.finalizeShield(event.targetID, previous.absorb - previous.absorbed);
    }
    const shield: ShieldInfo = {
      absorb: event.absorb || 0,
      absorbed: 0,
      base: event.absorb || 0,
      boosted: false,
      fromUnity: this.isUnityTriggered(event.timestamp),
    };
    this.activeShields.set(event.targetID, shield);
    if (this.pendingBatch.length === 0) {
      this.pendingBatchTimestamp = event.timestamp;
    }
    this.pendingBatch.push(shield);
  }

  private onAbsorbed(event: AbsorbedEvent) {
    this.flushBatch(event);
    this.addHealing(HealingSource.Shield, event.amount);
    const shield = this.activeShields.get(event.targetID);
    if (shield) {
      shield.absorbed += event.amount;
      if (shield.fromUnity) {
        this.addHealing(HealingSource.UnityShield, event.amount);
      }
    }
  }

  private onRemoveShield(event: RemoveBuffEvent) {
    this.flushBatch(event);
    this.finalizeShield(event.targetID, event.absorb || 0);
  }

  private onFightEnd() {
    this.classifyBatch();
    this.activeShields.forEach((shield, targetID) =>
      this.finalizeShield(targetID, shield.absorb - shield.absorbed),
    );
  }

  // classify the pending batch once events move past it
  private flushBatch(event: AnyEvent) {
    if (
      this.pendingBatch.length > 0 &&
      event.timestamp > this.pendingBatchTimestamp + BATCH_TOLERANCE_MS
    ) {
      this.classifyBatch();
    }
  }

  // unity within only boosts a shield when it was cast on a friendly, otherwise it has no primary target
  private classifyBatch() {
    const fromUnity = this.pendingBatch.some((shield) => shield.fromUnity);
    if (fromUnity && this.hasStampede && this.pendingBatch.length >= 2) {
      if (this.unityHasPrimaryTarget) {
        this.unityBatchesWithTarget += 1;
      } else {
        this.unityBatchesWithoutTarget += 1;
      }
    }
    if (
      !this.hasStampede ||
      this.pendingBatch.length < 2 ||
      (fromUnity && !this.unityHasPrimaryTarget)
    ) {
      this.pendingBatch = [];
      return;
    }
    const sorted = [...this.pendingBatch].sort((a, b) => a.absorb - b.absorb);
    const median = sorted[Math.floor(sorted.length / 2)].absorb;
    const largest = sorted[sorted.length - 1];
    if (largest.absorb > median * BOOST_DETECTION_RATIO) {
      largest.boosted = true;
      largest.base = largest.absorb / (1 + STAMPEDE_OF_THE_ANCIENTS_INCREASE);
      this.boostedShields += 1;
    } else {
      this.batchesWithoutBoost += 1;
    }
    this.pendingBatch = [];
  }

  // wasted shield
  private finalizeShield(targetID: number, remaining: number) {
    const shield = this.activeShields.get(targetID);
    if (!shield) return;

    this.activeShields.delete(targetID);
    if (!shield.boosted) return;

    const bonus = shield.absorb - shield.base;
    const bonusWasted = Math.min(bonus, Math.max(0, remaining));
    this.addHealing(HealingSource.StampedeBonus, bonus - bonusWasted);
    this.addHealing(HealingSource.StampedeWasted, bonusWasted);
  }

  private onRefreshBuff(event: RefreshBuffEvent) {
    this.refreshedBuffs += 1;
    this.entries.push({
      timestamp: this.owner.formatTimestamp(event.timestamp),
      performance: QualitativePerformance.Fail,
      stats: [],
      details: 'Buff refreshed before being consumed',
    });
  }

  private hasManaBuff(): boolean {
    return this.deps.celestial.celestialActive;
  }

  private onRemoveBuff(event: RemoveBuffEvent) {
    const consumingCast = getStrengthOfTheBlackOxConsumingCast(event);
    const isConsumed = consumingCast !== undefined;
    if (!isConsumed) {
      this.expiredBuffs += 1;
    }
    const hasBuff = this.hasManaBuff();
    const performance =
      isConsumed && hasBuff
        ? QualitativePerformance.Perfect
        : isConsumed !== hasBuff
          ? QualitativePerformance.Good
          : QualitativePerformance.Fail;
    this.entries.push({
      timestamp: this.owner.formatTimestamp(event.timestamp),
      performance,
      stats: [],
      details: isConsumed ? (
        <>
          Consumed {hasBuff ? 'with' : 'without'}{' '}
          <SpellLink spell={getCurrentCelestialTalent(this.selectedCombatant)} /> active
        </>
      ) : (
        'Buff expired before being consumed'
      ),
    });

    if (consumingCast) {
      addEnhancedCastReason(
        consumingCast,
        <>
          This cast consumed <SpellLink spell={SPELLS.STRENGTH_OF_THE_BLACK_OX_BUFF} />.
        </>,
      );
    }
  }

  get guideSubsection(): JSX.Element {
    const explanation = (
      <p>
        <b>
          <SpellLink spell={TALENTS_MONK.STRENGTH_OF_THE_BLACK_OX_TALENT} />
        </b>{' '}
        is a buff that makes your next <SpellLink spell={TALENTS_MONK.ENVELOPING_MIST_TALENT} />{' '}
        have a reduced cast time and apply a shield to 5 nearby allies. It is very important to
        never let this buff refresh or expire as it is a considerable amount of shielding. Try to
        have <SpellLink spell={getCurrentCelestialTalent(this.selectedCombatant)} /> active when
        casting <SpellLink spell={TALENTS_MONK.ENVELOPING_MIST_TALENT} /> as it is very expensive.
      </p>
    );
    const stats = [
      {
        value: `${this.expiredBuffs + this.refreshedBuffs}`,
        label: 'Wasted Buffs',
        tooltip: (
          <>
            <div>{this.expiredBuffs} expired</div>
            <div>{this.refreshedBuffs} refreshed</div>
          </>
        ),
        performance: evaluateQualitativePerformanceByThreshold({
          actual: this.expiredBuffs + this.refreshedBuffs,
          isLessThanOrEqual: { perfect: 0, good: 0, ok: 2 },
        }),
      },
    ];
    return (
      <GuideSection explanation={explanation} explanationPercent={GUIDE_CORE_EXPLANATION_PERCENT}>
        <CastOverview
          spell={TALENTS_MONK.STRENGTH_OF_THE_BLACK_OX_TALENT}
          title={
            <>
              <SpellLink spell={TALENTS_MONK.STRENGTH_OF_THE_BLACK_OX_TALENT} /> Overview
            </>
          }
          stats={stats}
        />
        <CastDetail title="Buff Utilization" casts={this.entries} />
      </GuideSection>
    );
  }

  statistic() {
    return (
      <Statistic
        position={STATISTIC_ORDER.CORE(1)}
        size="flexible"
        category={STATISTIC_CATEGORY.HERO_TALENTS}
        tooltip={
          <>
            <p>
              The <SpellLink spell={TALENTS_MONK.ENVELOPING_MIST_TALENT} /> casts that consume{' '}
              <SpellLink spell={SPELLS.STRENGTH_OF_THE_BLACK_OX_BUFF} /> would likely not have been
              made without the proc, so their healing and everything they generate is included here.
            </p>
            <ul>
              <li>
                <SpellLink spell={SPELLS.STRENGTH_OF_THE_BLACK_OX_SHIELD} /> shields:{' '}
                {formatNumber(this.getHealing(HealingSource.Shield))} (
                {formatNumber(this.getHealing(HealingSource.UnityShield))} from{' '}
                <SpellLink spell={TALENTS_MONK.UNITY_WITHIN_TALENT} />)
              </li>
              <li>
                <SpellLink spell={TALENTS_MONK.ENVELOPING_MIST_TALENT} /> direct healing:{' '}
                {formatNumber(this.getHealing(HealingSource.EnvelopingMist))} (
                {formatNumber(this.getHealing(HealingSource.MistyPeaks))} from{' '}
                <SpellLink spell={TALENTS_MONK.MISTY_PEAKS_TALENT} />)
              </li>
              <li>
                <SpellLink spell={TALENTS_MONK.ENVELOPING_MIST_TALENT} /> healing increase:{' '}
                {formatNumber(this.getHealing(HealingSource.EnvelopingMistBonus))} (
                {formatNumber(this.getHealing(HealingSource.MistyPeaksBonus))} from{' '}
                <SpellLink spell={TALENTS_MONK.MISTY_PEAKS_TALENT} />)
              </li>
              <li>
                <SpellLink spell={SPELLS.RENEWING_MIST_HEAL} /> from{' '}
                <SpellLink spell={TALENTS_MONK.RAPID_DIFFUSION_TALENT} /> and{' '}
                <SpellLink spell={TALENTS_MONK.DANCING_MISTS_TALENT} />:{' '}
                {formatNumber(this.getHealing(HealingSource.RenewingMist))}
              </li>
            </ul>
          </>
        }
      >
        <TalentSpellText talent={this.talent}>
          <ItemHealingDone amount={this.healing} />
        </TalentSpellText>
      </Statistic>
    );
  }
}

export default StrengthOfTheBlackOx;
