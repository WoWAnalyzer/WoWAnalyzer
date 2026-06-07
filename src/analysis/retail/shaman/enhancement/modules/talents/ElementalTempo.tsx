import type { JSX } from 'react';
import cssComponent from "interface/utils/css-component";
import styles from "./ElementalTempo.module.scss";
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { CastEvent, FreeCastEvent } from 'parser/core/Events';
import Abilities from 'parser/core/modules/Abilities';
import SpellUsable from 'analysis/retail/shaman/enhancement/modules/core/SpellUsable';
import TALENTS from 'common/TALENTS/shaman';
import SPELLS from 'common/SPELLS';
import RESOURCE_TYPES, { getResourceCost } from 'game/RESOURCE_TYPES';
import { SpellLink } from 'interface';
import GuideSection from 'interface/guide/components/GuideSection';
import CastOverview from 'interface/guide/components/CastOverview';
import { formatDurationMillisMinSec, formatPercentage } from 'common/format';
import { QualitativePerformance } from 'parser/ui/QualitativePerformance';
import {
  computeScore,
  getAggregatedScore,
  scoreFromBreakpoints,
  scoreToQualitativePerformance,
} from 'parser/ui/WeightedPerformance';
import { MAELSTROM_WEAPON_ELIGIBLE_SPELLS } from '../../constants';
import { CastDetail, PerCastData } from 'interface/guide/components';

const CDR_MS_PER_STACK = 300;

type ElementalTempCast = {
  totalMs: number;
  effectiveMs: number;
  wastedMs: number;
};

type CastCdrBreakdown = {
  timestamp: number;
  spenderSpellId: number;
  stacksSpent: number;
  isAscendanceActive: boolean;
  stormstrike: ElementalTempCast;
  lavaLash: ElementalTempCast;
};

type OverviewBreakdown = {
  totalStacksSpent: number;
  totalPotentialMs: number;
  totalWastedMs: number;
};

class ElementalTempo extends Analyzer.withDependencies({
  spellUsable: SpellUsable,
  abilities: Abilities,
}) {
  private spellModRates = new Map<number, number>();
  private casts: CastCdrBreakdown[] = [];

  constructor(options: Options) {
    super(options);

    this.active = this.selectedCombatant.hasTalent(TALENTS.ELEMENTAL_TEMPO_TALENT);
    if (!this.active) {
      return;
    }

    this.addEventListener(
      Events.cast.by(SELECTED_PLAYER).spell(MAELSTROM_WEAPON_ELIGIBLE_SPELLS),
      this.onMaelstromSpenderCast,
    );
    this.addEventListener(
      Events.freecast.by(SELECTED_PLAYER).spell(MAELSTROM_WEAPON_ELIGIBLE_SPELLS),
      this.onMaelstromSpenderCast,
    );
  }

  /**
   * SpellUsable tracks cooldowns in wall-clock time, but its time-based cooldown reduction API
   * expects *unscaled* milliseconds (i.e. scaled by the spell's current cooldown recovery rate / modRate).
   *
   * Elemental Tempo's tooltip is expressed in wall-clock seconds (e.g. 8 stacks => 2.4s),
   * so we convert wall-clock reductions to unscaled before applying them, then convert the
   * effective reduction back to wall-clock for waste calculations.
   */
  private onMaelstromSpenderCast(event: CastEvent | FreeCastEvent) {
    const stacksSpent = getResourceCost(event.resourceCost, RESOURCE_TYPES.MAELSTROM_WEAPON.id);
    if (!stacksSpent || stacksSpent <= 0) {
      return;
    }

    const cooldownReduction = stacksSpent * CDR_MS_PER_STACK;

    const hasThorims = this.selectedCombatant.hasTalent(TALENTS.THORIMS_INVOCATION_TALENT);
    const isInDoomWinds = this.selectedCombatant.hasBuff(SPELLS.DOOM_WINDS_BUFF, event.timestamp);
    const isAscendanceActive = this.selectedCombatant.hasBuff(
      TALENTS.ASCENDANCE_ENHANCEMENT_TALENT.id,
      event.timestamp,
    );
    if (hasThorims && (isInDoomWinds || isAscendanceActive)) {
      return;
    }

    const stormstrikeSpellId = isAscendanceActive
      ? SPELLS.WINDSTRIKE_CAST.id
      : SPELLS.STORMSTRIKE.id;

    const stormstrikeRemainingBefore = this.deps.spellUsable.cooldownRemaining(
      stormstrikeSpellId,
      event.timestamp,
    );
    const lavaLashRemainingBefore = this.deps.spellUsable.cooldownRemaining(
      TALENTS.LAVA_LASH_TALENT.id,
      event.timestamp,
    );

    const stormstrike = this.calculateCdrWasteForSpell(stormstrikeSpellId, cooldownReduction);
    const lavaLash = this.calculateCdrWasteForSpell(TALENTS.LAVA_LASH_TALENT.id, cooldownReduction);

    this.casts.push({
      timestamp: event.timestamp,
      spenderSpellId: event.ability.guid,
      stacksSpent,
      isAscendanceActive,
      stormstrike: {
        ...stormstrike,
        totalMs: Math.min(stormstrike.totalMs, stormstrikeRemainingBefore),
      },
      lavaLash: {
        ...lavaLash,
        totalMs: Math.min(lavaLash.totalMs, lavaLashRemainingBefore),
      },
    });
  }

  private getSpellModRate(spellId: number): number {
    const cachedModRate = this.spellModRates.get(spellId);
    if (cachedModRate !== undefined) {
      return cachedModRate;
    }

    const ability = this.deps.abilities.getAbility(spellId);
    const canonicalId = ability ? ability.primarySpell : spellId;

    const unscaledCooldown = this.deps.abilities.getExpectedCooldownDuration(canonicalId);
    const scaledCooldown = this.deps.spellUsable.fullCooldownDuration(canonicalId);

    if (!unscaledCooldown || !scaledCooldown) {
      return 1;
    }

    const modRate = unscaledCooldown / scaledCooldown;
    this.spellModRates.set(spellId, modRate);
    return modRate;
  }

  private calculateCdrWasteForSpell(spellId: number, cooldownReduction: number): ElementalTempCast {
    const modRate = this.getSpellModRate(spellId);
    const effectiveCdr =
      this.deps.spellUsable.reduceCooldown(spellId, cooldownReduction * modRate) / modRate;
    const wastedCdr = Math.max(0, cooldownReduction - effectiveCdr);

    return {
      totalMs: cooldownReduction,
      effectiveMs: effectiveCdr,
      wastedMs: wastedCdr,
    };
  }

  /**
   * Scoring constants for weighted performance evaluation.
   *
   * The per-spell waste decay is scaled inversely by (5 / stacksSpent) so that
   * higher stack counts produce gentler scoring curves, reflecting the reality
   * that large CDR amounts are unlikely to be fully utilised by both abilities.
   */
  private static readonly SCORING = {
    /** Weight for Stormstrike/Windstrike CDR waste */
    ssWasteWeight: 1,
    /** Weight for Lava Lash CDR waste */
    llWasteWeight: 1,
    /** Weight for stack count bonus (rewards spending at high stacks) */
    stackBonusWeight: 2,
    /**
     * Base exponential decay rate for per-spell waste scoring.
     * Effective decay = wasteDecayBase × (5 / stacksSpent).
     */
    wasteDecayBase: 1.5,
  } as const;

  /** Score a single spell's CDR waste using exponential decay, scaled by stacks spent. */
  private getSpellWasteScore(wastedMs: number, stacksSpent: number): number {
    const totalCdr = stacksSpent * CDR_MS_PER_STACK;
    if (totalCdr <= 0) {
      return 1.0;
    }
    const wasteFraction = wastedMs / totalCdr;
    const scaledDecay = ElementalTempo.SCORING.wasteDecayBase * (5 / stacksSpent);
    return computeScore(wasteFraction, (f) => Math.exp(-scaledDecay * f));
  }

  /** Higher stack counts are rewarded — spending at 10 is always desirable. */
  private getStackScore(stacksSpent: number): number {
    return scoreFromBreakpoints(stacksSpent, [
      { value: 5, score: 0.5 },
      { value: 8, score: 0.85 },
      { value: 10, score: 1.0 },
    ]);
  }

  /**
   * Per-check minimum score (floor) for waste checks, scaling with stacks spent.
   * At 10 stacks, waste scores are floored at 0.8 so that high-stack casts are
   * never significantly penalised regardless of cooldown state.
   */
  private getWasteMinScore(stacksSpent: number): number {
    return scoreFromBreakpoints(stacksSpent, [
      { value: 5, score: 0 },
      { value: 8, score: 0.5 },
      { value: 10, score: 0.8 },
    ]);
  }

  /** Weighted aggregate of per-spell waste and stack bonus scores. */
  private getOverallScore(cast: CastCdrBreakdown): number {
    const wasteMinScore = this.getWasteMinScore(cast.stacksSpent);
    return getAggregatedScore([
      {
        score: this.getSpellWasteScore(cast.stormstrike.wastedMs, cast.stacksSpent),
        weight: ElementalTempo.SCORING.ssWasteWeight,
        minScore: wasteMinScore,
      },
      {
        score: this.getSpellWasteScore(cast.lavaLash.wastedMs, cast.stacksSpent),
        weight: ElementalTempo.SCORING.llWasteWeight,
        minScore: wasteMinScore,
      },
      {
        score: this.getStackScore(cast.stacksSpent),
        weight: ElementalTempo.SCORING.stackBonusWeight,
      },
    ]);
  }

  private renderCastTooltip(cast: CastCdrBreakdown): JSX.Element {
    const stormstrikeLabel = cast.isAscendanceActive ? SPELLS.WINDSTRIKE_CAST : SPELLS.STORMSTRIKE;

    return (
      <>
        <div>
          @ <strong>{this.owner.formatTimestamp(cast.timestamp)}</strong>
        </div>
        <div>
          <strong>{formatDurationMillisMinSec(cast.stacksSpent * CDR_MS_PER_STACK, 1)}</strong> of
          CDR from <SpellLink spell={cast.spenderSpellId} /> @ {cast.stacksSpent}{' '}
          <SpellLink spell={SPELLS.MAELSTROM_WEAPON_BUFF} />
        </div>
        <div>
          <SpellLink spell={stormstrikeLabel} />:{' '}
          {formatDurationMillisMinSec(cast.stormstrike.wastedMs, 1)} wasted
        </div>
        <div>
          <SpellLink spell={TALENTS.LAVA_LASH_TALENT} />:{' '}
          {formatDurationMillisMinSec(cast.lavaLash.wastedMs, 1)} wasted
        </div>
      </>
    );
  }

  private buildOverviewBreakdown(): OverviewBreakdown {
    return this.casts.reduce<OverviewBreakdown>(
      (totals, cast) => {
        totals.totalStacksSpent += cast.stacksSpent;
        totals.totalPotentialMs += cast.stormstrike.totalMs + cast.lavaLash.totalMs;
        totals.totalWastedMs += cast.stormstrike.wastedMs + cast.lavaLash.wastedMs;
        return totals;
      },
      {
        totalStacksSpent: 0,
        totalPotentialMs: 0,
        totalWastedMs: 0,
      },
    );
  }

  private buildCastEntries(): PerCastData[] {
    return this.casts.map((cast) => {
      const stormstrikeLabel = cast.isAscendanceActive
        ? SPELLS.WINDSTRIKE_CAST
        : SPELLS.STORMSTRIKE;
      const totalCdr = cast.stacksSpent * CDR_MS_PER_STACK;
      const overallScore = this.getOverallScore(cast);

      const ssLabel = cast.isAscendanceActive ? 'Windstrike' : 'Stormstrike';

      return {
        performance: scoreToQualitativePerformance(overallScore),
        timestamp: this.owner.formatTimestamp(cast.timestamp),
        tooltip: this.renderCastTooltip(cast),
        stats: [
          {
            value: `${cast.stacksSpent}`,
            label: 'Stacks Spent',
            tooltip: (
              <>
                <SpellLink spell={SPELLS.MAELSTROM_WEAPON_BUFF} /> stacks consumed, providing{' '}
                {formatDurationMillisMinSec(totalCdr, 1)} of CDR to each ability.
              </>
            ),
          },
          {
            value: formatDurationMillisMinSec(cast.stormstrike.wastedMs, 1),
            label: `${ssLabel} Waste`,
            tooltip: (
              <>
                {formatDurationMillisMinSec(cast.stormstrike.effectiveMs, 1)} effective /{' '}
                {formatDurationMillisMinSec(totalCdr, 1)} total CDR applied to{' '}
                <SpellLink spell={stormstrikeLabel} />.
              </>
            ),
            performance: scoreToQualitativePerformance(
              this.getSpellWasteScore(cast.stormstrike.wastedMs, cast.stacksSpent),
            ),
          },
          {
            value: formatDurationMillisMinSec(cast.lavaLash.wastedMs, 1),
            label: 'Lava Lash Waste',
            tooltip: (
              <>
                {formatDurationMillisMinSec(cast.lavaLash.effectiveMs, 1)} effective /{' '}
                {formatDurationMillisMinSec(totalCdr, 1)} total CDR applied to{' '}
                <SpellLink spell={TALENTS.LAVA_LASH_TALENT} />.
              </>
            ),
            performance: scoreToQualitativePerformance(
              this.getSpellWasteScore(cast.lavaLash.wastedMs, cast.stacksSpent),
            ),
          },
        ],
      };
    });
  }

  private buildOverviewStats() {
    const overview = this.buildOverviewBreakdown();
    const perfectCasts = this.casts.filter(
      (c) =>
        scoreToQualitativePerformance(this.getOverallScore(c)) === QualitativePerformance.Perfect,
    ).length;

    return [
      {
        value: `${this.casts.length}`,
        label: 'Total Spenders',
        tooltip: (
          <>
            Total <SpellLink spell={SPELLS.MAELSTROM_WEAPON_BUFF} /> spender casts evaluated for{' '}
            <SpellLink spell={TALENTS.ELEMENTAL_TEMPO_TALENT} />.
          </>
        ),
      },
      {
        value:
          this.casts.length > 0
            ? (overview.totalStacksSpent / this.casts.length).toFixed(1)
            : '0.0',
        label: 'Avg Stacks Spent',
        tooltip: (
          <>
            Average number of <SpellLink spell={SPELLS.MAELSTROM_WEAPON_BUFF} /> stacks consumed per
            tracked spender cast.
          </>
        ),
      },
      {
        value: `${formatPercentage(
          overview.totalPotentialMs > 0 ? overview.totalWastedMs / overview.totalPotentialMs : 0,
          1,
        )}%`,
        label: 'Avg Waste',
        tooltip: (
          <>
            Weighted average percentage of <SpellLink spell={TALENTS.ELEMENTAL_TEMPO_TALENT} />{' '}
            cooldown reduction that was wasted.
          </>
        ),
      },
      {
        value: `${perfectCasts}`,
        label: 'Perfect Casts',
        tooltip: (
          <>
            Number of spender casts that wasted no{' '}
            <SpellLink spell={TALENTS.ELEMENTAL_TEMPO_TALENT} /> cooldown reduction.
          </>
        ),
        performance: QualitativePerformance.Perfect,
      },
    ];
  }

  get guideSubsection(): JSX.Element | null {
    if (!this.active) {
      return null;
    }

    const explanation = (
      <>
        <div>
          <p>
            <SpellLink spell={TALENTS.ELEMENTAL_TEMPO_TALENT} /> reduces the cooldown of{' '}
            <SpellLink spell={SPELLS.STORMSTRIKE} /> (or{' '}
            <SpellLink spell={SPELLS.WINDSTRIKE_CAST} /> during{' '}
            <SpellLink spell={TALENTS.ASCENDANCE_ENHANCEMENT_TALENT} />) and{' '}
            <SpellLink spell={TALENTS.LAVA_LASH_TALENT} /> whenever you consume{' '}
            <SpellLink spell={SPELLS.MAELSTROM_WEAPON_BUFF} /> stacks. The boxes below score each
            spender cast by how much cooldown reduction was wasted.
          </p>
          <p>
            <SpellLink spell={SPELLS.MAELSTROM_WEAPON_BUFF} /> spent by{' '}
            <SpellLink spell={TALENTS.THORIMS_INVOCATION_TALENT} /> during{' '}
            <SpellLink spell={TALENTS.ASCENDANCE_ENHANCEMENT_TALENT} /> &{' '}
            <SpellLink spell={TALENTS.DOOM_WINDS_TALENT} /> is not evaluated.
          </p>
        </div>
      </>
    );

    return (
      <GuideSection spell={TALENTS.ELEMENTAL_TEMPO_TALENT} explanation={explanation}>
        <CastOverview spell={TALENTS.ELEMENTAL_TEMPO_TALENT} stats={this.buildOverviewStats()} />
        <div>
          <HelperText>
            <strong>
              Note: This section is informative only and is not suggestive of poor performance. If
              you find you have significant downtime with both{' '}
              <SpellLink spell={SPELLS.STORMSTRIKE} /> and{' '}
              <SpellLink spell={TALENTS.LAVA_LASH_TALENT} /> on cooldown, the chart below may help
              you determine if you're using your <SpellLink spell={SPELLS.MAELSTROM_WEAPON_BUFF} />{' '}
              stacks efficiently.
            </strong>
          </HelperText>
          <CastDetail title="Maelstrom Spender Casts" casts={this.buildCastEntries()} />
        </div>
      </GuideSection>
    );
  }
}

const HelperText = cssComponent("small", styles.HelperText, [] as const);

export default ElementalTempo;
