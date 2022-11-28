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
import { SignalListener, VisualizationSpec } from 'react-vega';
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
import MAGIC_SCHOOLS, { color } from 'game/MAGIC_SCHOOLS';
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
import { SpellLink, Tooltip } from 'interface';
import { useCallback, useMemo, useState } from 'react';
import Analyzer from 'parser/core/Analyzer';
import React from 'react';
import { Mitigation, MitigationSegment, MitigationSegments } from './core';
import { formatDuration, formatNumber } from 'common/format';
import CooldownExpandable from 'interface/guide/components/CooldownExpandable';

const MAJOR_ANALYZERS = [CelestialBrew, FortifyingBrew, DampenHarm, DiffuseMagic, ZenMeditation];

const rekey = (key: string) =>
  function <T>(value: T): T & { key: string } {
    return { ...value, key };
  };

type HoverKey = {
  analyzerClass: typeof Analyzer;
  startTime: number;
};

// we have to memo this for reasons unbeknownst to me, but it fixes the onHover not getting called with the null value.
const DamageMitigationChart = React.memo(({ onHover }: { onHover: SignalListener }) => {
  const events = useEvents();
  const info = useInfo();
  const listeners = { hover: onHover };

  // shift to help deal with interpolation slope
  const BUFF_WINDOW_SHIFT = 500;

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

  const buffData = analyzers.flatMap((analyzer) => {
    if (!analyzer) {
      return [];
    }

    return analyzer.mitigations.map((mit, index) => ({
      startTime: mit.start.timestamp - (info?.fightStart ?? 0),
      endTime: mit.end.timestamp - (info?.fightStart ?? 0),
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
          color: color(MAGIC_SCHOOLS.ids.PHYSICAL),
          stroke: 'black',
          strokeWidth: 1.5,
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
          { calculate: `datum.timestamp + ${BUFF_WINDOW_SHIFT}`, as: 'timestamp' },
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
              signalListeners={listeners}
            />
          </div>
        )}
      </AutoSizer>
    </div>
  );
});

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

const BuffBarContainer = styled.div`
  position: relative;
  height: 24px;
`;

const TooltipSegments = styled(MitigationSegments)`
  min-width: 100px;
  display: inline-block;
  background-color: rgba(255, 255, 255, 0.2);
`;

const MitigationDataRow = styled.div`
  display: flex;
  align-items: center;
  align-content: center;
  gap: 1rem;
  line-height: 1em;
  margin-top: 0.4em;
`;

const BuffTooltip = ({
  mitigation,
  segments,
  maxValue,
}: {
  mitigation: Mitigation;
  segments: MitigationSegment[];
  maxValue: number;
}) => {
  const fightStart = useInfo()?.fightStart ?? 0;
  return (
    <div>
      <div>
        <SpellLink id={mitigation.start.ability.guid} />
        {' @ '}
        {formatDuration(mitigation.start.timestamp - fightStart)} -{' '}
        {formatDuration(mitigation.end.timestamp - fightStart)}
      </div>
      <MitigationDataRow>
        <div>Mitigated {formatNumber(mitigation.amount)} Damage</div>
        <TooltipSegments segments={segments} maxValue={maxValue} />
      </MitigationDataRow>
    </div>
  );
};

const useMaxMitigationValue = () => {
  const analyzers = useAnalyzers(MAJOR_ANALYZERS);

  return useMemo(
    () =>
      Math.max.apply(
        null,
        analyzers?.map((analyzer) =>
          Math.max.apply(
            null,
            analyzer.mitigations.map((mit) => mit.amount),
          ),
        ),
      ),
    [analyzers],
  );
};

const BuffDisplay = ({ hoverKey }: { hoverKey: HoverKey | null }) => {
  const info = useInfo();
  const events = useEvents();
  const analyzers = useAnalyzers(MAJOR_ANALYZERS);

  const tooltipData = useCallback(
    (event: ApplyBuffEvent) => {
      const analyzer = analyzers?.find((analyzer) => analyzer.appliesToEvent(event));
      const mit = analyzer?.mitigations.find((mit) => mit.start.timestamp === event.timestamp);

      if (!mit) {
        return undefined;
      }

      return {
        mitigation: mit,
        segments: analyzer!.mitigationSegments(mit),
      };
    },
    [analyzers],
  );

  const maxValue = useMaxMitigationValue();

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
        externalHover: event.timestamp - info.fightStart === hoverKey?.startTime,
        start: event.timestamp - info.fightStart,
        end: expirationTime - info.fightStart,
        ability: event.ability,
        tooltipData: tooltipData(event),
      };
    });

  return (
    <BuffBarContainer>
      {buffEvents.map(({ start, end, ability, externalHover, tooltipData }) => (
        <Tooltip
          key={`${start}-${ability.guid}`}
          hoverable
          content={
            tooltipData ? (
              <BuffTooltip {...tooltipData} maxValue={maxValue} />
            ) : (
              'Unable to locate mitigation data'
            )
          }
          isOpen={externalHover || undefined}
        >
          <BuffBar start={start} end={end} fightDuration={info.fightDuration} />
        </Tooltip>
      ))}
    </BuffBarContainer>
  );
};

const BareTimelineContainer = styled(EmbeddedTimelineContainer)`
  padding: 0;
  background: unset;
`;

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
    <BareTimelineContainer secondWidth={secondWidth} secondsShown={secondsShown}>
      <SpellTimeline>
        <Cooldowns
          start={info.fightStart}
          end={info.fightEnd}
          secondWidth={secondWidth}
          eventsBySpellId={eventsBySpellId}
          abilities={abilities!}
        />
      </SpellTimeline>
    </BareTimelineContainer>
  );
};

const BuffTimelineContainer = styled.div`
  margin-left: 48px;
`;

type MitigationData = { mitigation: Mitigation; segments: MitigationSegment[]; maxValue: number };

const HeaderContainer = styled.div`
  display: grid;
  grid-template-columns: max-content 8em 4em 100px;
  gap: 1em;
  align-items: center;
  align-content: center;
`;

const MitigationCooldownHeader = ({ mitigation, segments, maxValue }: MitigationData) => {
  const fightStart = useInfo()?.fightStart ?? 0;
  return (
    <HeaderContainer>
      <span>{formatDuration(mitigation.start.timestamp - fightStart)}</span>{' '}
      <SpellLink id={mitigation.start.ability.guid} />{' '}
      <span style={{ textAlign: 'right' }}>{formatNumber(mitigation.amount)}</span>{' '}
      <MitigationSegments segments={segments} maxValue={maxValue} />
    </HeaderContainer>
  );
};

const MitigationCooldownBreakdown = (props: MitigationData) => {
  const mitigationSegmentItems = props.segments.map((segment) => ({
    label: segment.tooltip,
    result: (
      <MitigationDataRow>
        <span>{formatNumber(segment.amount)}</span>{' '}
        <TooltipSegments segments={[segment]} maxValue={props.maxValue} />
      </MitigationDataRow>
    ),
  }));
  return (
    <CooldownExpandable
      header={<MitigationCooldownHeader {...props} />}
      detailItems={mitigationSegmentItems}
    />
  );
};

const CooldownUsageList = () => {
  const analyzers = useAnalyzers(MAJOR_ANALYZERS);
  const maxValue = useMaxMitigationValue();

  const mitigations = analyzers.flatMap((analyzer) =>
    analyzer.mitigations.map((mit) => ({ mit, segments: analyzer.mitigationSegments(mit) })),
  );

  return (
    <>
      {mitigations
        .sort((a, b) => a.mit.start.timestamp - b.mit.start.timestamp)
        .map(({ mit, segments }, ix) => (
          <MitigationCooldownBreakdown
            key={ix}
            mitigation={mit}
            segments={segments}
            maxValue={maxValue}
          />
        ))}
    </>
  );
};

export default function MajorDefensivesSection(): JSX.Element | null {
  const info = useInfo();
  const [chartHover, setChartHover] = useState<HoverKey | null>(null);

  const onHover = useCallback((_event: string, item: { key: string[]; startTime: number[] }) => {
    if (item.key === undefined) {
      setChartHover(null);
    } else {
      setChartHover({
        // by construction: we will always find an analyzer
        analyzerClass: MAJOR_ANALYZERS.find((analyzer) => analyzer.name === item.key[0])!,
        startTime: item.startTime[0],
      });
    }
  }, []) as SignalListener;

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
        <DamageMitigationChart onHover={onHover} />
        <BuffTimelineContainer>
          <BuffDisplay hoverKey={chartHover} />
          <AutoSizer disableHeight>{(props) => <DefensiveTimeline {...props} />}</AutoSizer>
        </BuffTimelineContainer>
      </SubSection>
      <SubSection title="Cooldown Usages">
        <CooldownUsageList />
      </SubSection>
    </Section>
  );
}
