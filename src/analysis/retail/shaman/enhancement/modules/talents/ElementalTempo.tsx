import type { CSSProperties, JSX } from 'react';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { CastEvent } from 'parser/core/Events';
import Abilities from 'parser/core/modules/Abilities';
import SpellUsable from 'analysis/retail/shaman/enhancement/modules/core/SpellUsable';
import TALENTS from 'common/TALENTS/shaman';
import SPELLS from 'common/SPELLS';
import RESOURCE_TYPES, { getResourceCost } from 'game/RESOURCE_TYPES';
import { SpellLink, Tooltip } from 'interface';
import GuideSection from 'interface/guide/components/GuideSection';
import CastOverview from 'interface/guide/components/CastOverview';
import { formatDurationMillisMinSec, formatPercentage } from 'common/format';
import { QualitativePerformance } from 'parser/ui/QualitativePerformance';
import { MAELSTROM_WEAPON_ELIGIBLE_SPELLS } from '../../constants';
import { qualitativePerformanceToColor } from 'interface/guide';
import styles from './ElementalTempo.module.scss';

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
  analysisSkipped: boolean;
  stormstrike: ElementalTempCast;
  lavaLash: ElementalTempCast;
  wastedPercent: number;
  performance: QualitativePerformance;
};

type TimelineRectStyle = CSSProperties & {
  '--timeline-rect-color': string;
  '--timeline-rect-hover-color': string;
};

const buildTimelineRectStyle = (color: string): TimelineRectStyle => ({
  '--timeline-rect-color': `${color}88`,
  '--timeline-rect-hover-color': `${color}cc`,
  borderColor: color,
});

class ElementalTempo extends Analyzer.withDependencies({
  spellUsable: SpellUsable,
  abilities: Abilities,
}) {
  protected spellUsable!: SpellUsable;
  protected abilities!: Abilities;

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
  }

  /**
   * SpellUsable tracks cooldowns in wall-clock time, but its time-based cooldown reduction API
   * expects *unscaled* milliseconds (i.e. scaled by the spell's current cooldown recovery rate / modRate).
   *
   * Elemental Tempo's tooltip is expressed in wall-clock seconds (e.g. 8 stacks => 2.4s),
   * so we convert wall-clock reductions to unscaled before applying them, then convert the
   * effective reduction back to wall-clock for waste calculations.
   */
  private getSpellModRate(spellId: number): number {
    const ability = this.deps.abilities.getAbility(spellId);
    const canonicalId = ability ? ability.primarySpell : spellId;

    const unscaledCooldown = this.deps.abilities.getExpectedCooldownDuration(canonicalId);
    const scaledCooldown = this.deps.spellUsable.fullCooldownDuration(canonicalId);

    if (!unscaledCooldown || !scaledCooldown) {
      return 1;
    }

    return unscaledCooldown / scaledCooldown;
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

  private onMaelstromSpenderCast(event: CastEvent) {
    const stacksSpent = getResourceCost(event.resourceCost, RESOURCE_TYPES.MAELSTROM_WEAPON.id);
    if (!stacksSpent || stacksSpent <= 0) {
      return;
    }

    // Elemental Tempo: 300ms per MSW stack, expressed in wall-clock time.
    const cooldownReduction = stacksSpent * CDR_MS_PER_STACK;

    const hasThorims = this.selectedCombatant.hasTalent(TALENTS.THORIMS_INVOCATION_TALENT);
    const isInDoomWinds = this.selectedCombatant.hasBuff(SPELLS.DOOM_WINDS_BUFF, event.timestamp);
    const isAscendanceActive = this.selectedCombatant.hasBuff(
      TALENTS.ASCENDANCE_ENHANCEMENT_TALENT.id,
      event.timestamp,
    );
    const skipPerformanceAnalysis = hasThorims && (isInDoomWinds || isAscendanceActive);

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

    // SpellUsable.reduceCooldown expects unscaled ms (i.e., scaled by modRate), so convert
    // the wall-clock reduction we want into unscaled ms before applying.
    const lavaLash = this.calculateCdrWasteForSpell(TALENTS.LAVA_LASH_TALENT.id, cooldownReduction);

    const totalPotentialMs = cooldownReduction * 2;
    const totalWastedMs = stormstrike.wastedMs + lavaLash.wastedMs;
    const wastedPercent = totalPotentialMs > 0 ? totalWastedMs / totalPotentialMs : 0;

    const stormstrikeOnCd = this.deps.spellUsable.isOnCooldown(SPELLS.STORMSTRIKE.id);
    const lavaLashOnCd = this.deps.spellUsable.isOnCooldown(TALENTS.LAVA_LASH_TALENT.id);

    let performance = QualitativePerformance.Fail;
    if (skipPerformanceAnalysis) {
      performance = QualitativePerformance.Perfect;
    } else {
      if (!stormstrikeOnCd && !lavaLashOnCd) {
        performance = QualitativePerformance.Fail;
      } else if (totalWastedMs === 0) {
        performance = QualitativePerformance.Perfect;
      } else if (wastedPercent < 0.25) {
        performance = QualitativePerformance.Good;
      } else if (wastedPercent < 0.5) {
        performance = QualitativePerformance.Ok;
      }
    }

    const breakdown: CastCdrBreakdown = {
      timestamp: event.timestamp,
      spenderSpellId: event.ability.guid,
      stacksSpent,
      isAscendanceActive,
      analysisSkipped: skipPerformanceAnalysis,
      stormstrike: stormstrike,
      lavaLash: lavaLash,
      wastedPercent,
      performance,
    };

    this.casts.push({
      ...breakdown,
      stormstrike: {
        ...breakdown.stormstrike,
        totalMs: Math.min(breakdown.stormstrike.totalMs, stormstrikeRemainingBefore),
      },
      lavaLash: {
        ...breakdown.lavaLash,
        totalMs: Math.min(breakdown.lavaLash.totalMs, lavaLashRemainingBefore),
      },
    });
  }

  private renderCastTooltip(cast: CastCdrBreakdown): JSX.Element {
    const stormstrikeLabel = cast.isAscendanceActive ? SPELLS.WINDSTRIKE_CAST : SPELLS.STORMSTRIKE;

    if (cast.analysisSkipped) {
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
            Waste scoring skipped because <SpellLink spell={TALENTS.THORIMS_INVOCATION_TALENT} />{' '}
            consumed the spender during <SpellLink spell={TALENTS.DOOM_WINDS_TALENT} /> or{' '}
            <SpellLink spell={TALENTS.ASCENDANCE_ENHANCEMENT_TALENT} />.
          </div>
        </>
      );
    }

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

  private buildCastEntries() {
    return this.casts.map((cast) => ({
      performance: cast.performance,
      tooltip: this.renderCastTooltip(cast),
    }));
  }

  private buildOverviewStats() {
    const analyzedCasts = this.casts.filter((cast) => !cast.analysisSkipped);
    const totalStacksSpent = this.casts.reduce((total, cast) => total + cast.stacksSpent, 0);
    const totalPotentialMs = analyzedCasts.reduce(
      (total, cast) => total + cast.stormstrike.totalMs + cast.lavaLash.totalMs,
      0,
    );
    const totalWastedMs = analyzedCasts.reduce(
      (total, cast) => total + cast.stormstrike.wastedMs + cast.lavaLash.wastedMs,
      0,
    );
    const perfectCasts = this.casts.filter(
      (cast) => cast.performance === QualitativePerformance.Perfect,
    ).length;

    return [
      {
        value: `${this.casts.length}`,
        label: 'Total Spenders',
        tooltip: <>Total Maelstrom Weapon spender casts evaluated for Elemental Tempo.</>,
      },
      {
        value: this.casts.length > 0 ? (totalStacksSpent / this.casts.length).toFixed(1) : '0.0',
        label: 'Avg Stacks Spent',
        tooltip: <>Average number of Maelstrom Weapon stacks consumed per tracked spender cast.</>,
      },
      {
        value: `${formatPercentage(totalPotentialMs > 0 ? totalWastedMs / totalPotentialMs : 0, 1)}%`,
        label: 'Avg Waste',
        tooltip: (
          <>Weighted average percentage of Elemental Tempo cooldown reduction that was wasted.</>
        ),
      },
      {
        value: `${perfectCasts}`,
        label: 'Perfect Casts',
        tooltip: <>Number of spender casts that wasted no Elemental Tempo cooldown reduction.</>,
        performance: QualitativePerformance.Perfect,
      },
    ];
  }

  get guideSubsection(): JSX.Element | null {
    if (!this.active) {
      return null;
    }

    const explanation = (
      <p>
        <SpellLink spell={TALENTS.ELEMENTAL_TEMPO_TALENT} /> reduces the cooldown of{' '}
        <SpellLink spell={SPELLS.STORMSTRIKE} /> (or <SpellLink spell={SPELLS.WINDSTRIKE_CAST} />{' '}
        during <SpellLink spell={TALENTS.ASCENDANCE_ENHANCEMENT_TALENT} />) and{' '}
        <SpellLink spell={TALENTS.LAVA_LASH_TALENT} /> whenever you consume{' '}
        <SpellLink spell={SPELLS.MAELSTROM_WEAPON_BUFF} /> stacks. The boxes below score each
        spender cast by how much cooldown reduction was wasted.
      </p>
    );

    return (
      <GuideSection spell={TALENTS.ELEMENTAL_TEMPO_TALENT} explanation={explanation}>
        <CastOverview spell={TALENTS.ELEMENTAL_TEMPO_TALENT} stats={this.buildOverviewStats()} />
        <div>
          <small className={styles.helperText}>
            Each box represents one Maelstrom spender cast. Hover a box to inspect how much cooldown
            reduction was wasted on <SpellLink spell={SPELLS.STORMSTRIKE} /> or{' '}
            <SpellLink spell={TALENTS.LAVA_LASH_TALENT} />.
          </small>
          <div className={styles.breakdownContainer}>
            <strong>All Maelstrom spender casts</strong>
            <div className={styles.timelineRow}>
              <div className={styles.timelineRectContainer}>
                {this.buildCastEntries().map((cast, index) => (
                  <Tooltip key={index} content={cast.tooltip}>
                    <div
                      className={styles.timelineRect}
                      style={buildTimelineRectStyle(
                        qualitativePerformanceToColor(cast.performance),
                      )}
                    />
                  </Tooltip>
                ))}
              </div>
            </div>
          </div>
        </div>
      </GuideSection>
    );
  }
}

export default ElementalTempo;
