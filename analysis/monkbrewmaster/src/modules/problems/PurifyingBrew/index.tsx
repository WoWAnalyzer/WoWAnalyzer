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
  DamageEvent,
  EventType,
  HealEvent,
  RemoveStaggerEvent,
} from 'parser/core/Events';
import CastEfficiency, { AbilityCastEfficiency } from 'parser/shared/modules/CastEfficiency';
import SpellUsable from 'parser/shared/modules/SpellUsable';
import BaseChart from 'parser/ui/BaseChart';
import { useEffect, useState } from 'react';
import { VisualizationSpec } from 'react-vega';
import { AutoSizer } from 'react-virtualized';

import { staggerChart, line, point, color, normalizeTimestampTransform } from '../../charts';
import BrewCDR from '../../core/BrewCDR';
import purifySolver, { MissedPurifyData, potentialStaggerEvents } from './solver';
import './PurifyingBrew.scss';

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

  private hitStack: TrackedStaggerData[] = [];
  private addStagger(event: AddStaggerEvent) {
    this.hitStack.push({
      event,
      purifyCharges: this.spellUsable.chargesAvailable(SPELLS.PURIFYING_BREW.id),
      remainingPurifyCooldown: this.spellUsable.cooldownRemaining(SPELLS.PURIFYING_BREW.id),
    });
  }

  get bigHitThreshold() {
    if (this.maxHpEventCount === 0) {
      return 25000;
    }
    return this.totalSeenMaxHp / this.maxHpEventCount / 4;
  }

  private unpurifiedHits: TrackedStaggerData[] = [];
  public readonly purifies: PurifyData[] = [];
  private removeStagger(event: RemoveStaggerEvent) {
    if (event.trigger?.ability.guid !== SPELLS.PURIFYING_BREW.id) {
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
  const stagger: Array<AddStaggerEvent | RemoveStaggerEvent> = events.filter(
    ({ type }) => type === EventType.AddStagger || type === EventType.RemoveStagger,
  ) as Array<AddStaggerEvent | RemoveStaggerEvent>;

  const purifyEvents =
    problem.data.type === ProblemType.BadPurify
      ? [
          {
            ...problem.data.data.purify,
            subject: true,
          },
        ]
      : problem.data.data.map((missed) => ({
          amount: missed.amountPurified,
          timestamp: missed.hit.event.timestamp,
          newPooledDamage: missed.state.staggerPool - missed.amountPurified,
          subject: true,
        }));

  const data = {
    stagger,
    purify: [
      ...purifyEvents,
      ...(problem.data.type === ProblemType.MissedPurify
        ? stagger
            .filter(
              (event) =>
                event.type === EventType.RemoveStagger &&
                event.trigger?.ability.guid === SPELLS.PURIFYING_BREW.id,
            )
            .map((event) => ({ ...event, subject: false }))
        : []),
    ],
    hits: problem.data.type === ProblemType.BadPurify ? problem.data.data.purified : [],
    potentialStagger:
      problem.data.type === ProblemType.MissedPurify
        ? potentialStaggerEvents(problem.data.data, stagger)
        : undefined,
  };

  const spec: VisualizationSpec = {
    ...staggerChart,
    layer: [
      {
        ...line('stagger', color.stagger),
        transform: [normalizeTimestampTransform(info)],
      },
      {
        ...line('potentialStagger', color.potentialStagger),
        transform: [normalizeTimestampTransform(info)],
      },
      {
        ...point('hits', 'white'),
        transform: [
          normalizeTimestampTransform(info, 'hit.timestamp'),
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
        ...point('purify', 'transparent'),
        transform: [
          normalizeTimestampTransform(info),
          {
            calculate: 'datum.newPooledDamage + datum.amount',
            as: 'newPooledDamage',
          },
        ],
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
              range: [color.purify, 'red'],
            },
          },
          fill: {
            field: 'subject',
            type: 'nominal',
            legend: null,
            scale: {
              domain: [false, true],
              range: [color.purify, 'red'],
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
  const [problems, setProblems] = useState<Array<Problem<ProblemData>>>([]);

  useEffect(() => {
    const run = async () => setProblems(module.problems);
    run();
  }, [module]);

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
        <ProblemList info={info} renderer={PurifyProblem} events={events} problems={problems} />
      </div>
    </SubSection>
  );
}
