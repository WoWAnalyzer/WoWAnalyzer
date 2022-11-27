import {
  GoodColor,
  Section,
  SubSection,
  useAnalyzer,
  useAnalyzers,
  useEvents,
  useInfo,
} from 'interface/guide';
import Explanation from 'interface/guide/components/Explanation';
import BaseChart, { defaultConfig, formatTime } from 'parser/ui/BaseChart';
import { VisualizationSpec } from 'react-vega';
import { AutoSizer } from 'react-virtualized';
import {
  AbilityEvent,
  ApplyBuffEvent,
  DamageEvent,
  EventType,
  HasAbility,
} from 'parser/core/Events';
import { DampenHarm } from 'analysis/retail/monk/shared';
import { FortifyingBrew } from './FortifyingBrew';
import { DiffuseMagic } from './DiffuseMagic';
import { ZenMeditation } from './ZenMeditation';
import CelestialBrew from '../../spells/CelestialBrew';
import MAGIC_SCHOOLS from 'game/MAGIC_SCHOOLS';
import EmbeddedTimelineContainer, {
  SpellTimeline,
} from 'interface/report/Results/Timeline/EmbeddedTimeline';
import { isApplicableEvent } from 'interface/report/Results/Timeline/Casts';
import { buffId, MAJOR_DEFENSIVES } from './DefensiveBuffs';
import Cooldowns from 'interface/report/Results/Timeline/Cooldowns';
import Abilities from '../../Abilities';
import { isApplicableUpdateSpellUsableEvent } from 'interface/report/Results/Timeline/Component';
import { defensiveExpiration } from './DefensiveBuffLinkNormalizer';
import styled from '@emotion/styled';
import { Tooltip } from 'interface';

const MAJOR_ANALYZERS = [CelestialBrew, FortifyingBrew, DampenHarm, DiffuseMagic, ZenMeditation];

const rekey = (key: string) =>
  function <T>(value: T): T & { key: string } {
    return { ...value, key };
  };

const DamageMitigationChart = () => {
  const events = useEvents();
  const info = useInfo();
  const physicalData = events
    .filter(
      (event): event is DamageEvent =>
        event.type === EventType.Damage &&
        event.targetID === info?.combatant.id &&
        event.ability.type === MAGIC_SCHOOLS.ids.PHYSICAL,
    )
    .map(rekey('physical'));

  const magicData = events
    .filter(
      (event): event is DamageEvent =>
        event.type === EventType.Damage &&
        event.targetID === info?.combatant.id &&
        event.ability.type !== MAGIC_SCHOOLS.ids.PHYSICAL,
    )
    .map(rekey('magic'));

  const analyzers = useAnalyzers(MAJOR_ANALYZERS);
  const mitigationData = analyzers.flatMap((analyzer) => {
    if (!analyzer) {
      return [];
    }

    return analyzer.mitigations
      .flatMap((mit) => mit.mitigated)
      .map((mit) => ({ ...mit, amount: mit.mitigatedAmount, timestamp: mit.event.timestamp }))
      .map(rekey('.mitigated'));
  });

  // shift to help deal with interpolation slope
  const BUFF_WINDOW_SHIFT = 500;
  const buffData = analyzers.flatMap((analyzer) => {
    if (!analyzer) {
      return [];
    }

    return analyzer.mitigations.map((mit, index) => ({
      startTime: mit.start.timestamp - (info?.fightStart ?? 0) - BUFF_WINDOW_SHIFT,
      endTime: mit.end.timestamp - (info?.fightStart ?? 0) - BUFF_WINDOW_SHIFT,
      amount: mit.amount,
      key: analyzer.constructor.name,
      index,
    }));
  });

  const data = {
    buffs: buffData,
    events: (physicalData as Array<Pick<DamageEvent, 'amount' | 'timestamp'> & { key: string }>)
      .concat(magicData)
      .concat(mitigationData),
  };

  const spec: VisualizationSpec = {
    layer: [
      {
        mark: {
          type: 'rect',
          color: GoodColor,
          opacity: 0.9,
        },
        data: {
          name: 'buffs',
        },
        encoding: {
          x: {
            field: 'startTime',
            type: 'quantitative',
          },
          x2: {
            field: 'endTime',
            type: 'quantitative',
          },
        },
        params: [
          {
            name: 'hover',
            select: {
              type: 'point',
              on: 'mouseover',
              clear: 'mouseout',
              fields: ['key', 'index', 'startTime'],
            },
          },
        ],
      },
      {
        mark: {
          type: 'area',
          interpolate: 'cardinal',
          color: '#bc4949',
          stroke: 'black',
          strokeOpacity: 0.3,
        },
        data: {
          name: 'events',
        },
        transform: [
          { calculate: `datum.timestamp - ${info?.fightStart ?? 0}`, as: 'timestamp' },
          { calculate: 'floor(datum.timestamp / 1000)', as: 'binIx' },
          {
            aggregate: [
              { op: 'sum', as: 'amount', field: 'amount' },
              { op: 'min', as: 'timestamp', field: 'binIx' },
            ],
            groupby: ['binIx'],
          },
          { calculate: 'datum.timestamp * 1000', as: 'timestamp' },
          {
            impute: 'amount',
            key: 'timestamp',
            keyvals: { start: 0, stop: info?.fightDuration ?? 0, step: 1000 },
            value: 0,
          },
        ],
        encoding: {
          x: {
            field: 'timestamp',
            type: 'quantitative',
            axis: {
              labelExpr: formatTime('datum.value'),
              grid: false,
            },
            title: null,
            scale: { zero: true, nice: false },
          },
          y: {
            field: 'amount',
            title: 'Damage Taken per Second',
            type: 'quantitative',
            axis: { format: '~s', grid: false },
            scale: { zero: true, domainMin: 0 },
            stack: true,
          },
        },
      },
    ],
  };

  return (
    <div>
      <AutoSizer disableHeight>
        {({ width }) => (
          <div style={{ display: 'grid', justifyItems: 'end', width }}>
            <BaseChart
              data={data}
              width={width - 50}
              height={200}
              spec={spec}
              config={{ ...defaultConfig, autosize: { type: 'pad', contains: 'content' } }}
              signalListeners={{ hover: (...args) => console.log('hover', ...args) }}
            />
          </div>
        )}
      </AutoSizer>
    </div>
  );
};

const BuffBar = styled.div<{ start: number; end: number; fightDuration: number }>`
  position: absolute;
  border-radius: 3px;
  background-color: ${GoodColor};
  opacity: 90%;
  height: 60%;
  top: 20%;

  width: ${({ start, end, fightDuration }) => ((end - start) / fightDuration) * 100}%;
  left: ${({ start, fightDuration }) => (start / fightDuration) * 100}%;
`;

const BuffDisplay = () => {
  const info = useInfo();
  const events = useEvents();

  if (!info) {
    return null;
  }

  const buffEvents = events
    .filter(
      (event): event is ApplyBuffEvent =>
        event.type === EventType.ApplyBuff &&
        MAJOR_DEFENSIVES.some((data) => buffId(data) === event.ability.guid),
    )
    .map((event) => {
      const expirationTime = defensiveExpiration(event)?.timestamp ?? info.fightEnd;

      return {
        start: event.timestamp - info.fightStart,
        end: expirationTime - info.fightStart,
        ability: event.ability,
      };
    });

  return (
    <div style={{ position: 'relative', height: 24 }}>
      {buffEvents.map(({ start, end, ability }) => (
        <Tooltip key={start} content={ability.name}>
          <BuffBar start={start} end={end} fightDuration={info.fightDuration} />
        </Tooltip>
      ))}
    </div>
  );
};

const DefensiveTimeline = ({ width }: { width: number }) => {
  const info = useInfo();
  const events = useEvents();
  const abilities = useAnalyzer(Abilities);

  if (!info) {
    return null;
  }

  const secondsShown = info.fightDuration / 1000;
  const secondWidth = width / secondsShown;

  const eventsBySpellId = events
    .filter((event) => {
      switch (event.type) {
        case EventType.Cast:
          return isApplicableEvent(info.playerId)(event);
        case EventType.UpdateSpellUsable:
          return isApplicableUpdateSpellUsableEvent(event, info.fightStart);
        case EventType.ApplyBuff:
        case EventType.RemoveBuff:
          return (
            abilities?.getAbility(event.ability.guid)?.timelineCastableBuff === event.ability.guid
          );
        default:
          return false;
      }
    })
    .filter(
      (event): event is AbilityEvent<any> =>
        HasAbility(event) && MAJOR_DEFENSIVES.some(([talent]) => talent.id === event.ability.guid),
    )
    .reduce((map, event) => {
      if (!map.has(event.ability.guid)) {
        map.set(event.ability.guid, []);
      }
      map.get(event.ability.guid)!.push(event);
      return map;
    }, new Map());

  return (
    <EmbeddedTimelineContainer
      secondWidth={secondWidth}
      secondsShown={secondsShown}
      style={{ padding: 0, background: 'unset' }}
    >
      <SpellTimeline>
        <Cooldowns
          start={info.fightStart}
          end={info.fightEnd}
          secondWidth={secondWidth}
          eventsBySpellId={eventsBySpellId}
          abilities={abilities!}
        />
      </SpellTimeline>
    </EmbeddedTimelineContainer>
  );
};

export default function MajorDefensivesSection(): JSX.Element | null {
  const info = useInfo();

  if (!info) {
    return null;
  }

  return (
    <Section title="Major Defensives">
      <Explanation>
        In Dragonflight, Brewmaster Monk has gained multiple major defensive cooldowns. Using these
        effectively is critical for your survival, especially while undergeared.
      </Explanation>
      <SubSection>
        <DamageMitigationChart />
      </SubSection>
      <SubSection style={{ marginLeft: 48 /* hack for chart offset */ }}>
        <BuffDisplay />
        <AutoSizer disableHeight>{(props) => <DefensiveTimeline {...props} />}</AutoSizer>
      </SubSection>
    </Section>
  );
}
