import type { JSX } from 'react';
import { useMemo } from 'react';
import SPELLS from 'common/SPELLS/warlock';
import TALENTS from 'common/TALENTS/warlock';
import { SpellLink } from 'interface';
import { useAnalyzer, Section } from 'interface/guide';
import GuideSection from 'interface/guide/components/GuideSection';
import CastDetail, {
  type PerCastData,
  type PerCastStat,
} from 'interface/guide/components/CastDetail';
import { QualitativePerformance } from 'parser/ui/QualitativePerformance';
import SpellUsageSubSection from 'parser/core/SpellUsage/SpellUsageSubSection';
import { type SpellUse } from 'parser/core/SpellUsage/core';
import DarkHarvest, {
  type DarkHarvestCastData,
  type DarkHarvestHit,
} from '../analyzers/DarkHarvest';
import CullTheWeak from '../analyzers/CulltheWeak';

const CDR_MS = 1500;

// Rates per-cast CDR efficiency by what fraction of theoretical CDR was actually effective.
function cdrEfficiencyPerformance(effectiveMs: number, totalMs: number): QualitativePerformance {
  if (totalMs === 0) return QualitativePerformance.Perfect;
  const ratio = effectiveMs / totalMs;
  if (ratio >= 0.9) return QualitativePerformance.Perfect;
  if (ratio >= 0.75) return QualitativePerformance.Good;
  if (ratio >= 0.5) return QualitativePerformance.Ok;
  return QualitativePerformance.Fail;
}

// Converts a fight-relative millisecond offset to "M:SS" display format.
function formatTimestamp(ms: number): string {
  const totalSec = Math.floor(ms / 1000);
  const min = Math.floor(totalSec / 60);
  const sec = totalSec % 60;
  return `${min}:${sec.toString().padStart(2, '0')}`;
}

// Missing periodic effects (Agony, Corruption/Wither, UA if talented) on this hit; Haunt is separate.
// UA only counts against single-target casts — keeping it on every cleave target isn't realistic.
function missingDotCount(hit: DarkHarvestHit, scoreUA: boolean): number {
  return [!hit.hadAgony, !hit.hadCorruption, scoreUA && hit.hadUA === false].filter(Boolean).length;
}

function missingToPerformance(missing: number): QualitativePerformance {
  if (missing === 0) return QualitativePerformance.Perfect;
  if (missing === 1) return QualitativePerformance.Good;
  if (missing === 2) return QualitativePerformance.Ok;
  return QualitativePerformance.Fail;
}

function castPerformance(cast: DarkHarvestCastData): QualitativePerformance {
  if (cast.hits.length === 0) return QualitativePerformance.Fail;
  const scoreUA = cast.hits.length === 1;
  const worstMissing = Math.max(...cast.hits.map((hit) => missingDotCount(hit, scoreUA)));
  return missingToPerformance(worstMissing);
}

type MissingDot = 'agony' | 'corruption' | 'ua';

function getMissingDots(hit: DarkHarvestHit): MissingDot[] {
  const missing: MissingDot[] = [];
  if (!hit.hadAgony) missing.push('agony');
  if (!hit.hadCorruption) missing.push('corruption');
  if (hit.hadUA === false) missing.push('ua');
  return missing;
}

// Targets are identified by count, not name, since cleave adds are often duplicate-named.
function getDotDetails(cast: DarkHarvestCastData, witherActive: boolean): JSX.Element {
  const corruptionSpell = witherActive ? SPELLS.WITHER_DEBUFF : SPELLS.CORRUPTION_DEBUFF;
  const missingDotLink: Record<MissingDot, JSX.Element> = {
    agony: <SpellLink spell={SPELLS.AGONY} />,
    corruption: <SpellLink spell={corruptionSpell} />,
    ua: <SpellLink spell={TALENTS.UNSTABLE_AFFLICTION_TALENT} />,
  };

  const missingCounts: Record<MissingDot, number> = { agony: 0, corruption: 0, ua: 0 };
  for (const hit of cast.hits) {
    for (const dot of getMissingDots(hit)) {
      missingCounts[dot] += 1;
    }
  }
  const dotsMissingAnywhere = (['agony', 'corruption', 'ua'] as MissingDot[]).filter(
    (dot) => missingCounts[dot] > 0,
  );

  return (
    <>
      {cast.hits.length === 0 ? (
        <p>
          No enemy was afflicted by your periodic effects when this channel went out — the entire
          cooldown was wasted.
        </p>
      ) : (
        <>
          <p>{cast.hits.length} target(s) hit.</p>
          {dotsMissingAnywhere.length === 0 ? (
            <p>All periodic effects were active on every target.</p>
          ) : (
            <ul>
              {dotsMissingAnywhere.map((dot) => (
                <li key={dot}>
                  {missingCounts[dot]}/{cast.hits.length} targets missing {missingDotLink[dot]}
                </li>
              ))}
            </ul>
          )}
          {cast.hits.length > 1 && cast.hits.some((h) => h.hadUA !== null) && (
            <p>
              <SpellLink spell={TALENTS.UNSTABLE_AFFLICTION_TALENT} /> isn't expected on every
              cleave target, so it isn't scored on multi-target casts.
            </p>
          )}
          {cast.hauntActiveOnHit && (
            <p>
              <SpellLink spell={TALENTS.HAUNT_TALENT} /> was active on one of the targets,
              amplifying the damage dealt to it.
            </p>
          )}
        </>
      )}
    </>
  );
}

export default function DarkHarvestGuide(): JSX.Element | null {
  const darkHarvest = useAnalyzer(DarkHarvest);
  const cullTheWeak = useAnalyzer(CullTheWeak);

  const { dotCastData, cdrUses } = useMemo((): {
    dotCastData: PerCastData[];
    cdrUses: SpellUse[];
  } => {
    if (!darkHarvest) return { dotCastData: [], cdrUses: [] };

    const { witherActive, uaActive } = darkHarvest;
    const fightStart = darkHarvest.fightStart;

    // Fixed set of summary stat cards, regardless of hit count.
    const dotCastData: PerCastData[] = darkHarvest.casts.map((cast) => {
      let stats: PerCastStat[];
      if (cast.hits.length === 0) {
        stats = [
          {
            label: 'Targets Hit',
            value: '0',
            performance: QualitativePerformance.Fail,
            tooltip: 'No afflicted enemy was in range — the cooldown was completely wasted.',
          },
        ];
      } else {
        const scoreUA = uaActive && cast.hits.length === 1;
        const requiredDots = 2 + (scoreUA ? 1 : 0); // Agony, Corruption/Wither, and UA on single-target casts
        const missingCounts = cast.hits.map((hit) => missingDotCount(hit, scoreUA));
        const fullyCovered = missingCounts.filter((m) => m === 0).length;
        const worstMissing = Math.max(...missingCounts);
        stats = [
          {
            label: 'Targets Hit',
            value: String(cast.hits.length),
            performance: QualitativePerformance.Perfect,
            tooltip: `${cast.hits.length} target(s) struck by this channel.`,
          },
          {
            label: 'Full Coverage',
            value: `${fullyCovered}/${cast.hits.length}`,
            performance:
              fullyCovered === cast.hits.length
                ? QualitativePerformance.Perfect
                : missingToPerformance(worstMissing),
            tooltip: `${fullyCovered} of ${cast.hits.length} struck targets had every periodic effect active.`,
          },
          {
            label: 'Worst Coverage',
            value: `${requiredDots - worstMissing}/${requiredDots}`,
            performance: missingToPerformance(worstMissing),
            tooltip:
              worstMissing === 0
                ? 'Every struck target had full coverage.'
                : `The worst-covered target was missing ${worstMissing} of ${requiredDots} periodic effects.`,
          },
        ];
      }
      return {
        performance: castPerformance(cast),
        timestamp: formatTimestamp(cast.timestamp - fightStart),
        stats,
        details: getDotDetails(cast, witherActive),
      };
    });

    // One SpellUse per DH cast; first cast has nothing to measure, rest need at least one UA/SoC in window.
    const firstCast = darkHarvest.casts[0];
    const firstCastUse: SpellUse | null = firstCast
      ? {
          event: firstCast.event,
          performance: QualitativePerformance.Perfect,
          performanceExplanation: 'First Dark Harvest cast — nothing to measure.',
          checklistItems: [
            {
              check: 'first-cast',
              timestamp: firstCast.timestamp,
              performance: QualitativePerformance.Perfect,
              summary: 'First cast',
              details: (
                <p>
                  This is the first <SpellLink spell={TALENTS.DARK_HARVEST_TALENT} /> cast. There is
                  there is no previous cast to measure CDR efficiency from.
                </p>
              ),
            },
          ],
        }
      : null;

    const windowUses = darkHarvest.casts
      .slice(1)
      .filter((cast) => cast.cdrGainedMs > 0)
      .map((cast) => ({
        event: cast.event,
        performance: cdrEfficiencyPerformance(cast.effectiveCdrMs, cast.cdrGainedMs),
        checklistItems: [
          {
            check: 'effective',
            timestamp: cast.timestamp,
            performance: QualitativePerformance.Perfect,
            summary: `${(cast.effectiveCdrMs / 1000).toFixed(1)}s effective CDR`,
            details: (
              <>
                <p>Casts that reduced the cooldown since the previous Dark Harvest:</p>
                <ul>
                  {cast.uaCastsInWindow > 0 && (
                    <li>
                      <SpellLink spell={SPELLS.UNSTABLE_AFFLICTION} />: {cast.uaCastsInWindow} cast
                      {cast.uaCastsInWindow !== 1 ? 's' : ''} (
                      {(cast.uaCastsInWindow * 1.5).toFixed(1)}s)
                    </li>
                  )}
                  {cast.socCastsInWindow > 0 && (
                    <li>
                      <SpellLink spell={SPELLS.SEED_OF_CORRUPTION_DEBUFF} />:{' '}
                      {cast.socCastsInWindow} cast{cast.socCastsInWindow !== 1 ? 's' : ''} (
                      {(cast.socCastsInWindow * 1.5).toFixed(1)}s)
                    </li>
                  )}
                </ul>
                <p>
                  {(cast.effectiveCdrMs / 1000).toFixed(1)}s of the{' '}
                  {(cast.cdrGainedMs / 1000).toFixed(1)}s generated actually reduced the cooldown.
                </p>
              </>
            ),
          },
          {
            check: 'wasted',
            timestamp: cast.timestamp,
            performance:
              cast.wastedCdrMs < CDR_MS
                ? QualitativePerformance.Perfect
                : QualitativePerformance.Ok,
            summary:
              cast.wastedCdrMs < CDR_MS
                ? 'All CDR was effective'
                : `${(cast.wastedCdrMs / 1000).toFixed(1)}s excess CDR`,
            details:
              cast.wastedCdrMs < CDR_MS ? (
                <p>
                  <SpellLink spell={TALENTS.DARK_HARVEST_TALENT} /> was on cooldown for every
                  contributing cast — all CDR was effective.
                </p>
              ) : (
                <p>
                  {(cast.wastedCdrMs / 1000).toFixed(1)}s of CDR was generated after{' '}
                  <SpellLink spell={TALENTS.DARK_HARVEST_TALENT} /> was already off cooldown. A
                  small amount is expected when casting{' '}
                  <SpellLink spell={SPELLS.UNSTABLE_AFFLICTION} /> or{' '}
                  <SpellLink spell={SPELLS.SEED_OF_CORRUPTION_DEBUFF} /> to set up DoTs before
                  pressing <SpellLink spell={TALENTS.DARK_HARVEST_TALENT} />. Try to cast it as soon
                  as your DoTs are in place.
                </p>
              ),
          },
        ],
      }));

    const cdrUses: SpellUse[] = [...(firstCastUse ? [firstCastUse] : []), ...windowUses];

    return { dotCastData, cdrUses };
  }, [darkHarvest]);

  if (!darkHarvest) return null;

  const { witherActive, uaActive, hauntActive } = darkHarvest;
  const corruptionSpell = witherActive ? SPELLS.WITHER_DEBUFF : SPELLS.CORRUPTION_DEBUFF;
  const hasCullTheWeak = cullTheWeak?.active ?? false;

  const dotExplanation = (
    <>
      <p>
        <b>
          <SpellLink spell={TALENTS.DARK_HARVEST_TALENT} /> is a channel (3 seconds base, reduced by
          haste) that consumes your periodic effects off every currently afflicted enemy it can
          reach — it isn't tied to a single target.
        </b>
      </p>
      <p>
        Casting it while nothing is afflicted wastes the entire cooldown. Before pressing it, make
        sure <SpellLink spell={SPELLS.AGONY} /> and <SpellLink spell={corruptionSpell} /> are active
        on your target
        {uaActive && (
          <>
            , along with <SpellLink spell={TALENTS.UNSTABLE_AFFLICTION_TALENT} />
          </>
        )}
        . On cleave, more afflicted targets in range means more value from a single cast.
      </p>
      {hauntActive && (
        <p>
          <SpellLink spell={TALENTS.HAUNT_TALENT} /> doesn't affect who{' '}
          <SpellLink spell={TALENTS.DARK_HARVEST_TALENT} /> hits, but it amplifies all damage taken
          by whatever it's active on — keep it up on the target you most want{' '}
          <SpellLink spell={TALENTS.DARK_HARVEST_TALENT} /> to hit hardest.
        </p>
      )}
    </>
  );

  const cdrExplanation = (
    <>
      <p>
        <SpellLink spell={TALENTS.CULL_THE_WEAK_TALENT} /> reduces{' '}
        <SpellLink spell={TALENTS.DARK_HARVEST_TALENT} />
        's cooldown by 1.5s per <SpellLink spell={SPELLS.UNSTABLE_AFFLICTION} /> or{' '}
        <SpellLink spell={SPELLS.SEED_OF_CORRUPTION_DEBUFF} /> cast. If{' '}
        <SpellLink spell={TALENTS.DARK_HARVEST_TALENT} /> is already off cooldown, that reduction is
        wasted — some waste is expected when those casts are also setting up DoTs before you press{' '}
        <SpellLink spell={TALENTS.DARK_HARVEST_TALENT} />.
      </p>
      <p>
        Cast <SpellLink spell={TALENTS.DARK_HARVEST_TALENT} /> as soon as your DoTs are up to
        minimize how much CDR goes to waste.
      </p>
    </>
  );

  return (
    <>
      <Section title="Dark Harvest">
        <GuideSection spell={TALENTS.DARK_HARVEST_TALENT} explanation={dotExplanation}>
          <CastDetail title="Dark Harvest Casts" casts={dotCastData} />
        </GuideSection>
      </Section>
      {hasCullTheWeak && cdrUses.length > 0 && (
        <Section title="Cull the Weak CDR Efficiency">
          <SpellUsageSubSection
            title="Cull the Weak CDR Efficiency"
            explanation={cdrExplanation}
            uses={cdrUses}
            castBreakdownSmallText={
              <>
                - Each box represents one Dark Harvest cast, colored by how efficiently you reduced
                its cooldown since the previous one.
              </>
            }
          />
        </Section>
      )}
    </>
  );
}
