import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { AnyEvent, CastEvent, EndChannelEvent, FightEndEvent } from 'parser/core/Events';
import SPELLS from 'common/SPELLS';
import Haste from 'parser/shared/modules/Haste';
import Spell from 'common/SPELLS/Spell';
import {
  QualitativePerformance,
  evaluateQualitativePerformanceByThreshold,
} from 'parser/ui/QualitativePerformance';
import ROLES from 'game/ROLES';
import SPECS, { Spec } from 'game/SPECS';

interface MeleeCast {
  event: CastEvent;
  haste: number;
}

const MAX_MELEE_TIMER = 4000;
const MIN_MELEE_TIMER = 800;
const MELEE_HEALERS = [SPECS.MISTWEAVER_MONK.id, SPECS.HOLY_PALADIN.id];

export class MeleeUptimeAnalyzer extends Analyzer.withDependencies({ haste: Haste }) {
  private recentMelees: MeleeCast[] = [];
  private expectedNextMeleeTimestamp: number | undefined = undefined;

  private gaps: Array<{ start: number; end: number }> = [];

  public static withMeleeAbility(ability: Spell) {
    return class extends MeleeUptimeAnalyzer {
      constructor(options: Options) {
        super(options, ability);
      }
    };
  }

  static isMeleeSpec(spec?: Spec): boolean {
    if (!spec) {
      return false;
    }

    return (
      spec.role === ROLES.DPS.MELEE || spec.role === ROLES.TANK || MELEE_HEALERS.includes(spec.id)
    );
  }

  constructor(options: Options, meleeAbility?: Spell) {
    super(options);

    if (!MeleeUptimeAnalyzer.isMeleeSpec(options.owner.config.spec)) {
      this.active = false;
      return;
    }

    this.addEventListener(
      Events.cast
        .by(SELECTED_PLAYER)
        .spell(meleeAbility ? [SPELLS.MELEE, meleeAbility] : SPELLS.MELEE),
      this.onMeleeCast,
    );
    this.addEventListener(Events.EndChannel.by(SELECTED_PLAYER), this.onChannelEnd);
    this.addEventListener(Events.fightend, this.onFightEnd);
  }

  public get meleeUptimeGaps(): typeof this.gaps {
    return this.gaps;
  }

  public get meleeUptimePercentage(): number {
    const downtime = this.gaps.reduce((total, gap) => total + gap.end - gap.start, 0);
    return (this.owner.fightDuration - downtime) / this.owner.fightDuration;
  }

  public get meleeUptimePerformance(): QualitativePerformance {
    const uptime = this.meleeUptimePercentage;
    return evaluateQualitativePerformanceByThreshold({
      actual: uptime,
      isGreaterThanOrEqual: {
        perfect: 1,
        good: 0.9,
        ok: 0.8,
      },
      max: 1,
    });
  }

  private onMeleeCast(event: CastEvent) {
    this.recentMelees.push({
      event,
      haste: this.deps.haste.current,
    });

    // only keep the most recent melees
    this.recentMelees = this.recentMelees.slice(-10);

    this.maybePushGap(event);

    this.expectedNextMeleeTimestamp = MeleeUptimeAnalyzer.estimateNextMeleeTimestamp(
      this.recentMelees,
    );
  }

  private onChannelEnd(event: EndChannelEvent) {
    // proper channel handling is quite hard because your melee can queue up during a cast/channel, but will not fire til the end.
    // the goal of the current channel handling is basically to prevent calling every Eye Beam cast "melee downtime".
    // the current approach does allow long channels to inflate expected inter-melee time, but the effect should diminish quickly
    this.expectedNextMeleeTimestamp = Math.max(
      event.timestamp,
      this.expectedNextMeleeTimestamp ?? 0,
    );
  }

  private onFightEnd(event: FightEndEvent) {
    this.maybePushGap(event);
  }

  private maybePushGap(event: AnyEvent) {
    if (
      this.expectedNextMeleeTimestamp &&
      event.timestamp > this.expectedNextMeleeTimestamp + GRACE_WINDOW_MS
    ) {
      this.gaps.push({
        start: this.expectedNextMeleeTimestamp,
        end: event.timestamp,
      });
    }
  }

  private static estimateNextMeleeTimestamp(recentMelees: MeleeCast[]): number | undefined {
    if (recentMelees.length < 3) {
      return undefined;
    }

    const normalizedSwingTimers = [];
    for (let i = 1; i < recentMelees.length; i += 1) {
      const actualTimer = recentMelees[i].event.timestamp - recentMelees[i - 1].event.timestamp;
      if (actualTimer > MAX_MELEE_TIMER) {
        continue; // ignore super long timers that can't actually happen.
      }

      if (actualTimer < MIN_MELEE_TIMER) {
        continue; // ignore very short timers because of dual-wield classes
      }

      normalizedSwingTimers.push(actualTimer * (1 + recentMelees[i - 1].haste));
    }

    if (normalizedSwingTimers.length < 3) {
      return undefined;
    }

    const mostRecentMelee = recentMelees.at(-1)!;

    return (
      mostRecentMelee.event.timestamp +
      normalizedSwingTimers.reduce((a, b) => a + b, 0) /
        normalizedSwingTimers.length /
        (1 + mostRecentMelee.haste)
    );
  }
}

const GRACE_WINDOW_MS = 100;
