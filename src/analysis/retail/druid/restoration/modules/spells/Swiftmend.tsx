import SPELLS from 'common/SPELLS';
import type Spell from 'common/SPELLS/Spell';
import { SpellLink } from 'interface';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, {
  CastEvent,
  HealEvent,
  RefreshBuffEvent,
  RemoveBuffEvent,
} from 'parser/core/Events';
import Combatants from 'parser/shared/modules/Combatants';
import Haste from 'parser/shared/modules/Haste';
import { qualitativePerformanceToColor } from 'interface/guide';
import { QualitativePerformance } from 'parser/ui/QualitativePerformance';

import {
  getDirectHeal,
  isFromHardcast,
} from 'analysis/retail/druid/restoration/normalizers/CastLinkNormalizer';
import { getRemovedHot } from 'analysis/retail/druid/restoration/normalizers/SwiftmendNormalizer';
import { getSotfBuffs } from 'analysis/retail/druid/restoration/normalizers/SoulOfTheForestLinkNormalizer';
import HotTrackerRestoDruid from 'analysis/retail/druid/restoration/modules/core/hottracking/HotTrackerRestoDruid';
import Lifebloom from 'analysis/retail/druid/restoration/modules/spells/Lifebloom';
import { TALENTS_DRUID } from 'common/TALENTS';
import { explanationAndDataSubsection } from 'interface/guide/components/ExplanationRow';
import { RoundedPanel } from 'interface/guide/components/GuideDivs';
import CastDetail, { type PerCastData } from 'interface/guide/components/CastDetail';
import { SpellSequence, type CastInSequence } from 'interface/guide/components/CastSequence';
import { GUIDE_CORE_EXPLANATION_PERCENT } from '../../Guide';
import { calculateHealTargetHealthPercent } from 'parser/core/EventCalculateLib';
import { Fragment, type JSX, type ReactNode } from 'react';
import { formatNumber, formatPercentage } from 'common/format';
import { abilityToSpell } from 'common/abilityToSpell';
import CastEfficiencyBar from 'parser/ui/CastEfficiencyBar';
import { GapHighlight } from 'parser/ui/CooldownBar';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import ItemPercentHealingDone from 'parser/ui/ItemPercentHealingDone';

/** With Implant, only emergency (life-saving) casts off the Lifebloom target are acceptable */
const IMPLANT_TRIAGE_THRESHOLD = 0.3;
/** Without Implant, Swiftmend is a strong spot heal — triage threshold is more generous */
const CONSUME_TRIAGE_THRESHOLD = 0.5;
/** Duration threshold below which consuming a Rejuvenation or Regrowth is considered good */
const LOW_HOT_THRESHOLD_MS = 6000;
/** Swiftmend healing increased by this fraction of the consumed HoT's remaining healing */
const CONSUMED_HOT_BONUS_MULTIPLIER = 0.4;

const SWIFTMENDABLE_HOTS = [
  SPELLS.REGROWTH,
  SPELLS.WILD_GROWTH,
  SPELLS.REJUVENATION,
  SPELLS.REJUVENATION_GERMINATION,
];

type SotfOutcome = 'rejuv' | 'regrowth' | 'expired' | 'overwritten' | 'unused';

interface SwiftmendCastRecord {
  timestamp: number;
  targetName: string;
  targetHealthPercent?: number;
  onLifebloomTarget: boolean;
  wasTriage: boolean;
  /** HoT removed by this cast; null when Verdant Infusion (or unknown/none) */
  consumedSpell: Spell | null;
  consumedRemainingMs?: number;
  /** Performance from Swiftmend targeting / consume rules only */
  smPerformance: QualitativePerformance;
  /** Set when SotF is talented; resolved when the proc is spent or wasted */
  sotfOutcome: SotfOutcome | null;
}

/**
 * Tracks Swiftmend cast quality and (when talented) the linked Soul of the Forest spend.
 */
class Swiftmend extends Analyzer {
  static dependencies = {
    hotTracker: HotTrackerRestoDruid,
    combatants: Combatants,
    haste: Haste,
    lifebloom: Lifebloom,
  };

  hotTracker!: HotTrackerRestoDruid;
  combatants!: Combatants;
  haste!: Haste;
  lifebloom!: Lifebloom;

  hardcastSwiftmendHealing = 0;
  hardcastSwiftmendOverhealing = 0;
  consumedHotBonusHealing = 0;
  private lastHotTickAmount: Map<string, number> = new Map();

  hasVi: boolean;
  hasImplant: boolean;
  hasProsperity: boolean;
  hasSotf: boolean;
  hasGroveGuardians: boolean;
  hasEverbloomR3: boolean;
  hasAbundance: boolean;
  /** Per-cast breakdown (hidden only for VI without Implant and without SotF) */
  trackCastAnalysis: boolean;

  casts: SwiftmendCastRecord[] = [];
  /** Indices of Swiftmend casts whose SotF proc is not yet resolved (oldest first) */
  private pendingSotfCastIndices: number[] = [];

  constructor(options: Options) {
    super(options);

    this.hasVi = this.selectedCombatant.hasTalent(TALENTS_DRUID.VERDANT_INFUSION_TALENT);
    this.hasImplant = this.selectedCombatant.hasTalent(TALENTS_DRUID.IMPLANT_TALENT);
    this.hasProsperity = this.selectedCombatant.hasTalent(TALENTS_DRUID.PROSPERITY_TALENT);
    this.hasSotf = this.selectedCombatant.hasTalent(
      TALENTS_DRUID.SOUL_OF_THE_FOREST_RESTORATION_TALENT,
    );
    this.hasGroveGuardians = this.selectedCombatant.hasTalent(TALENTS_DRUID.GROVE_GUARDIANS_TALENT);
    this.hasEverbloomR3 = this.selectedCombatant.hasTalent(
      TALENTS_DRUID.EVERBLOOM_3_RESTORATION_TALENT,
    );
    this.hasAbundance = this.selectedCombatant.hasTalent(TALENTS_DRUID.ABUNDANCE_TALENT);
    // VI without Implant: hide cast analysis unless SotF needs waste tracking
    this.trackCastAnalysis = this.hasImplant || !this.hasVi || this.hasSotf;

    this.addEventListener(
      Events.cast.by(SELECTED_PLAYER).spell(SPELLS.SWIFTMEND),
      this.onSwiftmendCast,
    );
    this.addEventListener(
      Events.heal.by(SELECTED_PLAYER).spell(SPELLS.SWIFTMEND),
      this.onSwiftmendHeal,
    );
    this.addEventListener(Events.fightend, this.onFightEnd);

    if (!this.hasVi) {
      this.addEventListener(
        Events.heal.by(SELECTED_PLAYER).spell(SWIFTMENDABLE_HOTS),
        this.onConsumableHotHeal,
      );
    }

    if (this.hasSotf) {
      this.addEventListener(
        Events.removebuff.by(SELECTED_PLAYER).spell(SPELLS.SOUL_OF_THE_FOREST_BUFF),
        this.onSotfRemove,
      );
      this.addEventListener(
        Events.refreshbuff.by(SELECTED_PLAYER).spell(SPELLS.SOUL_OF_THE_FOREST_BUFF),
        this.onSotfRefresh,
      );
    }
  }

  onConsumableHotHeal(event: HealEvent) {
    if (!event.tick) {
      return;
    }
    const raw = event.amount + (event.absorbed || 0) + (event.overheal || 0);
    this.lastHotTickAmount.set(`${event.targetID}-${event.ability.guid}`, raw);
  }

  onSwiftmendHeal(event: HealEvent) {
    if (isFromHardcast(event)) {
      this.hardcastSwiftmendHealing += event.amount + (event.absorbed || 0);
      this.hardcastSwiftmendOverhealing += event.overheal || 0;
    }
  }

  onSwiftmendCast(event: CastEvent) {
    const directHeal = getDirectHeal(event);
    const targetHealthPercent = directHeal
      ? calculateHealTargetHealthPercent(directHeal, true)
      : undefined;
    const target = this.combatants.getEntity(event);
    if (!target) {
      console.warn("Couldn't find target for Swiftmend cast", event);
      return;
    }

    const removedHotHeal = this.hasVi ? undefined : getRemovedHot(event);
    const removedSpellId = removedHotHeal?.ability.guid;

    if (!this.hasVi && directHeal) {
      const estimatedBonus = this.estimateConsumedHotBonus(event, target.id, removedSpellId);
      const effectiveHeal = directHeal.amount + (directHeal.absorbed || 0);
      this.consumedHotBonusHealing += Math.min(estimatedBonus, effectiveHeal);
    }

    if (!this.trackCastAnalysis) {
      return;
    }

    const triageThreshold = this.hasImplant ? IMPLANT_TRIAGE_THRESHOLD : CONSUME_TRIAGE_THRESHOLD;
    const wasTriage = targetHealthPercent !== undefined && targetHealthPercent <= triageThreshold;
    const onLifebloomTarget = target.id === this.lifebloom.activeLifebloomTarget;

    let consumedSpell: Spell | null = null;
    let consumedRemainingMs: number | undefined;
    if (this.hasVi) {
      consumedSpell = null;
    } else if (removedHotHeal) {
      consumedSpell = abilityToSpell(removedHotHeal.ability);
      const hotOnTarget = this.hotTracker.hots[target.id]?.[removedSpellId!];
      if (hotOnTarget) {
        consumedRemainingMs = hotOnTarget.end - event.timestamp;
      }
    }

    const smPerformance = this.hasImplant
      ? this.scoreImplantCast(onLifebloomTarget, wasTriage)
      : this.hasVi
        ? QualitativePerformance.Good
        : this.scoreConsumeCast(removedSpellId, consumedRemainingMs, wasTriage);

    const castIndex = this.casts.length;
    this.casts.push({
      timestamp: event.timestamp,
      targetName: target.name,
      targetHealthPercent,
      onLifebloomTarget,
      wasTriage,
      consumedSpell,
      consumedRemainingMs,
      smPerformance,
      sotfOutcome: null,
    });

    if (this.hasSotf) {
      // Queue this cast; overwrite resolves the oldest pending first (see onSotfRefresh)
      this.pendingSotfCastIndices.push(castIndex);
    }
  }

  private scoreImplantCast(onLifebloomTarget: boolean, wasTriage: boolean): QualitativePerformance {
    if (onLifebloomTarget || wasTriage) {
      return QualitativePerformance.Good;
    }
    return QualitativePerformance.Fail;
  }

  /**
   * Consume path: score by what was removed.
   * Desired priority: Wild Growth > low-duration HoT > any Regrowth > any Rejuvenation.
   * Game remove order is Regrowth > Wild Growth > Rejuvenation.
   */
  private scoreConsumeCast(
    removedSpellId: number | undefined,
    remainingMs: number | undefined,
    wasTriage: boolean,
  ): QualitativePerformance {
    if (wasTriage) {
      return QualitativePerformance.Good;
    }
    if (removedSpellId === SPELLS.WILD_GROWTH.id) {
      return QualitativePerformance.Good;
    }
    if (
      removedSpellId === SPELLS.REJUVENATION.id ||
      removedSpellId === SPELLS.REJUVENATION_GERMINATION.id ||
      removedSpellId === SPELLS.REGROWTH.id
    ) {
      const isLowDuration = (remainingMs ?? 0) < LOW_HOT_THRESHOLD_MS;
      if (isLowDuration) {
        return QualitativePerformance.Good;
      }
      if (removedSpellId === SPELLS.REGROWTH.id) {
        return QualitativePerformance.Ok;
      }
      return QualitativePerformance.Fail;
    }
    return QualitativePerformance.Ok;
  }

  private onSotfRefresh(_event: RefreshBuffEvent) {
    // A new Swiftmend overwrote an existing SotF — fail the oldest pending cast
    this.resolveOldestPendingSotf('overwritten');
  }

  private onSotfRemove(event: RemoveBuffEvent) {
    const buffed = getSotfBuffs(event);
    if (buffed.length === 0) {
      this.resolveOldestPendingSotf('expired');
      return;
    }

    const guid = buffed[0].ability.guid;
    if (guid === SPELLS.REGROWTH.id) {
      this.resolveOldestPendingSotf('regrowth');
    } else if (guid === SPELLS.REJUVENATION.id || guid === SPELLS.REJUVENATION_GERMINATION.id) {
      this.resolveOldestPendingSotf('rejuv');
    } else {
      this.resolveOldestPendingSotf('expired');
    }
  }

  private onFightEnd() {
    while (this.pendingSotfCastIndices.length > 0) {
      this.resolveOldestPendingSotf('unused');
    }
  }

  private resolveOldestPendingSotf(outcome: SotfOutcome) {
    const index = this.pendingSotfCastIndices.shift();
    if (index === undefined) {
      return;
    }
    const cast = this.casts[index];
    if (cast && cast.sotfOutcome === null) {
      cast.sotfOutcome = outcome;
    }
  }

  private finalPerformance(cast: SwiftmendCastRecord): QualitativePerformance {
    if (
      this.hasSotf &&
      (cast.sotfOutcome === 'expired' ||
        cast.sotfOutcome === 'overwritten' ||
        cast.sotfOutcome === 'unused' ||
        cast.sotfOutcome === null)
    ) {
      return QualitativePerformance.Fail;
    }
    return cast.smPerformance;
  }

  private estimateConsumedHotBonus(
    event: CastEvent,
    targetId: number,
    removedSpellId: number | undefined,
  ): number {
    if (removedSpellId === undefined) {
      return 0;
    }

    const hot = this.hotTracker.hots[targetId]?.[removedSpellId];
    const lastTick = this.lastHotTickAmount.get(`${targetId}-${removedSpellId}`);
    const hotInfo = this.hotTracker.hotInfo[removedSpellId];
    if (!hot || !lastTick || !hotInfo) {
      return 0;
    }

    const remainingMs = Math.max(0, hot.end - event.timestamp);
    const baseTickPeriod = hotInfo.tickPeriod;
    const tickPeriod = hotInfo.noHaste ? baseTickPeriod : baseTickPeriod / (1 + this.haste.current);
    if (tickPeriod <= 0) {
      return 0;
    }

    const estimatedRemainingHealing = (remainingMs / tickPeriod) * lastTick;
    return estimatedRemainingHealing * CONSUMED_HOT_BONUS_MULTIPLIER;
  }

  private spellToSequenceCast(
    spell: Spell,
    timestamp: number,
    performance: QualitativePerformance | undefined,
    tooltip: ReactNode,
  ): CastInSequence {
    return {
      timestamp,
      spellId: spell.id,
      spellName: spell.name,
      icon: spell.icon,
      performance,
      outlineColor: performance ? qualitativePerformanceToColor(performance) : undefined,
      ghosted: performance === undefined,
      tooltip,
    };
  }

  private buildSequence(cast: SwiftmendCastRecord): CastInSequence[] {
    const overall = this.finalPerformance(cast);
    const sequence: CastInSequence[] = [
      this.spellToSequenceCast(
        SPELLS.SWIFTMEND,
        cast.timestamp,
        overall,
        <>
          <SpellLink spell={SPELLS.SWIFTMEND} /> on <strong>{cast.targetName}</strong>
          {cast.targetHealthPercent !== undefined && (
            <> ({formatPercentage(cast.targetHealthPercent, 0)}% HP)</>
          )}
        </>,
      ),
    ];

    if (!this.hasVi) {
      if (cast.consumedSpell) {
        const remainingText =
          cast.consumedRemainingMs !== undefined
            ? ` (${(cast.consumedRemainingMs / 1000).toFixed(1)}s left)`
            : '';
        sequence.push(
          this.spellToSequenceCast(
            cast.consumedSpell,
            cast.timestamp + 1,
            cast.smPerformance,
            <>
              Consumed <SpellLink spell={cast.consumedSpell} />
              {remainingText}
            </>,
          ),
        );
      }
    }

    if (this.hasSotf) {
      const sotfSpell = this.sotfOutcomeSpell(cast.sotfOutcome);
      const sotfPerf = this.sotfOutcomePerformance(cast.sotfOutcome);
      sequence.push(
        this.spellToSequenceCast(
          sotfSpell,
          cast.timestamp + 2,
          sotfPerf,
          this.sotfOutcomeTooltip(cast.sotfOutcome),
        ),
      );
    }

    return sequence;
  }

  private sotfOutcomeSpell(outcome: SotfOutcome | null): Spell {
    switch (outcome) {
      case 'rejuv':
        return SPELLS.REJUVENATION;
      case 'regrowth':
        return SPELLS.REGROWTH;
      case 'overwritten':
      case 'expired':
      case 'unused':
      case null:
      default:
        return SPELLS.SOUL_OF_THE_FOREST_BUFF;
    }
  }

  private sotfOutcomePerformance(outcome: SotfOutcome | null): QualitativePerformance {
    if (outcome === 'rejuv' || outcome === 'regrowth') {
      return QualitativePerformance.Good;
    }
    return QualitativePerformance.Fail;
  }

  private sotfOutcomeTooltip(outcome: SotfOutcome | null): ReactNode {
    switch (outcome) {
      case 'rejuv':
        return (
          <>
            <SpellLink spell={TALENTS_DRUID.SOUL_OF_THE_FOREST_RESTORATION_TALENT} /> buffed{' '}
            <SpellLink spell={SPELLS.REJUVENATION} />
          </>
        );
      case 'regrowth':
        return (
          <>
            <SpellLink spell={TALENTS_DRUID.SOUL_OF_THE_FOREST_RESTORATION_TALENT} /> buffed{' '}
            <SpellLink spell={SPELLS.REGROWTH} />
          </>
        );
      case 'overwritten':
        return (
          <>
            <SpellLink spell={TALENTS_DRUID.SOUL_OF_THE_FOREST_RESTORATION_TALENT} /> overwritten
          </>
        );
      case 'expired':
        return (
          <>
            <SpellLink spell={TALENTS_DRUID.SOUL_OF_THE_FOREST_RESTORATION_TALENT} /> expired
          </>
        );
      case 'unused':
        return (
          <>
            <SpellLink spell={TALENTS_DRUID.SOUL_OF_THE_FOREST_RESTORATION_TALENT} /> unused at
            fight end
          </>
        );
      default:
        return (
          <>
            <SpellLink spell={TALENTS_DRUID.SOUL_OF_THE_FOREST_RESTORATION_TALENT} /> unresolved
          </>
        );
    }
  }

  private buildCastDetails(): PerCastData[] {
    return this.casts.map((cast) => {
      const performance = this.finalPerformance(cast);
      return {
        performance,
        timestamp: this.owner.formatTimestamp(cast.timestamp),
        stats: [],
        tooltip: this.castSummary(cast),
        additionalContent: {
          content: <SpellSequence casts={this.buildSequence(cast)} iconSize={34} />,
        },
        details: this.castSummary(cast),
      };
    });
  }

  private castSummary(cast: SwiftmendCastRecord): JSX.Element {
    const parts: ReactNode[] = [];

    if (this.hasImplant) {
      if (cast.onLifebloomTarget) {
        parts.push(
          <>
            on <SpellLink spell={SPELLS.LIFEBLOOM_HOT_HEAL} /> target
          </>,
        );
      } else if (cast.wasTriage) {
        parts.push(<>triage cast</>);
      } else {
        parts.push(
          <>
            not on <SpellLink spell={SPELLS.LIFEBLOOM_HOT_HEAL} /> target
          </>,
        );
      }
    } else if (!this.hasVi) {
      if (cast.wasTriage) {
        parts.push(<>triage cast</>);
      } else if (cast.consumedSpell) {
        const remaining =
          cast.consumedRemainingMs !== undefined
            ? ` (${(cast.consumedRemainingMs / 1000).toFixed(1)}s)`
            : '';
        parts.push(
          <>
            consumed <SpellLink spell={cast.consumedSpell} />
            {remaining}
          </>,
        );
      } else {
        parts.push(<>consumed unknown HoT</>);
      }
    }

    if (this.hasSotf) {
      parts.push(this.sotfOutcomeTooltip(cast.sotfOutcome));
    }

    return (
      <>
        {this.finalPerformance(cast)}:{' '}
        {parts.map((part, i) => (
          <Fragment key={i}>
            {i > 0 && <> · </>}
            {part}
          </Fragment>
        ))}
      </>
    );
  }

  private get cooldownReasonSpells() {
    const spells = [];
    if (this.hasSotf) {
      spells.push(TALENTS_DRUID.SOUL_OF_THE_FOREST_RESTORATION_TALENT);
    }
    if (this.hasGroveGuardians) {
      spells.push(TALENTS_DRUID.GROVE_GUARDIANS_TALENT);
    }
    if (this.hasEverbloomR3) {
      spells.push(TALENTS_DRUID.EVERBLOOM_3_RESTORATION_TALENT);
    }
    return spells;
  }

  private perfBadge(perf: QualitativePerformance): JSX.Element {
    return (
      <span>
        (<span style={{ color: qualitativePerformanceToColor(perf) }}>{perf}</span>)
      </span>
    );
  }

  private get possiblePerformances(): QualitativePerformance[] {
    // Consume path can score Ok (full-duration Regrowth). Implant / VI paths cannot.
    if (!this.hasImplant && !this.hasVi) {
      return [QualitativePerformance.Good, QualitativePerformance.Ok, QualitativePerformance.Fail];
    }
    return [QualitativePerformance.Good, QualitativePerformance.Fail];
  }

  get guideSubsection(): JSX.Element {
    const explanation = this.buildExplanation();

    const showEfficiency =
      this.hasImplant ||
      this.hasVi ||
      this.hasProsperity ||
      this.hasSotf ||
      this.cooldownReasonSpells.length > 0;

    const data = (
      <RoundedPanel>
        {showEfficiency && (
          <>
            <strong>
              <SpellLink spell={SPELLS.SWIFTMEND} /> cast efficiency
            </strong>
            <CastEfficiencyBar
              spell={SPELLS.SWIFTMEND}
              gapHighlightMode={GapHighlight.FullCooldown}
              minimizeIcons
              useThresholds
            />
          </>
        )}
        {this.trackCastAnalysis && this.casts.length > 0 && (
          <div style={{ minWidth: 0, overflow: 'hidden' }}>
            <CastDetail
              title="Swiftmend Casts"
              casts={this.buildCastDetails()}
              possiblePerformances={this.possiblePerformances}
            />
          </div>
        )}
      </RoundedPanel>
    );

    return explanationAndDataSubsection(explanation, data, GUIDE_CORE_EXPLANATION_PERCENT);
  }

  private buildExplanation(): JSX.Element {
    const cooldownSpells = this.cooldownReasonSpells;

    return (
      <>
        <p>
          <b>
            <SpellLink spell={SPELLS.SWIFTMEND} />
          </b>{' '}
          is one of your highest priority spells. Cast it on yourself as close to on cooldown as
          possible
          {cooldownSpells.length > 0 ? (
            <>
              . It{' '}
              {cooldownSpells.map((spell, index) => (
                <Fragment key={spell.id}>
                  {index > 0 &&
                    (index === cooldownSpells.length - 1
                      ? cooldownSpells.length === 2
                        ? ' and '
                        : ', and '
                      : ', ')}
                  {this.cooldownSpellVerb(spell)} <SpellLink spell={spell} />
                </Fragment>
              ))}
              .
            </>
          ) : (
            <>.</>
          )}
        </p>
        {this.renderTargetingGuidance()}
        {this.renderSotfGuidance()}
      </>
    );
  }

  /** Short verb phrase for listing cooldown-tied effects in the opener */
  private cooldownSpellVerb(spell: { id: number }): string {
    if (spell.id === TALENTS_DRUID.SOUL_OF_THE_FOREST_RESTORATION_TALENT.id) {
      return 'gives you';
    }
    if (spell.id === TALENTS_DRUID.GROVE_GUARDIANS_TALENT.id) {
      return 'summons';
    }
    if (spell.id === TALENTS_DRUID.EVERBLOOM_3_RESTORATION_TALENT.id) {
      return 'causes 3 Lifebloom blooms via';
    }
    return 'empowers';
  }

  private renderTargetingGuidance(): JSX.Element | null {
    if (this.hasImplant) {
      return (
        <p>
          If you&apos;re playing <SpellLink spell={TALENTS_DRUID.IMPLANT_TALENT} />, almost every
          Swiftmend should go onto your <SpellLink spell={SPELLS.LIFEBLOOM_HOT_HEAL} /> target
          (usually yourself). This grows a <SpellLink spell={SPELLS.SYMBIOTIC_BLOOMS_WILDSTALKER} />
          , which increases healing received, and therefore Everbloom's splash healing. The only
          exception is emergency triage to save a player who would die otherwise.
        </p>
      );
    }

    if (this.hasVi) {
      return (
        <p>
          With <SpellLink spell={TALENTS_DRUID.VERDANT_INFUSION_TALENT} />, Swiftmend does not
          consume a HoT, so you do not need to worry about which HoT is on the target.
        </p>
      );
    }

    // Consume path (Prosperity / no VI)
    return (
      <>
        <p>
          Swiftmend removes a HoT on the target. The direct heal gains a portion of that HoT&apos;s
          remaining healing, but losing the HoT still costs throughput, so choose consumes
          carefully. The game removes HoTs in the order Regrowth, Wild Growth, then Rejuvenation.
          Try to consume in this priority instead:
        </p>
        <ul style={{ marginBottom: '1em' }}>
          <li>
            <SpellLink spell={SPELLS.WILD_GROWTH} /> or a low duration HoT (&lt;
            {LOW_HOT_THRESHOLD_MS / 1000}s) {this.perfBadge(QualitativePerformance.Good)}
          </li>
          <li>
            Full duration <SpellLink spell={SPELLS.REGROWTH} />{' '}
            {this.perfBadge(QualitativePerformance.Ok)}
          </li>
          <li>
            Full duration <SpellLink spell={SPELLS.REJUVENATION} />{' '}
            {this.perfBadge(QualitativePerformance.Fail)}
          </li>
        </ul>
        <p>
          Using it as a triage heal (≤{CONSUME_TRIAGE_THRESHOLD * 100}% HP) is always fine,
          regardless of what gets consumed.
        </p>
      </>
    );
  }

  private renderSotfGuidance(): JSX.Element | null {
    if (!this.hasSotf) {
      return null;
    }
    return (
      <p>
        Every Swiftmend also grants{' '}
        <SpellLink spell={TALENTS_DRUID.SOUL_OF_THE_FOREST_RESTORATION_TALENT} />. Make sure you
        spend the proc before your next Swiftmend. <SpellLink spell={SPELLS.REJUVENATION} /> is the
        default spender
        {this.hasAbundance ? (
          <>
            , and the cheapest way to keep <SpellLink spell={TALENTS_DRUID.ABUNDANCE_TALENT} />{' '}
            active
          </>
        ) : null}
        . <SpellLink spell={SPELLS.REGROWTH} /> is also a fine choice if the healing is needed and
        mana allows.
      </p>
    );
  }

  statistic() {
    if (this.hasVi || this.consumedHotBonusHealing <= 0) {
      return null;
    }

    return (
      <Statistic
        size="flexible"
        position={STATISTIC_ORDER.CORE(15)}
        tooltip={
          <>
            Estimated healing from Swiftmend's bonus of{' '}
            {(CONSUMED_HOT_BONUS_MULTIPLIER * 100).toFixed(0)}% of the consumed HoT's remaining
            healing. Remaining HoT healing is estimated from duration left × recent tick size.
            <br />
            <br />
            Estimated bonus: <strong>{formatNumber(this.consumedHotBonusHealing)}</strong>
          </>
        }
      >
        <BoringSpellValueText spell={SPELLS.SWIFTMEND}>
          <ItemPercentHealingDone amount={this.consumedHotBonusHealing} />
          <br />
          <small>from consumed HoT bonus</small>
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default Swiftmend;
