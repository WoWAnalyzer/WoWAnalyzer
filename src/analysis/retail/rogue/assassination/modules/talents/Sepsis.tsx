import MajorCooldown, {
  createChecklistItem,
  SpellCast,
} from 'parser/core/MajorCooldowns/MajorCooldown';
import { SpellUse, UsageInfo } from 'parser/core/SpellUsage/core';
import React from 'react';
import { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import SPELLS from 'common/SPELLS/rogue';
import TALENTS from 'common/TALENTS/rogue';
import Events, { ApplyBuffEvent, ApplyDebuffEvent, CastEvent, EventType } from 'parser/core/Events';
import SpellLink from 'interface/SpellLink';
import Enemies from 'parser/shared/modules/Enemies';
import { isDefined } from 'common/typeGuards';
import { combineQualitativePerformances } from 'common/combineQualitativePerformances';
import { QualitativePerformance } from 'parser/ui/QualitativePerformance';
import {
  getRelatedBuffApplicationFromHardcast,
  getDebuffApplicationFromHardcast,
  getSepsisConsumptionCastForBuffEvent,
  getAuraLifetimeEvent,
} from '../../normalizers/SepsisLinkNormalizer';
import {
  SEPSIS_DEBUFF_DURATION,
  SEPSIS_BUFF_DURATION,
} from '../../normalizers/SepsisLinkNormalizer';
import { ExplanationSection } from 'analysis/retail/demonhunter/shared/guide/CommonComponents';
import { Expandable } from 'interface';
import { SectionHeader } from 'interface/guide';
import { BUFF_DROP_BUFFER } from 'parser/core/DotSnapshots';
import { formatPercentage } from 'common/format';
import { GARROTE_BASE_DURATION, isInOpener } from '../../constants';
import { CAST_BUFFER_MS } from '../../normalizers/CastLinkNormalizer';
import { TrackedBuffEvent } from 'parser/core/Entity';

const SHIV_DURATION = 8 * 1000;
const BASE_ROGUE_GCD = 1000;
const PRIMARY_BUFF_KEY = 1;
const SECONDARY_BUFF_KEY = 2;

const formatSeconds = (ms: number, precision: number = 0): string => {
  if (ms % 1000 === 0) {
    return (ms / 1000).toFixed(0);
  }
  return (ms / 1000).toFixed(precision);
};

interface SepsisDebuff {
  applyEvent: ApplyDebuffEvent;
  timeRemainingOnRemoval: number;
  start: number;
  end?: number;
}
interface SepsisBuff extends Omit<SepsisDebuff, 'applyEvent'> {
  applyEvent: ApplyBuffEvent;
  consumeCast: CastEvent | undefined;
}
interface SepsisCast extends SpellCast {
  buffs: {
    [PRIMARY_BUFF_KEY]?: SepsisBuff;
    [SECONDARY_BUFF_KEY]?: SepsisBuff;
  };
  debuff?: SepsisDebuff;
  shivData?: {
    events: TrackedBuffEvent[];
    overlapMs: number;
    overlapPercent: number;
  };
}
export default class Sepsis extends MajorCooldown<SepsisCast> {
  static dependencies = {
    ...MajorCooldown.dependencies,
    enemies: Enemies,
  };
  protected enemies!: Enemies;
  overallSepsisCasts: SepsisCast[] = [];
  usingLightweightShiv: boolean = this.selectedCombatant.hasTalent(TALENTS.LIGHTWEIGHT_SHIV_TALENT);

  constructor(options: Options) {
    super({ spell: TALENTS.SEPSIS_TALENT }, options);
    this.addEventListener(
      Events.cast.by(SELECTED_PLAYER).spell(TALENTS.SEPSIS_TALENT),
      this.onSepsisCast,
    );
    this.addEventListener(Events.fightend, this.onEnd);
  }

  description(): React.ReactNode {
    return (
      <>
        <ExplanationSection>
          <p>
            <strong>
              <SpellLink spell={TALENTS.SEPSIS_TALENT} />
            </strong>{' '}
            is a strong cooldown that allows for much higher uptime on
            <SpellLink spell={TALENTS.IMPROVED_GARROTE_TALENT} /> in fights.
          </p>
        </ExplanationSection>
        <ExplanationSection>
          <Expandable
            header={
              <SectionHeader>
                <strong>The first buff</strong>
              </SectionHeader>
            }
            element="section"
          >
            <div>
              The first buff from <SpellLink spell={TALENTS.SEPSIS_TALENT} /> should always be
              consumed by <SpellLink spell={TALENTS.IMPROVED_GARROTE_TALENT} /> as the very next
              ability cast. This empowers your <SpellLink spell={SPELLS.GARROTE} /> as early as
              possible.
            </div>
          </Expandable>
          <Expandable
            header={
              <SectionHeader>
                <strong>The second buff</strong>
              </SectionHeader>
            }
            element="section"
          >
            <div>
              The second buff from <SpellLink spell={TALENTS.SEPSIS_TALENT} /> should always be held
              onto as long as possible before being consumed by{' '}
              <SpellLink spell={TALENTS.IMPROVED_GARROTE_TALENT} />. This ensures the maximum uptime
              of the effect. If the empowered <SpellLink spell={SPELLS.GARROTE} /> from the previous{' '}
              <SpellLink spell={TALENTS.SEPSIS_TALENT} /> buff is in pandemic range with less than
              5.4 seconds remaining, you may refresh at that point as well.
            </div>
          </Expandable>

          {this.usingLightweightShiv && (
            <Expandable
              header={
                <SectionHeader>
                  <strong>Shiv Interaction</strong>
                </SectionHeader>
              }
              element="section"
            >
              <div>
                When using the <SpellLink spell={TALENTS.LIGHTWEIGHT_SHIV_TALENT} /> talent you
                should hold a <SpellLink spell={SPELLS.SHIV} /> charge to empower the debuff from{' '}
                <SpellLink spell={TALENTS.SEPSIS_TALENT} />. Aim to get the full{' '}
                {formatSeconds(SHIV_DURATION)} seconds of the{' '}
                <SpellLink spell={TALENTS.IMPROVED_SHIV_TALENT} /> inside of the{' '}
                {formatSeconds(SEPSIS_DEBUFF_DURATION)} second{' '}
                <SpellLink spell={TALENTS.SEPSIS_TALENT} /> debuff window. With a 1s GCD this means
                you should be looking to cast <SpellLink spell={SPELLS.SHIV} /> 1-2 globals after
                applying <SpellLink spell={TALENTS.SEPSIS_TALENT} />.
              </div>
            </Expandable>
          )}
        </ExplanationSection>
      </>
    );
  }

  explainPerformance(sepsisCast: SepsisCast): SpellUse {
    const buffOneChecklistItem = createChecklistItem(
      'initial-sepsis-buff',
      sepsisCast,
      this.buffUsagePerformance(sepsisCast, PRIMARY_BUFF_KEY),
    );
    const buffTwoChecklistItem = createChecklistItem(
      'secondary-sepsis-buff',
      sepsisCast,
      this.buffUsagePerformance(sepsisCast, SECONDARY_BUFF_KEY),
    );

    const shivChecklistItem = this.usingLightweightShiv
      ? createChecklistItem('shiv', sepsisCast, this.shivPerformance(sepsisCast))
      : undefined;

    const checklistItems = [buffOneChecklistItem, buffTwoChecklistItem, shivChecklistItem].filter(
      isDefined,
    );

    const overallPerformance = combineQualitativePerformances(
      checklistItems.map((item) => item.performance),
    );
    return {
      event: sepsisCast.event,
      checklistItems: checklistItems,
      performance: overallPerformance,
      performanceExplanation:
        overallPerformance !== QualitativePerformance.Fail
          ? `${overallPerformance} Usage`
          : `Bad Usage`,
    };
  }

  private buffUsagePerformance(
    cast: SepsisCast,
    buffId: keyof SepsisCast['buffs'],
  ): UsageInfo | undefined {
    const summaryForBuff = {
      [PRIMARY_BUFF_KEY]: (
        <>
          Use <SpellLink spell={SPELLS.GARROTE} /> to consume the Sepsis buff early.
        </>
      ) as React.ReactNode,
      [SECONDARY_BUFF_KEY]: (
        <>
          Use <SpellLink spell={SPELLS.GARROTE} /> to consume the Sepsis buff late.
        </>
      ) as React.ReactNode,
    };
    const usageDetails = {
      [PRIMARY_BUFF_KEY]: (
        <>
          You did not consume the first <SpellLink spell={SPELLS.SEPSIS_BUFF} /> buff.
        </>
      ) as React.ReactNode,
      [SECONDARY_BUFF_KEY]: (
        <>
          You did not consume the second <SpellLink spell={SPELLS.SEPSIS_BUFF} /> buff.
        </>
      ) as React.ReactNode,
    };
    let buffPerformance = QualitativePerformance.Fail;
    const buff = cast.buffs[buffId];
    if (buff && buff.consumeCast) {
      const firstOrSecond = buffId === PRIMARY_BUFF_KEY ? 'first' : 'second';
      if (buff.consumeCast.ability.guid !== SPELLS.GARROTE.id) {
        usageDetails[buffId] = (
          <>
            You incorrectly cast <SpellLink spell={buff.consumeCast.ability.guid} /> to consume the{' '}
            {firstOrSecond} <SpellLink spell={SPELLS.SEPSIS_BUFF} /> buff. You should always be
            using the buff to cast or extend an empowered <SpellLink spell={SPELLS.GARROTE} />.
          </>
        );
      } else {
        buffPerformance = QualitativePerformance.Perfect;
        usageDetails[buffId] = (
          <>
            You cast <SpellLink spell={SPELLS.GARROTE} /> to consume the {firstOrSecond}{' '}
            <SpellLink spell={SPELLS.SEPSIS_BUFF} /> buff with{' '}
            {formatSeconds(buff.timeRemainingOnRemoval, 2)} seconds remaining on it's duration.
          </>
        );
        // If the applied garrote will outlast (ie its not "full") the fight then disregard any "early" or "late" consume rules
        const expectedGarroteEnd = buff.consumeCast.timestamp + GARROTE_BASE_DURATION;
        const willBeFullGarrote = expectedGarroteEnd < this.owner.fight.end_time;

        // Primary buff specific checks
        if (buffId === PRIMARY_BUFF_KEY) {
          const isLateConsume = buff.timeRemainingOnRemoval < 5 * 1000;
          const isOpenerCast = isInOpener(buff.consumeCast, this.owner.fight);
          // still good, just not "perfect"
          if (isLateConsume && !isOpenerCast && willBeFullGarrote) {
            buffPerformance = QualitativePerformance.Good;
            usageDetails[buffId] = (
              <>
                {usageDetails[buffId]} You should consider using the first buff earlier to get an
                empowered <SpellLink spell={SPELLS.GARROTE} /> ticking as soon as possible.
                Specially outside of the opener as you likely will not have an{' '}
                <SpellLink spell={TALENTS.IMPROVED_GARROTE_TALENT} /> running when you cast{' '}
                <SpellLink spell={TALENTS.SEPSIS_TALENT} />
              </>
            );
          }
        }
        // Secondary buff specific checks
        if (buffId === SECONDARY_BUFF_KEY) {
          const isEarlyConsume = buff.timeRemainingOnRemoval > 3 * 1000;
          // likewise, still good, just not "perfect"
          if (isEarlyConsume && willBeFullGarrote) {
            buffPerformance = QualitativePerformance.Good;
            usageDetails[buffId] = (
              <>
                {usageDetails[buffId]} Consider using the second buff as late as possible to
                maximize uptime on <SpellLink spell={TALENTS.IMPROVED_GARROTE_TALENT} />
              </>
            );
          }
        }
      }
    }
    // Edge case: if fight ends before 2nd buff is gained or before buff is used.
    if (cast.event.timestamp + SEPSIS_BUFF_DURATION > this.owner.fight.end_time) {
      buffPerformance = QualitativePerformance.Perfect;
      if (!buff) {
        usageDetails[buffId] = (
          <>
            Fight ended before you gained the <SpellLink spell={SPELLS.SEPSIS_BUFF} /> buff.
          </>
        );
      } else if (!buff.consumeCast) {
        usageDetails[buffId] = (
          <>
            {usageDetails[buffId]} However, its seems the fight ended shortly after the buff was
            gained.
          </>
        );
      }
    }

    return {
      performance: buffPerformance,
      summary: <div>{summaryForBuff[buffId]}</div>,
      details: <div>{usageDetails[buffId]}</div>,
    };
  }

  private shivPerformance(cast: SepsisCast): UsageInfo | undefined {
    const shivSummary: React.ReactNode = (
      <>
        Cast <SpellLink spell={SPELLS.SHIV} /> shortly after applying{' '}
        <SpellLink spell={TALENTS.SEPSIS_TALENT} />.
      </>
    );
    let castDetails: React.ReactNode = (
      <>
        You did not cast <SpellLink spell={SPELLS.SHIV.id} /> during{' '}
        <SpellLink spell={TALENTS.SEPSIS_TALENT.id} />.
      </>
    );
    let performance = QualitativePerformance.Fail;

    // Note: cast.debuff & cast.shivData will be defined if shivCasts > 0
    // check is redundant but here for typing purposes
    const shivCasts = cast.shivData?.events.length || 0;
    if (shivCasts > 0 && cast.debuff && cast.shivData) {
      const { events, overlapMs, overlapPercent } = cast.shivData;
      if (overlapPercent >= 0.9) {
        performance = QualitativePerformance.Perfect;
      } else if (overlapPercent >= 0.8) {
        performance = QualitativePerformance.Good;
      } else if (overlapPercent >= 0.65) {
        performance = QualitativePerformance.Ok;
      }
      const sepsisRemainingonFightEnd =
        cast.debuff.start + SEPSIS_DEBUFF_DURATION - this.owner.fight.end_time;
      castDetails = (
        <>
          You cast {shivCasts} <SpellLink spell={SPELLS.SHIV} />
          (s) with {formatSeconds(overlapMs, 2)}s ({formatPercentage(overlapPercent, 1)}
          %) of it's debuff covering your <SpellLink spell={TALENTS.SEPSIS_TALENT} /> debuff.{' '}
        </>
      );
      if (overlapPercent < 0.85) {
        let additionalDetails: React.ReactNode = <></>;
        additionalDetails = (
          <>
            Aim to have all {formatSeconds(SHIV_DURATION)} seconds of the Shiv debuff line up with
            the {formatSeconds(SEPSIS_DEBUFF_DURATION)}s Sepsis DoT.
          </>
        );
        // Edge case for last sepsis cast
        if (sepsisRemainingonFightEnd > 0) {
          // Check to see if last Shiv cast comes before the 3rd GCD after sepsis.
          // if the shiv was cast within 1-2GCDs assume it would've been `Perfect`
          const castTimeDiff = Math.abs(events[shivCasts - 1].start - cast.debuff.start);
          const withinGracePeriod = castTimeDiff < 3 * BASE_ROGUE_GCD + CAST_BUFFER_MS;

          performance = withinGracePeriod
            ? QualitativePerformance.Perfect
            : QualitativePerformance.Good;
          additionalDetails = (
            <>
              The fight ended after{' '}
              {formatSeconds(SEPSIS_DEBUFF_DURATION - sepsisRemainingonFightEnd)} seconds of{' '}
              <SpellLink spell={TALENTS.SEPSIS_TALENT} />
              {withinGracePeriod ? '.' : ', but Shiv could have still been used earlier.'}{' '}
            </>
          );
          castDetails = (
            <>
              {castDetails} {additionalDetails}
            </>
          );
        }
      }
    }
    return {
      performance: performance,
      summary: shivSummary,
      details: <div>{castDetails}</div>,
    };
  }

  /** Returns the amount of time that the Shiv debuff overlaps with the Sepsis debuff,
   * along with the amount of Shiv `TrackedBuffEvent`s found within the Sepsis window.
   * There will usually be 1 event for each debuff, but trying to cover the case where you chain Shivs to cover the full debuff.
   */
  private getShivOverlapForSepsisCast(cast: Omit<SepsisCast, 'shivData'>): SepsisCast['shivData'] {
    const events: TrackedBuffEvent[] = [];
    let overlapMs = 0;
    let expectedOverlap = SHIV_DURATION;
    let overlapPercent = 0;

    if (cast.debuff) {
      const applyEvent = cast.debuff.applyEvent;
      const enemy = this.enemies.getEntity(cast.event);
      const shivs = enemy?.getBuffHistory(SPELLS.SHIV_DEBUFF.id, applyEvent.sourceID);
      let startTimePtr = applyEvent.timestamp;
      const sepsisEnd = cast.debuff?.end || applyEvent.timestamp + SEPSIS_DEBUFF_DURATION;
      const isLastSepsis = sepsisEnd >= this.owner.fight.end_time;
      shivs?.forEach((shivDebuff) => {
        startTimePtr = Math.max(startTimePtr, shivDebuff.timestamp);
        if (startTimePtr > sepsisEnd) {
          return;
        }
        if (shivDebuff.end && shivDebuff.end > startTimePtr) {
          overlapMs += Math.min(shivDebuff.end, sepsisEnd) - startTimePtr;
          events.push(shivDebuff);
          startTimePtr = shivDebuff.end;
        }
      });
      // check if sepsis debuff is set to expire after the fight ends so we don't expect all 8s of shiv to be used.
      if (isLastSepsis) {
        const remainingDurationAtFightEnd =
          cast.debuff.start + SEPSIS_DEBUFF_DURATION - this.owner.fight.end_time;
        expectedOverlap = SEPSIS_DEBUFF_DURATION - remainingDurationAtFightEnd;
      }
    }
    overlapMs = Math.min(overlapMs + BUFF_DROP_BUFFER, expectedOverlap);
    overlapPercent = Math.min(1, overlapMs / expectedOverlap);
    return { events, overlapMs, overlapPercent };
  }

  private onEnd() {
    this.overallSepsisCasts.forEach((sepsisCast) => {
      const shivData = this.getShivOverlapForSepsisCast(sepsisCast);
      this.recordCooldown({
        ...sepsisCast,
        shivData,
      });
    });
  }
  private onSepsisCast(cast: CastEvent) {
    const sepsisBuffs: SepsisCast['buffs'] = {
      [PRIMARY_BUFF_KEY]: undefined,
      [SECONDARY_BUFF_KEY]: undefined,
    };
    let sepsisDebuff: SepsisDebuff | undefined;

    const initialBuffApplication = getRelatedBuffApplicationFromHardcast(
      cast,
      'InstantAuraApplication',
    );
    const delayedBuffApplication = getRelatedBuffApplicationFromHardcast(
      cast,
      'DelayedAuraApplication',
    );
    const debuffApplication = getDebuffApplicationFromHardcast(cast);

    [initialBuffApplication, delayedBuffApplication, debuffApplication]
      .filter(isDefined)
      .forEach((application) => {
        const isBuff = application.type === EventType.ApplyBuff;
        const start = application.timestamp;
        const expectedDuration = isBuff ? SEPSIS_BUFF_DURATION : SEPSIS_DEBUFF_DURATION;
        const removal = getAuraLifetimeEvent(application);
        const end = removal ? removal.timestamp : start + expectedDuration; // default to full duration
        const activeDuration = end - start;
        const timeRemainingOnRemoval = expectedDuration - activeDuration;
        if (isBuff) {
          const consumeCast = getSepsisConsumptionCastForBuffEvent(application);
          const buffId =
            Math.abs(cast.timestamp - start) <= BUFF_DROP_BUFFER
              ? PRIMARY_BUFF_KEY
              : SECONDARY_BUFF_KEY;
          sepsisBuffs[buffId] = {
            applyEvent: application,
            timeRemainingOnRemoval,
            consumeCast,
            start,
            end,
          };
        } else {
          // application isDebuff
          sepsisDebuff = {
            applyEvent: application,
            timeRemainingOnRemoval,
            start,
            end,
          };
        }
      });
    this.overallSepsisCasts.push({
      event: cast,
      buffs: sepsisBuffs,
      debuff: sepsisDebuff,
    });
  }
}
