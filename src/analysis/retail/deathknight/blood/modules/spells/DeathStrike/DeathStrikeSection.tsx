import styled from '@emotion/styled';
import { Trans } from '@lingui/macro';
import { RuneTracker } from 'analysis/retail/deathknight/shared';
import {
  line,
  point,
  timeAxis,
  normalizeTimestampTransform,
  color as brewColors,
} from 'analysis/retail/monk/brewmaster/modules/charts';
import { formatNumber, formatPercentage } from 'common/format';
import SPELLS from 'common/SPELLS';
import talents from 'common/TALENTS/deathknight';
import MAGIC_SCHOOLS, { color } from 'game/MAGIC_SCHOOLS';
import RESOURCE_TYPES, { getResource } from 'game/RESOURCE_TYPES';
import { ResourceLink, SpellLink, TooltipElement } from 'interface';
import { BadColor, GoodColor, SubSection, useAnalyzers, useEvents, useInfo } from 'interface/guide';
import { ActualCastDescription } from 'interface/guide/components/Apl/violations/claims';
import CastReasonBreakdownTableContents from 'interface/guide/components/CastReasonBreakdownTableContents';
import Explanation from 'interface/guide/components/Explanation';
import { MitigationSegments } from 'interface/guide/components/MajorDefensives/MitigationSegments';
import PassFailBar from 'interface/guide/components/PassFailBar';
import ProblemList, { ProblemRendererProps } from 'interface/guide/components/ProblemList';
import {
  AnyEvent,
  BaseCastEvent,
  EventType,
  HasHitpoints,
  HealEvent,
  HitpointsEvent,
  ResourceActor,
  CastEvent,
  GetRelatedEvent,
} from 'parser/core/Events';
import { Info } from 'parser/core/metric';
import DamageTaken from 'parser/shared/modules/throughput/DamageTaken';
import BaseChart, { defaultConfig } from 'parser/ui/BaseChart';
import { useMemo } from 'react';
import { VisualizationSpec } from 'react-vega';
import AutoSizer from 'react-virtualized-auto-sizer';
import { StringFieldDefWithCondition } from 'vega-lite/build/src/channeldef';
import RunicPowerTracker from '../../runicpower/RunicPowerTracker';
import BloodShield from '../BloodShield/BloodShield';
import DeathStrike, {
  BLOOD_SHIELD_THRESHOLD,
  DeathStrikeProblem,
  DeathStrikeReason,
  DUMP_RP_THRESHOLD,
} from './index';
import { DEATH_STRIKE_CAST, DEATH_STRIKE_HEAL } from './normalizer';

const reasonLabel = (reason: DeathStrikeReason) => {
  switch (reason) {
    case DeathStrikeReason.GoodHealing:
      return <Trans id="blood.guide.death-strike.good-healing">Large Heal</Trans>;
    case DeathStrikeReason.LowHealth:
      return (
        <Trans id="blood.guide.death-strike.low-hp">
          <SpellLink spell={talents.DEATH_STRIKE_TALENT} /> at Low HP
        </Trans>
      );
    case DeathStrikeReason.BloodShield:
      return (
        <TooltipElement
          content={
            <Trans id="blood.guide.death-strike.blood-shield.tooltip">
              Only counts absorbs that mitigate hits for more than{' '}
              <strong>{formatPercentage(BLOOD_SHIELD_THRESHOLD, 0)}%</strong> of your HP.
            </Trans>
          }
        >
          <Trans id="blood.guide.death-strike.blood-shield">
            Generate <SpellLink spell={SPELLS.BLOOD_SHIELD} />
          </Trans>
        </TooltipElement>
      );
    case DeathStrikeReason.DumpRP:
      return (
        <Trans id="blood.guide.death-strike.dump-rp">
          Dump <ResourceLink id={RESOURCE_TYPES.RUNIC_POWER.id} />
        </Trans>
      );
    case DeathStrikeReason.Other:
      return <Trans id="guide.unknown-reason">Other</Trans>;
  }
};

const Table = styled.table`
  td {
    padding: 0 1em;
  }

  th {
    font-weight: bold;
  }

  margin-top: 1em;
`;

const ContentRow = styled.div`
  display: grid;
  grid-template-columns: minmax(40%, max-content) 1fr;
  gap: 1em;
  align-items: start;
`;

const DeathStrikeProblemDescription = ({ data }: { data: DeathStrikeProblem['data'] }) => (
  <div>
    <ActualCastDescription event={data.cast} omitTarget /> while at{' '}
    <strong>{Math.floor(data.runicPower / 10)}</strong>{' '}
    <ResourceLink id={RESOURCE_TYPES.RUNIC_POWER.id} /> and{' '}
    <strong>{formatPercentage(data.hitPoints / data.maxHitPoints, 0)}%</strong> Health.{' '}
    {data.followupDamageTaken ? (
      <>
        In the next few seconds, you took{' '}
        <strong>
          {formatNumber(data.followupDamageTaken + (data.followupAbsorbedDamage ?? 0))}
        </strong>{' '}
        damage that this <SpellLink spell={talents.DEATH_STRIKE_TALENT} /> could have helped
        mitigate.
      </>
    ) : (
      <>This left you low on resources and vulnerable to upcoming damage.</>
    )}
  </div>
);

const deathStrikeTooltip: StringFieldDefWithCondition<any>[] = [
  { field: 'hitPoints', type: 'quantitative', format: '.3~s', title: 'Hit Points' },
  { field: 'amount', type: 'quantitative', format: '.3~s', title: 'Healing' },
  { field: 'overheal', type: 'quantitative', format: '.3~s', title: 'Overhealing' },
  { field: 'runicPower', type: 'quantitative', title: 'Runic Power' },
];

const scaleHitPointTransform = {
  calculate: 'datum.hitPoints / max(datum.maxHitPoints, datum.hitPoints)',
  as: 'hitPoints',
};

const deathStrikeChartSpec = (info: Info, width: number): VisualizationSpec => ({
  vconcat: [
    {
      encoding: {
        x: { ...timeAxis, axis: null },
        y: {
          field: 'hitPoints',
          type: 'quantitative',
          title: 'Hit Points',
          axis: {
            gridOpacity: 0.3,
            format: '~p',
          },
        },
      },
      layer: [
        {
          transform: [normalizeTimestampTransform(info), scaleHitPointTransform],
          ...line('health', brewColors.stagger),
        },
        {
          params: [
            {
              name: 'hover',
              select: { type: 'point', on: 'mouseover', fields: ['timestamp'] },
            },
          ],
          transform: [normalizeTimestampTransform(info), scaleHitPointTransform],
          ...point('otherDeathStrikes', 'white'),
          encoding: {
            tooltip: deathStrikeTooltip,
          },
        },
        {
          transform: [normalizeTimestampTransform(info), scaleHitPointTransform],
          ...point('problemDeathStrike', 'red'),
          encoding: {
            tooltip: deathStrikeTooltip,
          },
        },
      ],
      width,
      height: 100,
    },
    {
      encoding: {
        x: timeAxis,
        y: {
          field: 'amount',
          type: 'quantitative',
          title: 'RP',
          scale: {
            domain: [0, 125],
          },
          axis: {
            values: [0, DUMP_RP_THRESHOLD / 10],
            gridOpacity: 0.3,
          },
        },
      },
      layer: [
        {
          transform: [normalizeTimestampTransform(info)],
          ...line('runicPower', brewColors.potentialStagger),
        },
        {
          transform: [normalizeTimestampTransform(info)],
          ...point('runicPower', 'white'),
          encoding: {
            opacity: {
              condition: { param: 'hover', value: 0.7, empty: false },
              value: 0,
            },
          },
        },
      ],
      width,
      height: 40,
    },
  ],
});

const DeathStrikeProblemChart = ({
  problem,
  events,
  info,
}: ProblemRendererProps<DeathStrikeProblem['data']>) => {
  const backgroundData = useMemo(
    () => ({
      runicPower: events
        .filter(
          (event): event is AnyEvent & Required<Pick<BaseCastEvent<any>, 'classResources'>> =>
            'classResources' in event && event.classResources !== undefined,
        )
        .map((event) => {
          const rp = getResource(event.classResources, RESOURCE_TYPES.RUNIC_POWER.id);

          if (!rp) {
            return undefined;
          }

          return {
            timestamp: event.timestamp,
            amount: rp.amount / 10,
            max: rp.max ?? 125,
          };
        })
        .filter(Boolean),
      health: events.filter(
        (event): event is HitpointsEvent<any> =>
          HasHitpoints(event) &&
          ((event.targetID === info.playerId && event.resourceActor === ResourceActor.Target) ||
            (event.sourceID === info.playerId && event.resourceActor === ResourceActor.Source)),
      ),
    }),
    // doing a clever shallow equality of the events list here to avoid regenerating this data all the time
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [events.length, events[0].timestamp, events.at(-1)?.timestamp, info.playerId],
  );

  const deathStrikeEvents = useMemo(
    () =>
      events.filter(
        (event): event is HealEvent =>
          event.type === EventType.Heal &&
          event.ability.guid === SPELLS.DEATH_STRIKE_HEAL.id &&
          event.targetID === info.playerId,
      ),
    // same trick
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [events.length, events[0].timestamp, events.at(-1)?.timestamp, info.playerId],
  );

  const deathStrikeData = useMemo(() => {
    const problemEvent = GetRelatedEvent<HealEvent>(problem.data.cast, DEATH_STRIKE_HEAL);
    const problemDeathStrike = problemEvent
      ? [
          {
            ...problemEvent,
            hitPoints: problemEvent.hitPoints - problemEvent.amount,
            runicPower: Math.floor(problem.data.runicPower / 10),
          },
        ]
      : [];

    return {
      otherDeathStrikes: deathStrikeEvents
        .filter(
          (event) => event !== GetRelatedEvent<HealEvent>(problem.data.cast, DEATH_STRIKE_HEAL),
        )
        .map((event) => {
          const cast: CastEvent = GetRelatedEvent(event, DEATH_STRIKE_CAST)!;
          const rp = Math.floor(
            (getResource(cast.classResources, RESOURCE_TYPES.RUNIC_POWER.id)?.amount ?? 0) / 10,
          );

          return {
            ...event,
            hitPoints: event.hitPoints - event.amount,
            runicPower: rp,
          };
        }),
      problemDeathStrike,
    };
  }, [problem.data.cast, problem.data.runicPower, deathStrikeEvents]);

  const data = {
    ...backgroundData,
    ...deathStrikeData,
  };

  return (
    <AutoSizer disableHeight>
      {({ width }) => {
        return (
          <BaseChart
            data={data}
            width={width}
            height={180}
            spec={deathStrikeChartSpec(info, width)}
            config={{
              ...defaultConfig,
              concat: {
                spacing: 8,
              },
              autosize: {
                type: 'fit-x',
                contains: 'padding',
              },
            }}
          />
        );
      }}
    </AutoSizer>
  );
};

const DeathStrikeProblemRenderer = ({
  problem,
  events,
  info,
}: ProblemRendererProps<DeathStrikeProblem['data']>) => (
  <div style={{ minHeight: 250 }}>
    <DeathStrikeProblemChart problem={problem} events={events} info={info} />
    <DeathStrikeProblemDescription data={problem.data} />
  </div>
);

export function DeathStrikeSection(): JSX.Element | null {
  const [ds, runes, rp, dtps, bloodShield] = useAnalyzers([
    DeathStrike,
    RuneTracker,
    RunicPowerTracker,
    DamageTaken,
    BloodShield,
  ] as const);

  const info = useInfo();
  const events = useEvents();

  if (!info || !events) {
    return null;
  }

  const runesSpent = runes.runesMaxCasts - runes.runesWasted;

  const healedDamage = ds.totalHealing + bloodShield.totalHealing;
  const totalDamage = dtps.total.effective;
  const healingTarget = totalDamage / 2;

  return (
    <SubSection title="Death Strike Usage">
      <Explanation>
        <p>
          As a Blood Death Knight, <SpellLink spell={talents.DEATH_STRIKE_TALENT} /> is both your
          main defensive tool and one of your strongest damaging abilities. Balancing these two uses
          is important to playing the spec well.
        </p>
        <p>
          There are three main ways that you can use{' '}
          <SpellLink spell={talents.DEATH_STRIKE_TALENT} /> defensively:
          <ul>
            <li>
              You can use it while at <strong>low health</strong> to help recover, or
            </li>
            <li>
              You can use it{' '}
              <TooltipElement
                content={
                  <>
                    <SpellLink spell={talents.DEATH_STRIKE_TALENT} />
                    's healing is based on the total amount of damage you took in the previous 5
                    seconds. This allows you to get a lot of healing from it, even if your HP never
                    gets very low.
                  </>
                }
              >
                after taking lots of damage
              </TooltipElement>{' '}
              for a <strong>large heal</strong>, or
            </li>
            <li>
              You can use it to generate a{' '}
              <strong>
                <SpellLink spell={SPELLS.BLOOD_SHIELD} />
              </strong>{' '}
              absorb <em>before</em> a large Physical hit to help you survive it.
            </li>
          </ul>
        </p>
        <p>
          However, Blood currently has <em>too much</em>{' '}
          <ResourceLink id={RESOURCE_TYPES.RUNIC_POWER.id} /> for you to spend only on defensive
          casts. If you try to only use <SpellLink spell={talents.DEATH_STRIKE_TALENT} />{' '}
          defensively, you will waste most of the RP that you generate. To avoid this, weave casts
          of <SpellLink spell={talents.DEATH_STRIKE_TALENT} /> between your casts of{' '}
          <ResourceLink id={RESOURCE_TYPES.RUNIC_POWER.id} /> generators like{' '}
          <SpellLink spell={talents.HEART_STRIKE_TALENT} /> to keep the extra from going to waste.
          This is called <strong>dumping</strong>{' '}
          <ResourceLink id={RESOURCE_TYPES.RUNIC_POWER.id} />.
        </p>
      </Explanation>
      <ContentRow>
        <Table>
          <thead></thead>
          <tbody>
            <tr>
              <td>Healing Done</td>
              <td>
                {formatNumber(healedDamage)} /{' '}
                <TooltipElement
                  content={
                    <>
                      You took <strong>{formatNumber(totalDamage)}</strong> total damage. The value
                      shown here is a reasonable goal (~50% of damage taken) for how much you can
                      heal back via <SpellLink spell={talents.DEATH_STRIKE_TALENT} /> and{' '}
                      <SpellLink spell={SPELLS.BLOOD_SHIELD} />
                    </>
                  }
                >
                  {formatNumber(healingTarget)}
                </TooltipElement>
              </td>
              <td>
                <MitigationSegments
                  style={{ width: 'calc(100% + 2px)' }}
                  rounded
                  maxValue={Math.max(healingTarget, healedDamage)}
                  segments={[
                    {
                      amount: ds.totalHealing,
                      color: GoodColor,
                      description: (
                        <>
                          Healing by <SpellLink spell={talents.DEATH_STRIKE_TALENT} />
                        </>
                      ),
                    },
                    {
                      amount: bloodShield.totalHealing,
                      color: color(MAGIC_SCHOOLS.ids.PHYSICAL),
                      description: (
                        <>
                          Physical damage absorbed by <SpellLink spell={SPELLS.BLOOD_SHIELD} />
                        </>
                      ),
                    },
                    {
                      amount: Math.max(healingTarget - healedDamage, 0),
                      color: BadColor,
                      description: <>Damage that required other healing.</>,
                    },
                  ]}
                />
              </td>
            </tr>
          </tbody>
          <thead>
            <tr>
              <th colSpan={3}>Resource Usage</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>
                <TooltipElement
                  content={
                    <>
                      <p>
                        While <SpellLink spell={talents.DEATH_STRIKE_TALENT} /> does not cost{' '}
                        <ResourceLink id={RESOURCE_TYPES.RUNES.id} /> itself, every Rune spent
                        generates 10 or more <ResourceLink id={RESOURCE_TYPES.RUNIC_POWER.id} />.
                      </p>
                      <p>
                        You can roughly convert every 4 unspent{' '}
                        <ResourceLink id={RESOURCE_TYPES.RUNES.id} /> into 1 lost{' '}
                        <SpellLink spell={talents.DEATH_STRIKE_TALENT} />.
                      </p>
                    </>
                  }
                >
                  Runes Spent
                </TooltipElement>
              </td>
              <td>
                {runesSpent.toFixed(0)} / {runes.runesMaxCasts}
              </td>
              <td>
                <PassFailBar total={runes.runesMaxCasts} pass={runesSpent} />
              </td>
            </tr>
            <tr>
              <td>Runic Power Spent</td>
              <td>
                {rp.spent} / {rp.spent + rp.wasted}
              </td>
              <td>
                <PassFailBar total={rp.spent + rp.wasted} pass={rp.spent} />
              </td>
            </tr>
          </tbody>
          <thead>
            <tr>
              <th colSpan={3}>Types of Death Strikes</th>
            </tr>
          </thead>
          <CastReasonBreakdownTableContents
            badReason={DeathStrikeReason.Other}
            possibleReasons={[
              DeathStrikeReason.LowHealth,
              DeathStrikeReason.GoodHealing,
              DeathStrikeReason.BloodShield,
              DeathStrikeReason.DumpRP,
              DeathStrikeReason.Other,
            ]}
            label={reasonLabel}
            casts={ds?.casts ?? []}
          />
        </Table>
        <ProblemList
          info={info}
          problems={ds.problems}
          events={events}
          renderer={DeathStrikeProblemRenderer}
        />
      </ContentRow>
    </SubSection>
  );
}
