import type { JSX } from 'react';
import { formatNumber } from 'common/format';
import SPELLS from 'common/SPELLS/hunter';
import TALENTS from 'common/TALENTS/hunter';
import { SpellLink } from 'interface';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, {
  BeginCastEvent,
  CastEvent,
  DamageEvent,
  EndChannelEvent,
  GetRelatedEvent,
  GetRelatedEvents,
  HasAbility,
} from 'parser/core/Events';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import ItemDamageDone from 'parser/ui/ItemDamageDone';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';
import { QualitativePerformance } from 'parser/ui/QualitativePerformance';
import CastSummaryAndBreakdown from 'interface/guide/components/CastSummaryAndBreakdown';
import { explanationAndDataSubsection } from 'interface/guide/components/ExplanationRow';
import { BoxRowEntry } from 'interface/guide/components/PerformanceBoxRow';
import { BadColor, GoodColor, OkColor } from 'interface/guide';
import Haste from 'parser/shared/modules/Haste';
import {
  BOOMSTICK_CAST_HIT,
  BOOMSTICK_CAST_END,
  BOOMSTICK_NEXT_CAST,
} from '../../normalizers/BoomstickNormalizer';

/** Result of analyzing a single expected tick slot */
interface TickResult {
  tickNumber: number;
  hit: boolean;
  targetsHit: number;
  damage: number;
}

/**
 * Boomstick analyzer
 *
 * Boomstick is a 3-second channeled ability that fires a directional cone of damage.
 * It deals damage in 4 ticks at 1s intervals (hasted).
 * Damage is grouped in the ticks, the ticks assigned to their expected order for tooltip display.
 */
class Boomstick extends Analyzer.withDependencies({ haste: Haste }) {
  private totalDamage = 0;
  private totalHits = 0;
  private totalTicks = 0;
  private useEntries: BoxRowEntry[] = [];
  private clippedCasts = 0;

  private static readonly BUCKET_WINDOW_MS = 100;
  private static readonly EXPECTED_TICKS = 4;
  private static readonly BASE_TICK_INTERVAL_MS = 800;
  private static readonly TICK_MATCH_TOLERANCE_MS = 200;

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(TALENTS.BOOMSTICK_TALENT);
    if (!this.active) {
      return;
    }

    this.addEventListener(
      Events.EndChannel.by(SELECTED_PLAYER).spell(TALENTS.BOOMSTICK_TALENT),
      this.onEndChannel,
    );
  }

  private onEndChannel = (event: EndChannelEvent) => {
    const cast = GetRelatedEvent<CastEvent>(event, BOOMSTICK_CAST_END);
    if (!cast) {
      return;
    }

    const tipped = this.selectedCombatant.hasBuff(SPELLS.TIP_OF_THE_SPEAR_CAST.id, cast.timestamp);
    const tickResults = this.analyzeTicksForCast(cast);
    const nextAbility = GetRelatedEvent<CastEvent | BeginCastEvent>(event, BOOMSTICK_NEXT_CAST);

    // Aggregate stats
    const ticksHit = tickResults.filter((t) => t.hit).length;
    const castDamage = tickResults.reduce((sum, t) => sum + t.damage, 0);
    const castHits = tickResults.reduce((sum, t) => sum + t.targetsHit, 0);
    const missedTicks = tickResults.filter((t) => !t.hit).map((t) => t.tickNumber);

    this.totalDamage += castDamage;
    this.totalHits += castHits;
    this.totalTicks += ticksHit;

    // Clipped = fewer than 4 ticks AND immediately cast another ability
    const wasClipped =
      ticksHit < Boomstick.EXPECTED_TICKS && nextAbility !== undefined && HasAbility(nextAbility);

    // Determine performance
    const { value, header, clippingInfo } = this.classifyCast(
      tipped,
      ticksHit,
      wasClipped,
      missedTicks,
      nextAbility,
    );

    if (wasClipped) {
      this.clippedCasts += 1;
    }

    // Build tooltip
    const tooltip = this.buildTooltip(
      cast,
      header,
      ticksHit,
      wasClipped,
      missedTicks,
      tickResults,
      castDamage,
      clippingInfo,
    );

    this.useEntries.push({ value, tooltip });
  };

  // Group damage events into tick buckets and match against expected tick times
  private analyzeTicksForCast(cast: CastEvent): TickResult[] {
    const hits = GetRelatedEvents<DamageEvent>(cast, BOOMSTICK_CAST_HIT).sort(
      (a, b) => a.timestamp - b.timestamp,
    );

    // Group damage events into buckets by timestamp proximity
    const buckets = hits.reduce<DamageEvent[][]>((acc, hit) => {
      const lastBucket = acc[acc.length - 1];
      if (!lastBucket || hit.timestamp - lastBucket[0].timestamp > Boomstick.BUCKET_WINDOW_MS) {
        acc.push([hit]);
      } else {
        lastBucket.push(hit);
      }
      return acc;
    }, []);

    // Calculate expected tick times based on haste
    const hasteAtCast = this.deps.haste.current;
    const tickInterval = Boomstick.BASE_TICK_INTERVAL_MS / (1 + hasteAtCast);

    // Match each expected tick slot to actual damage buckets
    return [0, 1, 2, 3].map((tickIndex) => {
      const tickNumber = tickIndex + 1;
      const expectedTime = cast.timestamp + tickInterval * tickIndex;

      const matchingBucket = buckets.find((bucket) => {
        const diff = Math.abs(bucket[0].timestamp - expectedTime);
        return diff < Boomstick.TICK_MATCH_TOLERANCE_MS;
      });

      if (matchingBucket) {
        const damage = matchingBucket.reduce(
          (sum, hit) => sum + hit.amount + (hit.absorbed ?? 0),
          0,
        );
        return { tickNumber, hit: true, targetsHit: matchingBucket.length, damage };
      }
      return { tickNumber, hit: false, targetsHit: 0, damage: 0 };
    });
  }

  // Determine cast performance and generate header/clipping info
  private classifyCast(
    tipped: boolean,
    ticksHit: number,
    wasClipped: boolean,
    missedTicks: number[],
    nextAbility: CastEvent | BeginCastEvent | undefined,
  ): { value: QualitativePerformance; header: JSX.Element; clippingInfo: JSX.Element | null } {
    let value: QualitativePerformance;
    let header: JSX.Element;
    let clippingInfo: JSX.Element | null = null;

    if (!tipped) {
      value = QualitativePerformance.Fail;
      header = <h5 style={{ color: BadColor }}>Bad cast: no Tip of the Spear.</h5>;
    } else if (ticksHit === Boomstick.EXPECTED_TICKS) {
      value = QualitativePerformance.Good;
      header = <h5 style={{ color: GoodColor }}>Good cast: tipped with all ticks.</h5>;
    } else if (wasClipped) {
      value = QualitativePerformance.Fail;
      header = <h5 style={{ color: BadColor }}>Bad cast: channel clipped early.</h5>;
      if (nextAbility && HasAbility(nextAbility)) {
        clippingInfo = (
          <div>
            <strong>Clipped by:</strong> <SpellLink spell={nextAbility.ability.guid} />
          </div>
        );
      }
    } else if (ticksHit === 3) {
      value = QualitativePerformance.Ok;
      header = <h5 style={{ color: OkColor }}>Acceptable: tipped but missed a tick.</h5>;
    } else {
      value = QualitativePerformance.Fail;
      header = (
        <h5 style={{ color: BadColor }}>Bad cast: missed ticks {missedTicks.join(', ')}.</h5>
      );
    }

    return { value, header, clippingInfo };
  }

  // Build the tooltip JSX for a cast
  private buildTooltip(
    cast: CastEvent,
    header: JSX.Element,
    ticksHit: number,
    wasClipped: boolean,
    missedTicks: number[],
    tickResults: TickResult[],
    castDamage: number,
    clippingInfo: JSX.Element | null,
  ): JSX.Element {
    const tickLines = tickResults.map((tick) =>
      tick.hit ? (
        <div key={tick.tickNumber}>
          Tick {tick.tickNumber}: <strong>{tick.targetsHit}</strong> targets{' '}
          <small>({formatNumber(tick.damage)} damage)</small>
        </div>
      ) : (
        <div key={tick.tickNumber} style={{ color: BadColor }}>
          Tick {tick.tickNumber}: <em>Missed</em>
        </div>
      ),
    );

    return (
      <div>
        {header}
        <strong>{this.owner.formatTimestamp(cast.timestamp)}</strong>
        {ticksHit !== Boomstick.EXPECTED_TICKS && (
          <div>
            Ticks: {ticksHit}/{Boomstick.EXPECTED_TICKS}{' '}
            <small>
              {wasClipped
                ? '(clipped channel)'
                : `(missed tick${missedTicks.length !== 1 ? 's' : ''} ${missedTicks.join(', ')})`}
            </small>
          </div>
        )}
        {tickLines}
        <div>
          <strong>Total Damage:</strong> {formatNumber(castDamage)}
        </div>
        {clippingInfo}
      </div>
    );
  }

  get guideSubsection(): JSX.Element {
    const explanation = (
      <p>
        <strong>
          <SpellLink spell={TALENTS.BOOMSTICK_TALENT} />
        </strong>{' '}
        should always be cast with <SpellLink spell={SPELLS.TIP_OF_THE_SPEAR_CAST.id} /> active.
        Additionally, avoid interrupting the channel early - let it complete all 4 ticks for maximum
        damage. Because Boomstick is a directional cone ability, ensure you're facing targets to
        avoid missing ticks.
      </p>
    );

    const data = (
      <CastSummaryAndBreakdown
        spell={TALENTS.BOOMSTICK_TALENT}
        castEntries={this.useEntries}
        badExtraExplanation={<>missing Tip of the Spear or clipped channel</>}
        usesInsteadOfCasts
      />
    );

    return explanationAndDataSubsection(explanation, data);
  }

  statistic() {
    return (
      <Statistic
        position={STATISTIC_ORDER.CORE()}
        size="flexible"
        category={STATISTIC_CATEGORY.TALENTS}
      >
        <BoringSpellValueText spell={TALENTS.BOOMSTICK_TALENT}>
          <>
            <ItemDamageDone amount={this.totalDamage} />
            <br />
            {this.totalHits} <small>targets hit</small>
            <br />
            {(this.totalTicks > 0 ? this.totalHits / this.totalTicks : 0).toFixed(1)}{' '}
            <small>avg targets/tick</small>
            {this.clippedCasts > 0 && (
              <>
                <br />
                {this.clippedCasts} <small>clipped casts</small>
              </>
            )}
          </>
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default Boomstick;
