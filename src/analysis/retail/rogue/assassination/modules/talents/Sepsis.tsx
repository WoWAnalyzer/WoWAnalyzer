import MajorCooldown, {
  createChecklistItem,
  SpellCast,
} from 'parser/core/MajorCooldowns/MajorCooldown';
import { SpellUse, UsageInfo } from 'parser/core/SpellUsage/core';
import React, { ReactNode } from 'react';
import { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import SPELLS from 'common/SPELLS/rogue';
import TALENTS from 'common/TALENTS/rogue';
import Events, {
  ApplyBuffEvent,
  ApplyDebuffEvent,
  CastEvent,
  EventType,
  RemoveBuffEvent,
  RemoveDebuffEvent,
} from 'parser/core/Events';
import SpellLink from 'interface/SpellLink';
import Enemies from 'parser/shared/modules/Enemies';
import { isDefined } from 'common/typeGuards';
import { combineQualitativePerformances } from 'common/combineQualitativePerformances';
import { QualitativePerformance } from 'parser/ui/QualitativePerformance';
import {
  getRelatedBuffApplicationFromHardcast,
  getDebuffApplicationFromHardcast,
  SEPSIS_DEBUFF_DURATION,
  getSepsisConsumptionCastForBuffEvent,
  SEPSIS_BUFF_DURATION,
  getAuraLifetimeEvent,
} from '../../normalizers/SepsisLinkNormalizer';
import { ExplanationSection } from 'analysis/retail/demonhunter/shared/guide/CommonComponents';
import { Expandable } from 'interface';
import { SectionHeader } from 'interface/guide';
import { BUFF_DROP_BUFFER } from 'parser/core/DotSnapshots';
import { formatPercentage } from 'common/format';
import { GARROTE_BASE_DURATION, isInOpener } from '../../constants';

const SHIV_DURATION = 8 * 1000;
const PRIMARY_BUFF_KEY = 1;
const SECONDARY_BUFF_KEY = 2;

const formatSeconds = (ms: number, precision: number = 0): string => {
  if (ms % 1000 === 0) {
    return (ms / 1000).toFixed(0);
  }
  return (ms / 1000).toFixed(precision);
};

interface SepsisDebuff {
  application: ApplyDebuffEvent;
  removal?: RemoveDebuffEvent;
  timeRemainingOnRemoval: number;
  start: number;
  end?: number;
}
interface SepsisBuff {
  application: ApplyBuffEvent;
  removal?: RemoveBuffEvent;
  timeRemainingOnRemoval: number;
  start: number;
  end?: number;
  consumeCast: CastEvent | undefined;
}
interface SepsisCast extends SpellCast {
  buffs: {
    [PRIMARY_BUFF_KEY]?: SepsisBuff;
    [SECONDARY_BUFF_KEY]?: SepsisBuff;
  };
  debuff?: SepsisDebuff;
  shivCount: number;
  timeSpentInShiv: number;
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

  description(): ReactNode {
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
    // edge case: if fight ends before buff is consumed or before 2nd buff is gained
    if (cast.event.timestamp + SEPSIS_BUFF_DURATION > this.owner.fight.end_time) {
      buffPerformance = QualitativePerformance.Perfect;
      if (!buff) {
        // could also return undefined here to not show buff performance since it was never gained
        usageDetails[buffId] = (
          <>
            Fight ended before you gained the <SpellLink spell={SPELLS.SEPSIS_BUFF} /> buff.
          </>
        );
      } else if (!buff.consumeCast) {
        // TODO:
        // Ideally this check should only pass if combatant already has an empowered garrote active.
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
      <div>
        Cast <SpellLink spell={SPELLS.SHIV} /> shortly after applying{' '}
        <SpellLink spell={TALENTS.SEPSIS_TALENT} />.
      </div>
    );
    let castDetails: React.ReactNode = (
      <div>
        You did not cast <SpellLink spell={SPELLS.SHIV.id} /> during{' '}
        <SpellLink spell={TALENTS.SEPSIS_TALENT.id} />.
      </div>
    );
    let performance = QualitativePerformance.Fail;

    let overlapPercent = Math.min(1, (cast.timeSpentInShiv + BUFF_DROP_BUFFER) / SHIV_DURATION);

    // check if sepsis debuff is set to expire after the fight ends so we don't expect all 8s of shiv to be used.
    const sepsisDurationAtFightEnd =
      cast.event.timestamp + SEPSIS_DEBUFF_DURATION - this.owner.fight.end_time;
    let effectiveSepsisDuration = SEPSIS_DEBUFF_DURATION;
    if (sepsisDurationAtFightEnd > 0) {
      effectiveSepsisDuration = SEPSIS_DEBUFF_DURATION - sepsisDurationAtFightEnd;
      overlapPercent = Math.min(
        1,
        (cast.timeSpentInShiv + BUFF_DROP_BUFFER) / effectiveSepsisDuration,
      );
    }

    if (cast.shivCount > 0) {
      if (overlapPercent >= 0.9) {
        performance = QualitativePerformance.Perfect;
      } else if (overlapPercent >= 0.85) {
        performance = QualitativePerformance.Good;
      } else if (overlapPercent >= 0.75) {
        performance = QualitativePerformance.Ok;
      }
      castDetails = (
        <div>
          You cast {cast.shivCount} <SpellLink spell={SPELLS.SHIV} />
          (s) with {formatSeconds(cast.timeSpentInShiv, 2)}s ({formatPercentage(overlapPercent, 1)}
          %) of it's debuff covering your <SpellLink spell={TALENTS.SEPSIS_TALENT} /> debuff.{' '}
          {overlapPercent < 0.85 && effectiveSepsisDuration > SHIV_DURATION && (
            <>
              Ideally all {formatSeconds(SHIV_DURATION)} seconds of Shiv should be inside of the{' '}
              {formatSeconds(SEPSIS_DEBUFF_DURATION)}s Sepsis debuff window.
            </>
          )}
          {sepsisDurationAtFightEnd > 0 && (
            <>
              Your <SpellLink spell={TALENTS.SEPSIS_TALENT} /> debuff was up for{' '}
              {formatSeconds(effectiveSepsisDuration)}s before the fight ended.
            </>
          )}
        </div>
      );
    }
    return {
      performance: performance,
      summary: shivSummary,
      details: castDetails,
    };
  }

  /** Returns the amount of time that the Shiv debuff overlaps with the Sepsis debuff, along with the amount of Shiv casts within the sepsis debuff.
   * Count will usually be 1, but trying to cover the case where you chain Shivs to cover the full debuff.
   */
  private getShivOverlapForSepsisCast(sepsisCast: CastEvent) {
    const sepsisDebuffApply = getDebuffApplicationFromHardcast(sepsisCast);
    let overlapMs = 0;
    let castCount = 0;
    if (sepsisDebuffApply) {
      const enemy = this.enemies.getEntity(sepsisCast);
      const shivs = enemy?.getBuffHistory(SPELLS.SHIV_DEBUFF.id, sepsisDebuffApply.sourceID);
      let startTimePtr = sepsisDebuffApply.timestamp;
      const sepsisEnd = sepsisDebuffApply.timestamp + SEPSIS_DEBUFF_DURATION;
      shivs?.forEach((shiv) => {
        startTimePtr = Math.max(startTimePtr, shiv.timestamp);
        if (startTimePtr > sepsisEnd) {
          return;
        }
        if (shiv.end && shiv.end > startTimePtr) {
          overlapMs += Math.min(shiv.end, sepsisEnd) - startTimePtr;
          startTimePtr = shiv.end;
          castCount += 1;
        }
      });
    }
    overlapMs = Math.min(overlapMs + BUFF_DROP_BUFFER, SHIV_DURATION);
    return { overlapMs, castCount };
  }

  private onEnd() {
    // Without a normalizer for Shiv, its hard to get Shiv casts/debuff data while the fight is "ongoing". So we do it at the end.
    this.overallSepsisCasts.forEach((sepsisCast) => {
      const { overlapMs, castCount } = this.getShivOverlapForSepsisCast(sepsisCast.event);
      this.recordCooldown({ ...sepsisCast, timeSpentInShiv: overlapMs, shivCount: castCount });
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

    [initialBuffApplication, delayedBuffApplication, debuffApplication].forEach((application) => {
      if (application) {
        if (application.type === EventType.ApplyBuff) {
          const start = application.timestamp;
          const removal = getAuraLifetimeEvent(application);
          const end = removal ? removal.timestamp : start + SEPSIS_BUFF_DURATION;
          const consumeCast = getSepsisConsumptionCastForBuffEvent(application);
          const buffId =
            Math.abs(cast.timestamp - start) <= BUFF_DROP_BUFFER
              ? PRIMARY_BUFF_KEY
              : SECONDARY_BUFF_KEY;
          sepsisBuffs[buffId] = {
            application,
            removal,
            timeRemainingOnRemoval: SEPSIS_BUFF_DURATION - Math.abs(end - start),
            consumeCast,
            start,
            end,
          };
        } else if (application.type === EventType.ApplyDebuff) {
          const start = application.timestamp;
          const removal = getAuraLifetimeEvent(application);
          const end = removal ? removal.timestamp : start + SEPSIS_DEBUFF_DURATION;
          sepsisDebuff = {
            application,
            removal,
            timeRemainingOnRemoval: SEPSIS_DEBUFF_DURATION - Math.abs(end - start),
            start,
            end,
          };
        }
      }
    });
    this.overallSepsisCasts.push({
      event: cast,
      buffs: sepsisBuffs,
      debuff: sepsisDebuff,
      shivCount: 0,
      timeSpentInShiv: 0,
    });
  }
}
