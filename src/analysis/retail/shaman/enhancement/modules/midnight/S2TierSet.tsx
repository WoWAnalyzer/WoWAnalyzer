import { type JSX } from 'react';
import { formatNumber } from 'common/format';
import SPELLS from 'common/SPELLS/shaman';
import TALENTS from 'common/TALENTS/shaman';
import { SHAMAN_MID2_ID } from 'common/ITEMS';
import { TIERS } from 'game/TIERS';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { CastEvent, DamageEvent, FightEndEvent } from 'parser/core/Events';
import { calculateEffectiveDamage } from 'parser/core/EventCalculateLib';
import {
  evaluateQualitativePerformanceByThreshold,
  QualitativePerformance,
} from 'parser/ui/QualitativePerformance';
import DonutChart from 'parser/ui/DonutChart';
import ItemDamageDone from 'parser/ui/ItemDamageDone';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';
import ItemSetLink from 'interface/ItemSetLink';
import SpellLink from 'interface/SpellLink';
import GuideSection from 'interface/guide/components/GuideSection';
import CastDetail, { type PerCastData } from 'interface/guide/components/CastDetail';
import SpellUsable from '../core/SpellUsable';

// Fire Nova deals +200% when it strikes a single target.
const SINGLE_TARGET_AMP = 2.0;
// Each Fire Nova trigger reduces Crash Lightning's cooldown by 2s (per trigger, not per target).
const CDR_PER_TRIGGER_MS = 2000;
// Each Fire Nova trigger increases the next Crash Lightning by 8%, stacking up to 5.
const CL_DAMAGE_PER_STACK = 0.08;
const MAX_STACKS = 5;

// A single Fire Nova hitting multiple targets logs one damage event per target at the same
// timestamp; collapse those into a single trigger.
const FIRE_NOVA_TRIGGER_BUFFER_MS = 100;

interface VoltaicBlazeRecord {
  timestamp: number;
  effectiveCDR: number;
  wastedCDR: number;
  triggers: number;
}

/**
 * Midnight Season 2 - Enhancement tier set.
 *
 * 2-piece: Voltaic Blaze causes your primary target to erupt in a Fire Nova every 2 seconds
 *          for 6 seconds. Fire Nova damage is increased by 200% if it only strikes a single target.
 * 4-piece: Fire Nova reduces the cooldown of Crash Lightning by 2 seconds and increases the damage
 *          of your next Crash Lightning by 8%, stacking up to 5 times.
 *
 * This module is the sole owner of the 4pc cooldown-reduction calculation. Both 2pc-driven and
 * Fire Nova-talent Fire Novas feed the CDR and stacks, so it listens to all Fire Nova damage and
 * debounces multi-target hits into a single trigger.
 */
class S2TierSet extends Analyzer.withDependencies({
  spellUsable: SpellUsable,
}) {
  private readonly has2Piece: boolean;
  private readonly has4Piece: boolean;

  // 2-piece
  private fireNovaDamage = 0;
  private singleTargetBonusDamage = 0;

  // 4-piece
  private effectiveCDR = 0;
  private wastedCDR = 0;
  private triggers = 0;
  private stacks = 0;
  private wastedStacks = 0;
  private pendingClStacks = 0;
  private crashLightningDamage = 0;
  private voltaicBlazeCasts: VoltaicBlazeRecord[] = [];

  // Debounce state for collapsing one Fire Nova's per-target damage events into a single trigger.
  private currentTriggerTimestamp: number | null = null;
  private currentTriggerFirstEvent: DamageEvent | null = null;
  private currentTriggerTargets = 0;

  constructor(options: Options) {
    super(options);
    this.has2Piece = this.selectedCombatant.has2PieceByTier(TIERS.MID2);
    this.has4Piece = this.selectedCombatant.has4PieceByTier(TIERS.MID2);
    this.active = this.has2Piece || this.has4Piece;
    if (!this.active) {
      return;
    }

    this.addEventListener(
      Events.damage.by(SELECTED_PLAYER).spell(SPELLS.FIRE_NOVA_DAMAGE),
      this.onFireNovaDamage,
    );
    this.addEventListener(Events.fightend, this.onFightEnd);

    if (this.has4Piece) {
      this.addEventListener(
        Events.cast.by(SELECTED_PLAYER).spell(SPELLS.VOLTAIC_BLAZE_CAST),
        this.onVoltaicBlazeCast,
      );
      this.addEventListener(
        Events.cast.by(SELECTED_PLAYER).spell(TALENTS.CRASH_LIGHTNING_TALENT),
        this.onCrashLightningCast,
      );
      this.addEventListener(
        Events.damage.by(SELECTED_PLAYER).spell(TALENTS.CRASH_LIGHTNING_TALENT),
        this.onCrashLightningDamage,
      );
    }
  }

  private onFireNovaDamage(event: DamageEvent) {
    if (event.targetIsFriendly) {
      return;
    }
    this.fireNovaDamage += event.amount + (event.absorbed || 0);

    const isNewTrigger =
      this.currentTriggerTimestamp === null ||
      event.timestamp - this.currentTriggerTimestamp > FIRE_NOVA_TRIGGER_BUFFER_MS;

    if (!isNewTrigger) {
      this.currentTriggerTargets += 1;
      return;
    }

    // A new trigger started: finalize the previous one, then apply this trigger's 4pc effects now
    // (at the correct timestamp).
    this.finalizeTrigger();
    this.currentTriggerTimestamp = event.timestamp;
    this.currentTriggerFirstEvent = event;
    this.currentTriggerTargets = 1;

    if (this.has4Piece) {
      this.onTrigger(event);
    }
  }

  /** The single-target +200% bonus is only known once all of a trigger's hits have been seen. */
  private finalizeTrigger() {
    if (
      this.has2Piece &&
      this.currentTriggerFirstEvent !== null &&
      this.currentTriggerTargets === 1
    ) {
      this.singleTargetBonusDamage += calculateEffectiveDamage(
        this.currentTriggerFirstEvent,
        SINGLE_TARGET_AMP,
      );
    }
    this.currentTriggerTimestamp = null;
    this.currentTriggerFirstEvent = null;
    this.currentTriggerTargets = 0;
  }

  private onTrigger(event: DamageEvent) {
    this.triggers += 1;

    const effective = this.deps.spellUsable.reduceCooldown(
      TALENTS.CRASH_LIGHTNING_TALENT.id,
      CDR_PER_TRIGGER_MS,
      event.timestamp,
    );
    const wasted = CDR_PER_TRIGGER_MS - effective;
    this.effectiveCDR += effective;
    this.wastedCDR += wasted;

    if (this.stacks < MAX_STACKS) {
      this.stacks += 1;
    } else {
      this.wastedStacks += 1;
    }

    const currentVB = this.voltaicBlazeCasts.at(-1);
    if (currentVB) {
      currentVB.effectiveCDR += effective;
      currentVB.wastedCDR += wasted;
      currentVB.triggers += 1;
    }
  }

  private onVoltaicBlazeCast(event: CastEvent) {
    this.voltaicBlazeCasts.push({
      timestamp: event.timestamp,
      effectiveCDR: 0,
      wastedCDR: 0,
      triggers: 0,
    });
  }

  private onCrashLightningCast() {
    this.pendingClStacks = this.stacks;
    this.stacks = 0;
  }

  private onCrashLightningDamage(event: DamageEvent) {
    if (this.pendingClStacks === 0) {
      return;
    }
    this.crashLightningDamage += calculateEffectiveDamage(
      event,
      CL_DAMAGE_PER_STACK * this.pendingClStacks,
    );
  }

  private onFightEnd(_event: FightEndEvent) {
    this.finalizeTrigger();
  }

  private get appliedStacks() {
    return Math.max(this.triggers - this.wastedStacks, 0);
  }

  statistic() {
    return (
      <Statistic
        position={STATISTIC_ORDER.OPTIONAL()}
        size="flexible"
        category={STATISTIC_CATEGORY.ITEMS}
        tooltip={
          this.has2Piece ? (
            <>
              Total <SpellLink spell={TALENTS.FIRE_NOVA_TALENT} /> damage:{' '}
              <strong>{formatNumber(this.fireNovaDamage)}</strong>
            </>
          ) : undefined
        }
      >
        <div className="pad">
          <label>
            <ItemSetLink id={SHAMAN_MID2_ID}>Midnight Season 2 Tier Set</ItemSetLink>
          </label>
          {this.has2Piece && (
            <div>
              <strong>2-piece</strong> <SpellLink spell={TALENTS.FIRE_NOVA_TALENT} /> single-target
              bonus:
              <div className="value">
                <ItemDamageDone amount={this.singleTargetBonusDamage} />
              </div>
            </div>
          )}
          {this.has4Piece && (
            <div>
              <strong>4-piece</strong> <SpellLink spell={TALENTS.CRASH_LIGHTNING_TALENT} /> bonus:
              <div className="value">
                <ItemDamageDone amount={this.crashLightningDamage} />
              </div>
              <small>{(this.effectiveCDR / 1000).toFixed(1)}s effective Crash Lightning CDR</small>
            </div>
          )}
        </div>
      </Statistic>
    );
  }

  get guideSubsection(): JSX.Element | null {
    if (!this.has4Piece) {
      return null;
    }

    const cdrItems = [
      {
        color: 'rgb(123,188,93)',
        label: 'Effective CDR',
        value: this.effectiveCDR / 1000,
        valueTooltip: `${(this.effectiveCDR / 1000).toFixed(1)}s of effective Crash Lightning cooldown reduction`,
      },
      {
        color: 'rgb(216,59,59)',
        label: 'Wasted CDR',
        value: this.wastedCDR / 1000,
        valueTooltip: `${(this.wastedCDR / 1000).toFixed(1)}s of cooldown reduction wasted while Crash Lightning was ready`,
      },
    ];

    const stackItems = [
      {
        color: 'rgb(123,188,93)',
        label: 'Stacks gained',
        value: this.appliedStacks,
        valueTooltip: `${this.appliedStacks} stacks gained within the cap`,
      },
      {
        color: 'rgb(216,59,59)',
        label: 'Over-cap',
        value: this.wastedStacks,
        valueTooltip: `${this.wastedStacks} stacks gained while already at ${MAX_STACKS}`,
      },
    ];

    const explanation = (
      <>
        <p>
          Each <SpellLink spell={TALENTS.FIRE_NOVA_TALENT} /> reduces the cooldown of{' '}
          <SpellLink spell={TALENTS.CRASH_LIGHTNING_TALENT} /> by 2 seconds and grants a stack of
          increased <SpellLink spell={TALENTS.CRASH_LIGHTNING_TALENT} /> damage (up to {MAX_STACKS}
          ). Wasted cooldown reduction (while Crash Lightning is already available) and stacks
          gained over the cap are a loss.
        </p>
      </>
    );

    const casts: PerCastData[] = this.voltaicBlazeCasts.map((vb) => {
      const total = vb.effectiveCDR + vb.wastedCDR;
      const performance =
        vb.triggers === 0
          ? QualitativePerformance.Fail
          : evaluateQualitativePerformanceByThreshold({
              actual: total > 0 ? vb.wastedCDR / total : 1,
              isLessThanOrEqual: {
                perfect: 0,
                good: 0.34,
                ok: 0.67,
              },
            });

      return {
        performance,
        timestamp: this.owner.formatTimestamp(vb.timestamp),
        stats: [
          {
            value: `${(vb.effectiveCDR / 1000).toFixed(1)}s`,
            label: 'Effective CDR',
            performance,
          },
          {
            value: `${(vb.wastedCDR / 1000).toFixed(1)}s`,
            label: 'Wasted CDR',
          },
          {
            value: `${vb.triggers}`,
            label: 'Fire Nova triggers',
          },
        ],
        details: null,
      };
    });

    return (
      <GuideSection
        spell={TALENTS.CRASH_LIGHTNING_TALENT}
        explanation={explanation}
        explanationPercent={40}
      >
        <div>
          <strong>Cooldown reduction</strong>
          <DonutChart items={cdrItems} />
          <strong>Stack efficiency</strong>
          <DonutChart items={stackItems} />
          <CastDetail title="Cooldown reduction per Voltaic Blaze" casts={casts} />
        </div>
      </GuideSection>
    );
  }
}

export default S2TierSet;
