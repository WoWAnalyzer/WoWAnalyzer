import { formatNumber } from 'common/format';
import SPELLS from 'common/SPELLS';
import { GuideProps, PassFailBar, SubSection } from 'interface/guide';
import type { Problem, ProblemRendererProps } from 'interface/guide/ProblemList';
import ProblemList from 'interface/guide/ProblemList';
import SpellLink from 'interface/SpellLink';
import { AddStaggerEvent, EventType, RemoveStaggerEvent } from 'parser/core/Events';
import { AbilityCastEfficiency } from 'parser/shared/modules/CastEfficiency';
import BaseChart from 'parser/ui/BaseChart';
import { useEffect, useState } from 'react';
import { VisualizationSpec } from 'react-vega';
import { AutoSizer } from 'react-virtualized';

import { staggerChart, line, point, color, normalizeTimestampTransform } from '../../charts';
import PurifyingBrewProblems, { ProblemType, ProblemData, PurifyReason } from './analyzer';
import { potentialStaggerEvents } from './solver';
import './PurifyingBrew.scss';

export { default } from './analyzer';

const PurifyProblemDescription = ({ data }: { data: ProblemData }) =>
  data.type === ProblemType.MissedPurify ? (
    <p>
      You missed <strong>{data.data.length} or more</strong> potential casts of{' '}
      <SpellLink id={SPELLS.PURIFYING_BREW.id} /> here that could've cleared a total of{' '}
      <strong>
        {formatNumber(data.data.map((datum) => datum.amountPurified).reduce((a, b) => a + b))}
      </strong>{' '}
      damage. While this may reduce the value of your later{' '}
      <SpellLink id={SPELLS.PURIFYING_BREW.id} /> casts, it is likely to reduce your overall damage
      intake.
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
        Due to our mastery, <SpellLink id={SPELLS.MASTERY_ELUSIVE_BRAWLER.id} />, moment-to-moment{' '}
        <SpellLink id={SPELLS.STAGGER.id} /> level is highly unpredictable. As a result, the most
        reliable way to do this is by{' '}
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
          gridTemplateColumns: 'minmax(40%, max-content) 1fr',
          gridColumnGap: '1em',
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
