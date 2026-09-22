import type { JSX } from 'react';
import { useMemo } from 'react';
import SPELLS from 'common/SPELLS';
import { SpellLink } from 'interface';
import GuideSection from 'interface/guide/components/GuideSection';
import CastDetail, { type PerCastData } from 'interface/guide/components/CastDetail';
import {
  SpellSequence,
  type CastSequenceEntry,
  type CastInSequence,
} from 'interface/guide/components/CastSequence';
import HavocAnalyzer, { HavocWindowData } from '../analyzers/HavocAnalyzer';
import { QualitativePerformance } from 'parser/ui/QualitativePerformance';
import { TALENTS_WARLOCK } from 'common/TALENTS';
import { CastEvent } from 'parser/core/Events';

interface HavocGuideProps {
  havocAnalyzer: HavocAnalyzer;
  formatTimestamp: (ts: number) => string;
}

export function HavocGuide({ havocAnalyzer, formatTimestamp }: HavocGuideProps): JSX.Element {
  const havoc = <SpellLink spell={SPELLS.HAVOC} />;
  const hasFiendishCruelty = havocAnalyzer.selectedCombatant.hasTalent(
    TALENTS_WARLOCK.FIENDISH_CRUELTY_TALENT,
  );

  const explanation = (
    <>
      <p>
        <b>{havoc}</b> duplicates your single target spells onto a second target. To maximize its
        effectiveness, you should cast as many <SpellLink spell={SPELLS.CHAOS_BOLT} /> or{' '}
        <SpellLink spell={TALENTS_WARLOCK.SHADOWBURN_TALENT} /> as possible during the Havoc window.
      </p>
      <p>
        Ideally, you should enter Havoc with Soul Shards already pooled so you can immediately begin
        casting <SpellLink spell={SPELLS.CHAOS_BOLT} />.
      </p>
      <p>
        Once the target drops below 20% health,{' '}
        <SpellLink spell={TALENTS_WARLOCK.SHADOWBURN_TALENT} />
        becomes the priority Havoc spender instead of <SpellLink spell={SPELLS.CHAOS_BOLT} />.
        You'll want to generate as many shards as possible to then just spam cast Shadowburn.
      </p>
      {hasFiendishCruelty && (
        <p>
          With <SpellLink spell={TALENTS_WARLOCK.FIENDISH_CRUELTY_TALENT} /> talented, critical
          strikes from <SpellLink spell={SPELLS.CHAOS_BOLT} />,{' '}
          <SpellLink spell={SPELLS.CONFLAGRATE} />, or <SpellLink spell={SPELLS.INCINERATE} /> have
          a chance to make your next <SpellLink spell={TALENTS_WARLOCK.SHADOWBURN_TALENT} /> free
          and usable on any target regardless of health. Use these procs during Havoc as soon as
          they're available.
        </p>
      )}
    </>
  );

  const havocSequenceEvents: CastSequenceEntry<HavocWindowData>[] = useMemo(
    () =>
      havocAnalyzer.havocData.map((window) => {
        const windowStart = window.start;
        const windowEnd = window.end ?? window.start + havocAnalyzer.havocDuration;

        const casts: CastInSequence[] = window.casts.map((event) => ({
          timestamp: event.timestamp,
          spellId: event.ability.guid,
          spellName: event.ability.name,
          icon: event.ability.abilityIcon.replace('.jpg', ''),
        }));

        return {
          data: window,
          start: windowStart,
          end: windowEnd,
          casts,
        };
      }),
    [havocAnalyzer.havocData, havocAnalyzer.havocDuration],
  );

  function rateHavocWindow(spenders: number, maxExpectedSpenders: number): QualitativePerformance {
    if (spenders >= maxExpectedSpenders) return QualitativePerformance.Perfect;
    if (spenders >= Math.round(maxExpectedSpenders * 0.75)) return QualitativePerformance.Good;
    if (spenders >= Math.round(maxExpectedSpenders * 0.625)) return QualitativePerformance.Ok;
    return QualitativePerformance.Fail;
  }

  function getHavocFeedback(
    shardsSpent: number,
    shadowburns: number,
    shadowburnsInExecute: number,
    shardsOnCast: number,
    hasFiendishCruelty: boolean,
    maxExpectedSpenders: number,
    executeBurnBars: { perfect: number; good: number; ok: number } | null,
    startWasFabricated: boolean,
    casts: CastEvent[],
    duration: number,
    targetDied?: boolean,
  ): JSX.Element {
    const feedback: string[] = [];
    const isImproved = duration === 20000;

    if (executeBurnBars) {
      if (shadowburns >= executeBurnBars.perfect)
        feedback.push(
          'Excellent Havoc usage. You maximized your Shadowburn casts during the execute window.',
        );
      else if (shadowburns >= executeBurnBars.good)
        feedback.push('Good execute window. A few more Shadowburns would make this perfect.');
      else if (shadowburns >= executeBurnBars.ok)
        feedback.push(
          'Decent execute window, but you could likely fit more Shadowburns with better Soul Shard availability.',
        );
      else
        feedback.push(
          'Low Shadowburn count for a pure execute window. Try entering execute with more Soul Shards banked.',
        );
    } else if (isImproved) {
      if (shardsSpent >= 14)
        feedback.push(
          'Excellent Havoc usage. You maximized your shard spending during the window.',
        );
      else if (shardsSpent >= 11)
        feedback.push('Good Havoc window. A bit more shard spending would make this perfect.');
      else if (shardsSpent >= 9)
        feedback.push(
          'Decent Havoc window, but you could likely spend more shards by pooling Soul Shards beforehand.',
        );
      else
        feedback.push(
          'Low shard spending during Havoc. Try pooling Soul Shards before casting Havoc.',
        );
    } else {
      if (shardsSpent >= 10)
        feedback.push(
          'Excellent Havoc usage. You maximized your shard spending during the window.',
        );
      else if (shardsSpent >= 8)
        feedback.push('Good Havoc window. A bit more shard spending would make this perfect.');
      else if (shardsSpent >= 6)
        feedback.push(
          'Decent Havoc window, but you could likely spend more shards by pooling Soul Shards beforehand.',
        );
      else
        feedback.push(
          'Low shard spending during Havoc. Try pooling Soul Shards before casting Havoc.',
        );
    }

    if (!startWasFabricated) {
      if (shardsOnCast >= 4) {
        feedback.push(
          `You entered Havoc with ${shardsOnCast.toFixed(1)} Soul Shard${shardsOnCast !== 1 ? 's' : ''} banked -- great job.`,
        );
      } else if (shardsOnCast >= 3) {
        feedback.push(
          'You entered Havoc with 3 Soul Shards banked -- a decent pool, but getting closer to max lets you spend faster during the window.',
        );
      } else if (shardsOnCast >= 2) {
        feedback.push(
          'You entered Havoc with only 2 Soul Shards banked. Try pooling more shards to get closer to max before casting Havoc.',
        );
      } else {
        feedback.push(
          `You cast Havoc with ${shardsOnCast.toFixed(1)} Soul Shard${shardsOnCast !== 1 ? 's' : ''} banked, which delays your first spenders. Pooling more before casting Havoc lets you start spending immediately.`,
        );
      }
    }

    if (shadowburnsInExecute > 0) {
      feedback.push(
        `${shadowburnsInExecute} Shadowburn${shadowburnsInExecute !== 1 ? 's' : ''} landed while the target was in execute range -- good use of Havoc during execute.`,
      );
    }

    const nonExecuteShadowburns = shadowburns - shadowburnsInExecute;
    if (nonExecuteShadowburns > 0 && hasFiendishCruelty) {
      feedback.push(
        `${nonExecuteShadowburns} Shadowburn${nonExecuteShadowburns !== 1 ? 's' : ''} cast via a Fiendish Cruelty proc (free, no shard cost) - good use of the free cast.`,
      );
    }

    if (casts.length < 6) {
      feedback.push(
        `Only ${casts.length} Havocable spell${casts.length !== 1 ? 's' : ''} were cast in this Havoc window. This may indicate movement, delayed casting, or missed opportunities.`,
      );
    }

    if (targetDied) {
      const proRatedBar = executeBurnBars ? executeBurnBars.perfect : maxExpectedSpenders;
      feedback.push(
        `The target died before the debuff expired, shortening your Havoc window -- expectation was pro-rated to ${proRatedBar}${executeBurnBars ? ' Shadowburn' : ' shard'}${proRatedBar !== 1 ? 's' : ''}${executeBurnBars ? '' : ' worth of spending'}.`,
      );
    }

    return (
      <ul style={{ paddingLeft: 20, margin: 0 }}>
        {feedback.map((line, i) => (
          <li key={i}>{line}</li>
        ))}
      </ul>
    );
  }

  const perCastData: PerCastData[] = havocAnalyzer.havocData.map((window, index) => {
    const sequenceEntry = havocSequenceEvents[index];
    const shardsSpent = window.chaosBolts * 2 + window.shadowburns;
    const actualWindowDurationMs =
      (window.end ?? window.start + havocAnalyzer.havocDuration) - window.start;
    const windowFraction = actualWindowDurationMs / havocAnalyzer.havocDuration;
    const isExecuteBurnWindow = window.chaosBolts === 0 && window.shadowburnsInExecute > 0;
    const fullPerfectBar = havocAnalyzer.havocDuration === 20000 ? 14 : 10;
    const maxExpectedSpenders = window.targetDied
      ? Math.max(1, Math.round(fullPerfectBar * windowFraction))
      : fullPerfectBar;

    const executeBurnFullBar = havocAnalyzer.havocDuration === 20000 ? 12 : 9;
    const executeBurnBars = isExecuteBurnWindow
      ? (() => {
          const perfect = window.targetDied
            ? Math.max(1, Math.round(executeBurnFullBar * windowFraction))
            : executeBurnFullBar;
          return {
            perfect,
            good: Math.round(perfect * (10 / 12)),
            ok: Math.round(perfect * (8 / 12)),
          };
        })()
      : null;

    let performance: QualitativePerformance;
    if (executeBurnBars) {
      if (window.shadowburns >= executeBurnBars.perfect)
        performance = QualitativePerformance.Perfect;
      else if (window.shadowburns >= executeBurnBars.good)
        performance = QualitativePerformance.Good;
      else if (window.shadowburns >= executeBurnBars.ok) performance = QualitativePerformance.Ok;
      else performance = QualitativePerformance.Fail;
    } else {
      performance = rateHavocWindow(shardsSpent, maxExpectedSpenders);
    }

    return {
      timestamp: formatTimestamp(window.start),
      performance,
      stats: [
        {
          label: 'Chaos Bolts',
          value: window.chaosBolts,
          tooltip: 'Chaos Bolts cast during the Havoc window',
        },
        {
          label: 'Shadowburns',
          value: window.shadowburns,
          tooltip: 'Shadowburn casts during the Havoc window',
        },
        {
          label: 'Casts',
          value: window.casts.length,
          tooltip: 'Total Havocable spells cast during this Havoc window',
        },
        {
          label: 'Soul Shards at Cast',
          value: window.shardsOnCast.toFixed(1),
          tooltip: 'Soul Shards you had banked when Havoc was applied',
        },
      ],
      details: getHavocFeedback(
        shardsSpent,
        window.shadowburns,
        window.shadowburnsInExecute,
        window.shardsOnCast,
        hasFiendishCruelty,
        maxExpectedSpenders,
        executeBurnBars,
        window.startWasFabricated ?? false,
        window.casts,
        havocAnalyzer.havocDuration,
        window.targetDied,
      ),
      additionalContent: sequenceEntry
        ? {
            title: 'Cast Sequence',
            content: <SpellSequence casts={sequenceEntry.casts} iconSize={40} />,
          }
        : undefined,
    };
  });

  return (
    <GuideSection spell={SPELLS.HAVOC} explanation={explanation}>
      <CastDetail title="Havoc Windows" casts={perCastData} />
    </GuideSection>
  );
}
