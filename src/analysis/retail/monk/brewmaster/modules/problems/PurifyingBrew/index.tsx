import { t } from '@lingui/macro';
import { fetchTable } from 'common/fetchWclApi';
import { formatDuration, formatNumber } from 'common/format';
import SPELLS from 'common/SPELLS';
import { WclTable, WCLThreatBand, WCLThreatTableResponse } from 'common/WCL_TYPES';
import { TooltipElement } from 'interface';
import { GuideProps, SubSection } from 'interface/guide';
import type { Problem, ProblemRendererProps } from 'interface/guide/components/ProblemList';
import ProblemList from 'interface/guide/components/ProblemList';
import SpellLink from 'interface/SpellLink';
import { AddStaggerEvent, EventType, RemoveStaggerEvent } from 'parser/core/Events';
import { Info } from 'parser/core/metric';
import { AbilityCastEfficiency } from 'parser/shared/modules/CastEfficiency';
import BaseChart from 'parser/ui/BaseChart';
import { useEffect, useState } from 'react';
import { VisualizationSpec } from 'react-vega';
import AutoSizer from 'react-virtualized-auto-sizer';

import { staggerChart, line, point, color, normalizeTimestampTransform } from '../../charts';
import PurifyingBrewProblems, {
  ProblemType,
  ProblemData,
  PurifyReason,
  PurifyData,
} from './analyzer';
import { potentialStaggerEvents } from './solver';

import './PurifyingBrew.scss';
import talents from 'common/TALENTS/monk';
import PassFailBar from 'interface/guide/components/PassFailBar';
import CastReasonBreakdownTableContents from 'interface/guide/components/CastReasonBreakdownTableContents';

export { default } from './analyzer';

export function useThreatTable({
  reportCode,
  fightStart,
  fightEnd,
  combatant,
}: Info): WCLThreatTableResponse | undefined {
  const [table, setTable] = useState<WCLThreatTableResponse | undefined>(undefined);

  useEffect(() => {
    let isMounted = true;
    const load = async () => {
      const data = await fetchTable<WCLThreatTableResponse>(
        reportCode,
        fightStart,
        fightEnd,
        WclTable.Threat,
        combatant.id,
      );
      if (isMounted) {
        setTable(data);
      }
    };

    load();

    return () => {
      isMounted = false;
    };
  }, [reportCode, fightStart, fightEnd, combatant.id]);

  return table;
}

const PurifyProblemDescription = ({ data }: { data: ProblemData }) =>
  data.type === ProblemType.MissedPurify ? (
    <p>
      You missed <strong>{data.data.length} or more</strong> potential casts of{' '}
      <SpellLink spell={talents.PURIFYING_BREW_TALENT} /> here that could've cleared a total of{' '}
      <strong>
        {formatNumber(data.data.map((datum) => datum.amountPurified).reduce((a, b) => a + b))}
      </strong>{' '}
      damage. While this may reduce the value of your later{' '}
      <SpellLink spell={talents.PURIFYING_BREW_TALENT} /> casts, it is likely to reduce your overall
      damage intake.
    </p>
  ) : (
    <p>
      You cast <SpellLink spell={talents.PURIFYING_BREW_TALENT} /> with low{' '}
      <SpellLink spell={SPELLS.STAGGER} />, clearing only{' '}
      <strong>{formatNumber(data.data.purify.amount)}</strong> damage. The timing of this cast was
      not while <SpellLink spell={talents.PURIFYING_BREW_TALENT} /> was almost capped at 2 charges,
      leaving you with no charges available to deal with incoming damage.
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
                event.trigger?.ability.guid === talents.PURIFYING_BREW_TALENT.id,
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
    // @ts-expect-error This is a valid typing but Vega types are being weird with TS 5.4
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
          {
            calculate: '"Mitigated Hit"',
            as: 'tooltipTitle',
          },
        ],
        encoding: {
          tooltip: [
            {
              title: 'Type',
              type: 'nominal',
              field: 'tooltipTitle',
            },
            {
              field: 'hit.amount',
              type: 'quantitative',
              title: 'Amount Staggered',
              format: '.3~s',
            },
            {
              field: 'ratio',
              type: 'quantitative',
              title: '% Damage Purified',
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
          {
            calculate: '"Purify"',
            as: 'tooltipTitle',
          },
        ],
        encoding: {
          tooltip: [
            {
              field: 'tooltipTitle',
              type: 'nominal',
              title: 'Type',
            },
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
          Refresh <SpellLink spell={SPELLS.PURIFIED_CHI} /> Stacks
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

function reasonEnabled(info: Info, reason: PurifyReason): boolean {
  switch (reason) {
    case PurifyReason.RefreshPurifiedChi:
      return info.combatant.hasTalent(talents.IMPROVED_CELESTIAL_BREW_TALENT);
    default:
      return true;
  }
}

function PurifyReasonBreakdown({
  purifies,
  castEfficiency,
  amountPurified,
  amountStaggered,
  info,
}: {
  purifies: PurifyData[];
  amountPurified: number;
  amountStaggered: number;
  castEfficiency: AbilityCastEfficiency;
  info: Info;
}): JSX.Element {
  const threatTable = useThreatTable(info);

  const possibleReasons = reasonOrder.filter(reasonEnabled.bind(null, info));

  return (
    <table className="hits-list purify-reasons">
      <tbody>
        <tr>
          <td>
            <TooltipElement
              content={t({
                id: 'guide.monk.brewmaster.purifyingbrew.targetAmountPurified',
                message:
                  'A reasonable goal is to purify 40-50% of Staggered damage. If you purify at least 45%, this bar will be full.',
              })}
            >
              Amount Purified
            </TooltipElement>
          </td>
          <td className="pass-fail-counts">
            {formatNumber(amountPurified)} / {formatNumber(amountStaggered)}
          </td>
          <td>
            <PassFailBar pass={amountPurified} total={amountStaggered * 0.45} />
          </td>
        </tr>
        <tr>
          <td>
            <TooltipElement
              content={t({
                id: 'guide.monk.brewmaster.purifyingbrew.targetChargesUsed',
                message:
                  'This value should be judged relative to the Active Tanking Time shown below. If the fraction of charges used is well below the fraction of time spent tanking, that is a serious problem.',
              })}
            >
              Charges Used
            </TooltipElement>
          </td>
          <td className="pass-fail-counts">
            {castEfficiency.casts} / {castEfficiency.maxCasts}
          </td>
          <td>
            <PassFailBar pass={castEfficiency.casts} total={castEfficiency.maxCasts} />
          </td>
        </tr>
        <ThreatSummary threat={threatTable} totalTime={info.fightDuration} />
        <tr>
          <td colSpan={3}>
            <strong>Types of Purifies</strong>
          </td>
        </tr>
      </tbody>
      <CastReasonBreakdownTableContents
        badReason={PurifyReason.Unknown}
        casts={purifies}
        possibleReasons={possibleReasons}
        label={reasonLabel}
      />
    </table>
  );
}

function ThreatSummary({
  threat,
  totalTime,
}: {
  threat?: WCLThreatTableResponse;
  totalTime: number;
}): JSX.Element {
  if (!threat) {
    return (
      <tr>
        <td>Active Tanking Time</td>
        <td colSpan={2}>
          <em>Unknown</em>
        </td>
      </tr>
    );
  }

  const tankingTime = threat.threat[0].targets
    .flatMap((entry) => entry.bands)
    .sort((a, b) => a.startTime - b.startTime)
    .reduce((bands, band) => {
      if (bands.length === 0) {
        return [band];
      }

      const prev = bands[bands.length - 1];

      if (prev.endTime > band.startTime) {
        prev.endTime = Math.max(prev.endTime, band.endTime);
      } else {
        bands.push(band);
      }

      return bands;
    }, [] as WCLThreatBand[])
    .reduce((total, band) => total + band.endTime - band.startTime, 0);

  return (
    <tr>
      <td>Active Tanking Time</td>
      <td className="pass-fail-counts">
        {formatDuration(tankingTime)} / {formatDuration(totalTime)}
      </td>
      <td>
        <PassFailBar pass={tankingTime} total={totalTime} />
      </td>
    </tr>
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
    <SubSection title="Purifying Brew" id="purifying-brew">
      <p>
        The primary method of removing damage from your <SpellLink spell={SPELLS.STAGGER} /> pool is
        casting <SpellLink spell={talents.PURIFYING_BREW_TALENT} />. Your goal is twofold:
      </p>
      <ol>
        <li>
          Don't waste any charges of <SpellLink spell={talents.PURIFYING_BREW_TALENT} />
        </li>
        <li>
          Cast <SpellLink spell={talents.PURIFYING_BREW_TALENT} /> when you have relatively high{' '}
          <SpellLink spell={SPELLS.STAGGER} />
        </li>
      </ol>
      <p>
        Due to our mastery, <SpellLink spell={SPELLS.MASTERY_ELUSIVE_BRAWLER} />, moment-to-moment{' '}
        <SpellLink spell={SPELLS.STAGGER} /> level is highly unpredictable. As a result, the most
        reliable way to do this is by{' '}
        <strong>
          casting <SpellLink spell={talents.PURIFYING_BREW_TALENT} /> immediately after being hit by
          a large attack.
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
          purifies={module.purifies}
          amountPurified={module.purifies.reduce(
            (total, purify) => total + purify.purify.amount,
            0,
          )}
          amountStaggered={module.amountStaggered}
          castEfficiency={module.castEfficiency}
          info={info}
        />
        <ProblemList info={info} renderer={PurifyProblem} events={events} problems={problems} />
      </div>
    </SubSection>
  );
}
