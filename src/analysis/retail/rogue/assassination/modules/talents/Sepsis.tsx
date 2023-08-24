import MajorCooldown, {
  createChecklistItem,
  SpellCast,
} from 'parser/core/MajorCooldowns/MajorCooldown';
import { SpellUse, UsageInfo } from 'parser/core/SpellUsage/core';
import React, { ReactNode } from 'react';
import { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import SPELLS from 'common/SPELLS/rogue';
import TALENTS from 'common/TALENTS/rogue';
import Events, { CastEvent } from 'parser/core/Events';
import { Trans } from '@lingui/macro';
import SpellLink from 'interface/SpellLink';
import Enemies from 'parser/shared/modules/Enemies';
import { isDefined } from 'common/typeGuards';
import { combineQualitativePerformances } from 'common/combineQualitativePerformances';
import { QualitativePerformance } from 'parser/ui/QualitativePerformance';
import {
  getRelatedBuffApplicationFromHardcast,
  getDebuffApplicationFromHardcast,
  SEPSIS_DEBUFF_DURATION,
  getTimeRemainingAtRemoval,
  getSepsisConsumptionCastForBuffEvent,
} from '../../normalizers/SepsisLinkNormalizer';
import { ExplanationSection } from 'analysis/retail/demonhunter/shared/guide/CommonComponents';
import { Expandable } from 'interface';
import { SectionHeader } from 'interface/guide';
import { BUFF_DROP_BUFFER } from 'parser/core/DotSnapshots';
import { formatPercentage } from 'common/format';

const SHIV_DURATION = 8 * 1000;
const formatSeconds = (ms: number, precision: number = 0): string => {
  if (ms % 1000 === 0) {
    return (ms / 1000).toFixed(0);
  }
  return (ms / 1000).toFixed(precision);
};

interface SepsisCast extends SpellCast {
  buffOneAbility: CastEvent | undefined;
  buffOneTimeRemaining: number;

  buffTwoAbility: CastEvent | undefined;
  buffTwoTimeRemaining: number;
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
            <Trans id="guide.rogue.assassination.sections.cooldowns.sepsis.explanation">
              <strong>
                <SpellLink spell={TALENTS.SEPSIS_TALENT} />
              </strong>{' '}
              is a strong cooldown that allows for much higher uptime on
              <SpellLink spell={TALENTS.IMPROVED_GARROTE_TALENT} /> in fights.
            </Trans>
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
      this.buffOnePerformance(sepsisCast),
    );
    const buffTwoChecklistItem = createChecklistItem(
      'secondary-sepsis-buff',
      sepsisCast,
      this.buffTwoPerformance(sepsisCast),
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

  private buffOnePerformance(cast: SepsisCast): UsageInfo | undefined {
    const buffOneSummary = (
      <div>
        Consume the first <SpellLink spell={TALENTS.SEPSIS_TALENT} /> buff with{' '}
        <SpellLink spell={SPELLS.GARROTE} /> as early as possible.
      </div>
    );
    if (!cast.buffOneAbility) {
      return {
        performance: QualitativePerformance.Fail,
        summary: buffOneSummary,
        details: (
          <div>
            You did not consume the first <SpellLink spell={TALENTS.SEPSIS_TALENT} /> buff.
          </div>
        ),
      };
    } else if (cast.buffOneAbility) {
      if (cast.buffOneAbility.ability.guid !== SPELLS.GARROTE.id) {
        return {
          performance: QualitativePerformance.Fail,
          summary: buffOneSummary,
          details: (
            <div>
              You incorrectly cast <SpellLink spell={cast.buffOneAbility.ability.guid} /> to consume
              the first <SpellLink spell={TALENTS.SEPSIS_TALENT} /> buff. Remember, you should
              always be using the Sepsis buff to apply an empowered{' '}
              <SpellLink spell={SPELLS.GARROTE} />.
            </div>
          ),
        };
      }
      if (cast.buffOneAbility.ability.guid === SPELLS.GARROTE.id) {
        if (cast.buffOneTimeRemaining < 5 * 1000) {
          return {
            performance: QualitativePerformance.Ok,
            summary: buffOneSummary,
            details: (
              <div>
                You cast <SpellLink spell={cast.buffOneAbility.ability.guid} /> to consume the first
                buff, with {formatSeconds(cast.buffOneTimeRemaining, 2)} seconds left on the{' '}
                <SpellLink spell={TALENTS.SEPSIS_TALENT} /> buff. This is okay, but you should
                consider using the first buff earlier.
              </div>
            ),
          };
        }
        if (cast.buffOneTimeRemaining >= 5 * 1000) {
          return {
            performance: QualitativePerformance.Perfect,
            summary: buffOneSummary,
            details: (
              <div>
                You cast <SpellLink spell={cast.buffOneAbility.ability.guid} /> to consume the first
                buff, with {formatSeconds(cast.buffOneTimeRemaining, 2)} seconds left.
              </div>
            ),
          };
        }
      }
    }
  }

  private buffTwoPerformance(cast: SepsisCast): UsageInfo | undefined {
    const buffTwoSummary: React.ReactNode = (
      <div>
        Consume the second <SpellLink spell={TALENTS.SEPSIS_TALENT} /> buff with{' '}
        <SpellLink spell={SPELLS.GARROTE} /> as late as possible while maintaining full uptime on{' '}
        <SpellLink spell={TALENTS.IMPROVED_GARROTE_TALENT} />.
      </div>
    );
    if (!cast.buffTwoAbility) {
      return {
        performance: QualitativePerformance.Fail,
        summary: buffTwoSummary,
        details: (
          <div>
            You did not consume the second <SpellLink spell={TALENTS.SEPSIS_TALENT} /> buff.
          </div>
        ),
      };
    }
    if (cast.buffTwoAbility?.ability.guid === SPELLS.GARROTE.id) {
      return {
        performance: QualitativePerformance.Perfect,
        summary: buffTwoSummary,
        details: (
          <div>
            You cast <SpellLink spell={SPELLS.GARROTE} /> to consume the second buff, with{' '}
            {formatSeconds(cast.buffTwoTimeRemaining, 2)} seconds left.
          </div>
        ),
      };
    } else {
      return {
        performance: QualitativePerformance.Fail,
        summary: buffTwoSummary,
        details: (
          <div>
            You incorrectly cast <SpellLink spell={cast.buffTwoAbility?.ability.guid} /> to consume
            the second <SpellLink spell={SPELLS.SEPSIS_BUFF} /> buff. You should always be using the
            buff to cast or extend an empowered <SpellLink spell={SPELLS.GARROTE} />.
          </div>
        ),
      };
    }
  }

  private shivPerformance(cast: SepsisCast): UsageInfo | undefined {
    const shivSummary: React.ReactNode = (
      <div>
        Cast <SpellLink spell={SPELLS.SHIV} /> during <SpellLink spell={TALENTS.SEPSIS_TALENT} /> so
        that you get a the full {formatSeconds(SHIV_DURATION)} seconds of{' '}
        <SpellLink spell={SPELLS.SHIV} /> overlapping with the{' '}
        <SpellLink spell={TALENTS.SEPSIS_TALENT} /> debuff.
      </div>
    );
    let castDetails: React.ReactNode = (
      <div>
        You did not cast <SpellLink spell={SPELLS.SHIV.id} /> during{' '}
        <SpellLink spell={TALENTS.SEPSIS_TALENT.id} />.
      </div>
    );
    let performance = QualitativePerformance.Fail;

    const overLapPercent = Math.min(1, (cast.timeSpentInShiv + BUFF_DROP_BUFFER) / SHIV_DURATION);
    if (cast.shivCount > 0) {
      if (overLapPercent >= 0.9) {
        performance = QualitativePerformance.Perfect;
      } else if (overLapPercent >= 0.85) {
        performance = QualitativePerformance.Good;
      } else if (overLapPercent >= 0.75) {
        performance = QualitativePerformance.Ok;
      }
      castDetails = (
        <div>
          You cast {cast.shivCount} <SpellLink spell={SPELLS.SHIV} />
          (s) with {formatSeconds(cast.timeSpentInShiv, 2)}s ({formatPercentage(overLapPercent, 1)}
          %) of it's debuff covering your <SpellLink spell={TALENTS.SEPSIS_TALENT} /> debuff.{' '}
          {overLapPercent < 0.85 && (
            <>
              Ideally all {formatSeconds(SHIV_DURATION)} seconds of Shiv should be inside of the{' '}
              {formatSeconds(SEPSIS_DEBUFF_DURATION)}s Sepsis debuff window.
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
  private onSepsisCast(event: CastEvent) {
    let buffOneAbility: CastEvent | undefined;
    let buffOneTimeRemaining = 0;

    let buffTwoAbility: CastEvent | undefined;
    let buffTwoTimeRemaining = 0;

    const initialBuffApplication = getRelatedBuffApplicationFromHardcast(
      event,
      'InstantAuraApplication',
    );
    if (initialBuffApplication) {
      buffOneAbility = getSepsisConsumptionCastForBuffEvent(initialBuffApplication);
      if (buffOneAbility) {
        buffOneTimeRemaining = getTimeRemainingAtRemoval(initialBuffApplication);
      }
    }

    const delayedBuffApplication = getRelatedBuffApplicationFromHardcast(
      event,
      'DelayedAuraApplication',
    );
    if (delayedBuffApplication) {
      buffTwoAbility = getSepsisConsumptionCastForBuffEvent(delayedBuffApplication);
      if (buffTwoAbility) {
        buffTwoTimeRemaining = getTimeRemainingAtRemoval(delayedBuffApplication);
      }
    }

    this.overallSepsisCasts.push({
      event,
      buffOneAbility,
      buffOneTimeRemaining,
      buffTwoAbility,
      buffTwoTimeRemaining,
      shivCount: 0,
      timeSpentInShiv: 0,
    });
  }
}
