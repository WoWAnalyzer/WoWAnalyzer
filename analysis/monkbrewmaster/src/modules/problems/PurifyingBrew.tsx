import { formatNumber } from 'common/format';
import SPELLS from 'common/SPELLS';
import { GuideProps, PassFailBar, SubSection } from 'interface/guide';
import type { Problem, ProblemRendererProps } from 'interface/guide/Problems';
import ProblemList from 'interface/guide/Problems';
import SpellLink from 'interface/SpellLink';
import Analyzer, { Options } from 'parser/core/Analyzer';
import EventFilter, { SELECTED_PLAYER } from 'parser/core/EventFilter';
import Events, {
  AddStaggerEvent,
  AnyEvent,
  DamageEvent,
  EventType,
  HealEvent,
  RemoveStaggerEvent,
} from 'parser/core/Events';
import CastEfficiency, { AbilityCastEfficiency } from 'parser/shared/modules/CastEfficiency';
import SpellUsable from 'parser/shared/modules/SpellUsable';
import BaseChart, { formatTime } from 'parser/ui/BaseChart';
import { VisualizationSpec } from 'react-vega';
import { AutoSizer } from 'react-virtualized';
import './PurifyingBrew.scss';

enum PurifyReason {
  RefreshPurifiedChi = 'refresh-chi',
  PreventCapping = 'prevent-capping',
  BigHit = 'big-hit',
  HighStagger = 'high-stagger',
  Unknown = 'unknown',
}

type PurifyData = {
  purified: PurifiedHit[];
  purify: RemoveStaggerEvent;
  reason: PurifyReason;
};

type TrackedStaggerData = {
  event: AddStaggerEvent;
  purifyCharges: number;
};

type MissedPurifyData = {
  hit: TrackedStaggerData;
  amountPurified: number;
  nextPurify: PurifyData;
  prevPurify?: PurifyData;
};

enum ProblemType {
  BadPurify,
  MissedPurify,
}

type ProblemData =
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
    } else {
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

type ShamPurifyData = MissedPurifyData | PurifyData;

/// identify missing purifies recursively
function identifyPurifies(
  prev: ShamPurifyData | undefined,
  next: ShamPurifyData,
  allHits: TrackedStaggerData[],
  hasBnw: boolean,
  bigHitThreshold: number,
): MissedPurifyData[] {
  // just don't allow conflicts within the stagger duration. loses some
  // potential casts, but prevents double-counting purified damage. eventually
  // we could reduce this to the actual PB cd, but that requires deeper
  // thinking about the implications
  const conflictWindowLength = hasBnw ? 13000 : 10000;
  const nextPurifyTimestamp = 'purify' in next ? next.purify.timestamp : next.hit.event.timestamp;
  const hits = allHits.filter(
    (hit) =>
      hit.purifyCharges > 0 &&
      // note: you may be tempted here to allow this through the filter if
      // you have at least two purifying charges, but that breaks in the left
      // branch of recursion. that is such a small optimization in the grand
      // scheme of things that we simply...don't
      hit.event.timestamp < nextPurifyTimestamp - conflictWindowLength,
  );

  if (hits.length === 0) {
    // no hits could've been purified without screwing things up, return
    return [];
  }

  const best = hits.reduceRight((previousBest, current) =>
    current.event.newPooledDamage > previousBest.event.newPooledDamage ? current : previousBest,
  );

  // we can't purify anything that'd pass muster
  if (best.event.newPooledDamage < bigHitThreshold) {
    return [];
  }

  const amountPurified = best.event.newPooledDamage / 2;

  const nextPurify = 'purify' in next ? next : next.nextPurify;

  // okay, finally we have a hit that we should've purified! let's handle it!
  const missedPurify: MissedPurifyData = {
    hit: best,
    amountPurified,
    nextPurify,
    prevPurify: !prev || 'purify' in prev ? prev : prev.prevPurify,
  };

  const index = hits.indexOf(best);

  const reduceChargeCutoff = best.event.timestamp + conflictWindowLength;

  // simulate the stagger amount in the remaining hits. this should technically
  // also go past the boundary of the following purify, but we're not gonna
  const simulatedRemainder = hits.slice(index + 1).map(({ event, purifyCharges }) => ({
    event: {
      ...event,
      newPooledDamage:
        event.newPooledDamage -
        (amountPurified *
          Math.max(0, 20 - Math.floor((event.timestamp - best.event.timestamp) / 500))) /
          20,
    },
    purifyCharges:
      event.timestamp < reduceChargeCutoff ? Math.max(purifyCharges - 1, 0) : purifyCharges,
  }));

  return [
    // find more in the left sub-window
    ...identifyPurifies(prev, missedPurify, hits.slice(0, index), hasBnw, bigHitThreshold),
    missedPurify,
    // find more in the right sub-window
    ...identifyPurifies(missedPurify, next, simulatedRemainder, hasBnw, bigHitThreshold),
  ];
}

export default class PurifyingBrewProblems extends Analyzer {
  static dependencies = {
    spellUsable: SpellUsable,
    castEff: CastEfficiency,
  };

  protected castEff!: CastEfficiency;
  protected spellUsable!: SpellUsable;

  constructor(options: Options) {
    super(options);

    this.addEventListener(new EventFilter(EventType.AddStagger), this.addStagger);
    this.addEventListener(new EventFilter(EventType.RemoveStagger), this.removeStagger);
    this.addEventListener(Events.damage.to(SELECTED_PLAYER), this.updateMaxHp);
    this.addEventListener(Events.heal.to(SELECTED_PLAYER), this.updateMaxHp);
  }

  private lastKnownMaxHp = 1;
  private updateMaxHp(event: DamageEvent | HealEvent) {
    this.lastKnownMaxHp = event.maxHitPoints ?? this.lastKnownMaxHp;
  }

  private hitStack: TrackedStaggerData[] = [];
  private addStagger(event: AddStaggerEvent) {
    this.hitStack.push({
      event,
      purifyCharges: this.spellUsable.chargesAvailable(SPELLS.PURIFYING_BREW.id),
    });
  }

  get bigHitThreshold() {
    return this.lastKnownMaxHp / 4;
  }

  private unpurifiedHits: TrackedStaggerData[] = [];
  public readonly purifies: PurifyData[] = [];
  private removeStagger(event: RemoveStaggerEvent) {
    if (event.trigger?.ability.guid !== SPELLS.PURIFYING_BREW.id) {
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
      !this.spellUsable.isOnCooldown(SPELLS.PURIFYING_BREW.id) ||
      // this happens *after* the PB cast is applied in spellUsable, so mentally add a charge
      this.spellUsable.cooldownRemaining(SPELLS.PURIFYING_BREW.id) <= CAP_CUTOFF
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
      const missed = identifyPurifies(
        previous,
        purify,
        this.unpurifiedHits.filter(
          (hit) =>
            hit.event.timestamp > (prev?.purify.timestamp ?? 0) &&
            hit.event.timestamp < purify.purify.timestamp,
        ),
        this.selectedCombatant.hasTalent(SPELLS.BOB_AND_WEAVE_TALENT),
        this.bigHitThreshold,
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
      .filter(({ reason }) => reason === PurifyReason.Unknown)
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
    return this.castEff.getCastEfficiencyForSpellId(SPELLS.PURIFYING_BREW.id)!;
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

const PurifyProblemDescription = ({ data }: { data: ProblemData }) =>
  data.type === ProblemType.MissedPurify ? (
    <p>
      You missed <strong>{data.data.length} or more</strong> potential casts of{' '}
      <SpellLink id={SPELLS.PURIFYING_BREW.id} /> here that could've cleared a total of{' '}
      <strong>
        {formatNumber(data.data.map((datum) => datum.amountPurified).reduce((a, b) => a + b))}
      </strong>{' '}
      damage <em>without</em> impacting any of your other good{' '}
      <SpellLink id={SPELLS.PURIFYING_BREW.id} /> casts.
    </p>
  ) : (
    <p>
      You cast <SpellLink id={SPELLS.PURIFYING_BREW.id} /> with low{' '}
      <SpellLink id={SPELLS.STAGGER.id} />, clearing only{' '}
      <strong>{formatNumber(data.data.purify.amount)}</strong> damage. The timing of this cast was
      not while <SpellLink id={SPELLS.PURIFYING_BREW.id} /> was almost capped at 2 charges, leaving
      you with no charges available to deal with incoming damage.
    </p>
  );

export function PurifyProblem({
  problem,
  events,
  info,
}: ProblemRendererProps<ProblemData>): JSX.Element {
  const stagger = events.filter(
    ({ type }) => type === EventType.AddStagger || type === EventType.RemoveStagger,
  );

  const purifyEvents =
    problem.data.type === ProblemType.BadPurify
      ? [
          {
            ...problem.data.data.purify,
            timestamp: stagger.reduce((prev: AnyEvent, cur: AnyEvent) => {
              if (cur.timestamp < (problem.data.data as PurifyData).purify.timestamp) {
                return cur;
              } else {
                return prev;
              }
            }).timestamp,
            subject: true,
          },
        ]
      : problem.data.data.map((missed) => ({
          amount: missed.amountPurified,
          timestamp: missed.hit.event.timestamp,
          newPooledDamage: missed.hit.event.newPooledDamage - missed.amountPurified,
          subject: true,
        }));

  const data = {
    stagger,
    purify: [
      ...purifyEvents,
      ...stagger.filter(
        (event) =>
          event.type === EventType.RemoveStagger &&
          event.trigger?.ability.guid === SPELLS.PURIFYING_BREW.id,
      ),
    ],
    hits: problem.data.type === ProblemType.BadPurify ? problem.data.data.purified : [],
  };

  const spec: VisualizationSpec = {
    encoding: {
      x: {
        field: 'timestamp',
        type: 'quantitative',
        axis: {
          labelExpr: formatTime('datum.value'),
          tickMinStep: 5000,
          grid: false,
        },
        scale: {
          nice: false,
        },
        title: null,
      },
      y: {
        field: 'newPooledDamage',
        type: 'quantitative',
        title: 'Staggered Damage',
        axis: {
          gridOpacity: 0.3,
          format: '~s',
        },
      },
    },
    layer: [
      {
        data: { name: 'stagger' },
        mark: {
          type: 'line',
          interpolate: 'linear',
          color: '#fab700',
        },
        transform: [
          {
            calculate: `datum.timestamp - ${info.fightStart}`,
            as: 'timestamp',
          },
        ],
      },
      {
        data: { name: 'hits' },
        mark: {
          type: 'point',
          filled: true,
          color: 'white',
          opacity: 1,
          size: 50,
        },
        transform: [
          {
            calculate: `datum.hit.timestamp - ${info.fightStart}`,
            as: 'timestamp',
          },
          {
            calculate: 'datum.hit.newPooledDamage',
            as: 'newPooledDamage',
          },
        ],
        encoding: {
          tooltip: [
            {
              field: 'hit.amount',
              type: 'quantitative',
              title: 'Amount Staggered',
              format: '.3~s',
            },
            {
              field: 'ratio',
              type: 'quantitative',
              title: 'Amount Purified',
              format: '.2~p',
            },
          ],
        },
      },
      {
        data: {
          name: 'purify',
        },
        transform: [
          {
            calculate: `datum.timestamp - ${info.fightStart}`,
            as: 'timestamp',
          },
          {
            calculate: 'datum.newPooledDamage + datum.amount',
            as: 'newPooledDamage',
          },
        ],
        mark: {
          type: 'point',
          opacity: 1,
          size: 50,
        },
        encoding: {
          tooltip: [
            {
              field: 'amount',
              type: 'quantitative',
              title: 'Amount Purified',
              format: '.3~s',
            },
          ],
          stroke: {
            field: 'subject',
            type: 'nominal',
            legend: null,
            scale: {
              domain: [false, true],
              range: ['#00ff96', 'red'],
            },
          },
          fill: {
            field: 'subject',
            type: 'nominal',
            legend: null,
            scale: {
              domain: [false, true],
              range: ['transparent', 'red'],
            },
          },
        },
      },
    ],
  };

  return (
    <div>
      <AutoSizer disableHeight>
        {({ width }) => <BaseChart data={data} width={width} height={150} spec={spec} />}
      </AutoSizer>
      <PurifyProblemDescription data={problem.data} />
    </div>
  );
}

function reasonLabel(reason: PurifyReason): React.ReactNode {
  switch (reason) {
    case PurifyReason.BigHit:
      return 'Large Hit';
    case PurifyReason.HighStagger:
      return 'High Stagger';
    case PurifyReason.PreventCapping:
      return 'Prevent Capping Charges';
    case PurifyReason.RefreshPurifiedChi:
      return (
        <>
          Refresh <SpellLink id={SPELLS.PURIFIED_CHI.id} /> Stacks
        </>
      );
    default:
      return 'Other';
  }
}

const reasonOrder = [
  PurifyReason.BigHit,
  PurifyReason.HighStagger,
  PurifyReason.PreventCapping,
  PurifyReason.RefreshPurifiedChi,
  PurifyReason.Unknown,
];

function PurifyReasonBreakdown({
  counts,
  total,
  castEfficiency,
}: {
  counts: Record<PurifyReason, number>;
  total: number;
  castEfficiency: AbilityCastEfficiency;
}): JSX.Element {
  return (
    <table className="hits-list purify-reasons">
      <tbody>
        <tr>
          <td>Charges Used</td>
          <td className="pass-fail-counts">
            {castEfficiency.casts} / {castEfficiency.maxCasts}
          </td>
          <td>
            <PassFailBar pass={castEfficiency.casts} total={castEfficiency.maxCasts} />
          </td>
        </tr>
        <tr>
          <td colSpan={3}>
            <strong>Types of Purifies</strong>
          </td>
        </tr>
      </tbody>
      <tbody className="reasons">
        {Object.entries(counts)
          .sort(
            ([a], [b]) =>
              reasonOrder.indexOf(a as PurifyReason) - reasonOrder.indexOf(b as PurifyReason),
          )
          .map(([reason, count]) => (
            <tr key={reason} className={reason}>
              <td>{reasonLabel(reason as PurifyReason)}</td>
              <td className="pass-fail-counts">{count}</td>
              <td>
                <PassFailBar pass={count} total={total} />
              </td>
            </tr>
          ))}
      </tbody>
    </table>
  );
}

export function PurifySection({
  module,
  events,
  info,
}: Pick<GuideProps<any>, 'events' | 'info'> & { module: PurifyingBrewProblems }): JSX.Element {
  return (
    <SubSection title="Purifying Brew">
      <p>
        The primary method of removing damage from your <SpellLink id={SPELLS.STAGGER.id} /> pool is
        casting <SpellLink id={SPELLS.PURIFYING_BREW.id} />. Your goal is twofold:
      </p>
      <ol>
        <li>
          Don't waste any charges of <SpellLink id={SPELLS.PURIFYING_BREW.id} />
        </li>
        <li>
          Cast <SpellLink id={SPELLS.PURIFYING_BREW.id} /> when you have relatively high{' '}
          <SpellLink id={SPELLS.STAGGER.id} />
        </li>
      </ol>
      <p>
        Due to our mastery, <SpellLink id={SPELLS.MASTERY_ELUSIVE_BRAWLER.id} />, moment-to-moment
        damage intake is highly unpredictable. As a result, the most reliable way to do this is by{' '}
        <strong>
          casting <SpellLink id={SPELLS.PURIFYING_BREW.id} /> immediately after being hit by a large
          attack.
        </strong>{' '}
        On some fights, "large attack" may mean <em>Melee Attack</em>&mdash;there is not a
        one-size-fits-all guideline across all bosses and difficulties.
      </p>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'max-content 1fr',
          gridColumnGap: '1em',
          alignItems: 'start',
        }}
      >
        <PurifyReasonBreakdown
          counts={module.reasonCounts}
          total={module.purifies.length}
          castEfficiency={module.castEfficiency}
        />
        <ProblemList
          info={info}
          renderer={PurifyProblem}
          events={events}
          problems={module.problems}
        />
      </div>
    </SubSection>
  );
}
