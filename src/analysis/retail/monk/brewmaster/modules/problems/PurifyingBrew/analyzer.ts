import SPELLS from 'common/SPELLS';
import talents from 'common/TALENTS/monk';
import type { Problem } from 'interface/guide/components/ProblemList';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import EventFilter from 'parser/core/EventFilter';
import Events, {
  AddStaggerEvent,
  DamageEvent,
  EventType,
  HealEvent,
  RemoveStaggerEvent,
} from 'parser/core/Events';
import CastEfficiency, { AbilityCastEfficiency } from 'parser/shared/modules/CastEfficiency';
import SpellUsable from 'parser/shared/modules/SpellUsable';

import BrewCDR from '../../core/BrewCDR';
import purifySolver, { MissedPurifyData } from './solver';

export enum PurifyReason {
  RefreshPurifiedChi = 'refresh-chi',
  PreventCapping = 'prevent-capping',
  BigHit = 'big-hit',
  HighStagger = 'high-stagger',
  Unknown = 'unknown',
}

export type PurifyData = {
  purified: PurifiedHit[];
  purify: RemoveStaggerEvent;
  reason: PurifyReason;
};

export type TrackedStaggerData =
  | {
      event: AddStaggerEvent;
      purifyCharges: number;
      // Remaining PB cd in ms
      remainingPurifyCooldown: number;
    }
  | { event: RemoveStaggerEvent; purifyCharges?: undefined; remainingPurifyCooldown?: undefined };

export enum ProblemType {
  BadPurify,
  MissedPurify,
}

export type ProblemData =
  | {
      type: ProblemType.BadPurify;
      data: PurifyData;
    }
  | {
      type: ProblemType.MissedPurify;
      data: MissedPurifyData[];
    };

const CAP_CUTOFF = 4000;
const CHI_REFRESH_CUTOFF = 7500;

type PurifiedHit = { hit: AddStaggerEvent; ratio: number };

function staggerDuration(bnw: boolean): number {
  return bnw ? 13000 : 10000;
}

function classifyHitStack(
  hitStack: TrackedStaggerData[],
  timestamp: number,
  bnw: boolean = false,
): { unpurified: TrackedStaggerData[]; purified: PurifiedHit[] } {
  const unpurified = [];
  const purified = [];

  for (const hit of hitStack) {
    if (timestamp - hit.event.timestamp > staggerDuration(bnw)) {
      unpurified.push(hit);
    } else if (hit.event.type === EventType.AddStagger) {
      purified.push({
        hit: hit.event,
        ratio: 1 - (timestamp - hit.event.timestamp) / staggerDuration(bnw),
      });
    }
  }

  return {
    unpurified,
    purified,
  };
}

export default class PurifyingBrewProblems extends Analyzer {
  static dependencies = {
    spellUsable: SpellUsable,
    brewCdr: BrewCDR,
    castEff: CastEfficiency,
  };

  protected castEff!: CastEfficiency;
  protected spellUsable!: SpellUsable;
  protected brewCdr!: BrewCDR;

  constructor(options: Options) {
    super(options);

    this.addEventListener(new EventFilter(EventType.AddStagger), this.addStagger);
    this.addEventListener(new EventFilter(EventType.RemoveStagger), this.removeStagger);
    this.addEventListener(Events.damage.to(SELECTED_PLAYER), this.updateMaxHp);
    this.addEventListener(Events.heal.to(SELECTED_PLAYER), this.updateMaxHp);
  }

  private totalSeenMaxHp = 0;
  private maxHpEventCount = 0;
  private updateMaxHp(event: DamageEvent | HealEvent) {
    if (event.maxHitPoints) {
      this.totalSeenMaxHp += event.maxHitPoints;
      this.maxHpEventCount += 1;
    }
  }

  private _amountStaggered: number = 0;
  public get amountStaggered() {
    return this._amountStaggered;
  }

  private hitStack: TrackedStaggerData[] = [];
  private addStagger(event: AddStaggerEvent) {
    this._amountStaggered += event.amount;
    this.hitStack.push({
      event,
      purifyCharges: this.spellUsable.chargesAvailable(talents.PURIFYING_BREW_TALENT.id),
      remainingPurifyCooldown: this.spellUsable.cooldownRemaining(talents.PURIFYING_BREW_TALENT.id),
    });
  }

  get bigHitThreshold() {
    if (this.maxHpEventCount === 0) {
      return 2_500_000;
    }
    return this.totalSeenMaxHp / this.maxHpEventCount / 4;
  }

  private unpurifiedHits: TrackedStaggerData[] = [];
  public readonly purifies: PurifyData[] = [];
  private removeStagger(event: RemoveStaggerEvent) {
    if (event.trigger?.ability.guid !== talents.PURIFYING_BREW_TALENT.id) {
      this.hitStack.push({ event });
      return;
    }

    const { unpurified, purified } = classifyHitStack(this.hitStack, event.timestamp);

    this.unpurifiedHits.push(...unpurified);

    const purifiedChi = this.selectedCombatant.getBuff(
      SPELLS.PURIFIED_CHI.id,
      undefined,
      undefined,
      1000,
    );

    if (purified.some(({ hit: { amount }, ratio }) => amount * ratio >= this.bigHitThreshold)) {
      this.purifies.push({
        purified,
        reason: PurifyReason.BigHit,
        purify: event,
      });
    } else if (event.amount > this.bigHitThreshold) {
      this.purifies.push({
        purified,
        reason: PurifyReason.HighStagger,
        purify: event,
      });
    } else if (
      !this.spellUsable.isOnCooldown(talents.PURIFYING_BREW_TALENT.id) ||
      // this happens *after* the PB cast is applied in spellUsable, so mentally add a charge
      this.spellUsable.cooldownRemaining(talents.PURIFYING_BREW_TALENT.id) <= CAP_CUTOFF
    ) {
      this.purifies.push({
        purified,
        reason: PurifyReason.PreventCapping,
        purify: event,
      });
    } else if (
      purifiedChi &&
      purifiedChi.stacks >= 3 &&
      event.timestamp - purifiedChi.start >= CHI_REFRESH_CUTOFF
    ) {
      this.purifies.push({
        purified,
        reason: PurifyReason.RefreshPurifiedChi,
        purify: event,
      });
    } else {
      this.purifies.push({
        purified,
        reason: PurifyReason.Unknown,
        purify: event,
      });
    }

    this.hitStack = [];
  }

  private detectMissedPurifies(): Array<Problem<ProblemData>> {
    if (this.unpurifiedHits.length === 0) {
      return [];
    }

    const problems: Array<Problem<ProblemData>> = [];

    let previous: PurifyData | undefined = undefined;
    for (const purify of this.purifies.filter((data) => data.reason !== PurifyReason.Unknown)) {
      // HACK: workaround closure capturing the initial value of `previous`
      const prev = previous;
      const hits = this.unpurifiedHits.filter(
        (hit) =>
          hit.event.timestamp > (prev?.purify.timestamp ?? 0) &&
          hit.event.timestamp < purify.purify.timestamp,
      );
      const missed = purifySolver(
        hits,
        // this is called after we've run through all the events, so it should
        // be reasonably accurate outside of lust, and never too much of an
        // underestimate
        this.brewCdr.minAttainableCooldown * 1000,
        // we reduce the threshold a bit for this because it produces a bit more
        // purifying in lower difficulties w/o negatively affecting Mythic
        this.bigHitThreshold * 0.7,
      );

      if (missed.length > 0) {
        problems.push({
          data: {
            type: ProblemType.MissedPurify,
            data: missed,
          },
          context: 5000,
          range: {
            start: previous?.purify.timestamp ?? this.owner.fight.start_time,
            end: purify.purify.timestamp,
          },
          severity: missed.map((datum) => datum.amountPurified).reduce((a, b) => a + b),
        });
      }

      previous = purify;
    }

    return problems;
  }

  get problems(): Array<Problem<ProblemData>> {
    const badPurifies: Array<Problem<ProblemData>> = this.purifies
      // the length check *should* never be relevant but in rare cases it crops up.
      .filter(({ reason, purified }) => reason === PurifyReason.Unknown && purified.length > 0)
      .map((data) => ({
        data: {
          type: ProblemType.BadPurify,
          data,
        },
        range: {
          start: data.purified[0].hit.timestamp,
          end: data.purify.timestamp,
        },
        context: 5000,
        severity: -data.purify.amount,
      }));

    return badPurifies.concat(this.detectMissedPurifies());
  }

  get castEfficiency(): AbilityCastEfficiency {
    return this.castEff.getCastEfficiencyForSpellId(talents.PURIFYING_BREW_TALENT.id)!;
  }

  get reasonCounts(): Record<PurifyReason, number> {
    const counts = {
      [PurifyReason.Unknown]: 0,
      [PurifyReason.PreventCapping]: 0,
      [PurifyReason.HighStagger]: 0,
      [PurifyReason.BigHit]: 0,
      [PurifyReason.RefreshPurifiedChi]: 0,
    };

    for (const { reason } of this.purifies) {
      counts[reason] += 1;
    }

    return counts;
  }
}
