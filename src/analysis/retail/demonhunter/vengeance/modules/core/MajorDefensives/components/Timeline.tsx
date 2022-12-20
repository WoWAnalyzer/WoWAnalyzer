import styled from '@emotion/styled';
import { formatDuration, formatNumber } from 'common/format';
import { SpellLink, Tooltip } from 'interface';
import { GoodColor, useAnalyzer, useAnalyzers, useEvents, useInfo } from 'interface/guide';
import Analyzer from 'parser/core/Analyzer';
import { AbilityEvent, ApplyBuffEvent, EventType, HasAbility } from 'parser/core/Events';
import { useCallback, useMemo, useState } from 'react';
import { SignalListener } from 'react-vega';
import { AutoSizer } from 'react-virtualized';
import { Mitigation, MitigationSegment, MitigationSegments } from '../core';
import { defensiveExpiration } from '../DefensiveBuffLinkNormalizer';
import { buffId, MAJOR_DEFENSIVES } from '../DefensiveBuffs';
import EmbeddedTimelineContainer, {
  SpellTimeline,
} from 'interface/report/Results/Timeline/EmbeddedTimeline';
import Abilities from 'parser/core/modules/Abilities';
import { isApplicableEvent } from 'interface/report/Results/Timeline/Casts';
import { isApplicableUpdateSpellUsableEvent } from 'interface/report/Results/Timeline/Component';
import Cooldowns from 'interface/report/Results/Timeline/Cooldowns';
import { MAJOR_ANALYZERS, TIMELINE_ANALYZERS } from '../config';
import { DamageMitigationChart } from './DamageMitigationChart';
import { isTalent } from 'common/TALENTS/types';

type HoverKey = {
  analyzerClass: typeof Analyzer;
  startTime: number;
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

const BuffBarContainer = styled.div`
  position: relative;
  height: 24px;
`;

const TooltipSegments = styled(MitigationSegments)`
  min-width: 100px;
  width: 100px;
  display: inline-block;
`;

const MitigationDataRow = styled.div`
  display: flex;
  align-items: center;
  align-content: center;
  gap: 1rem;
  line-height: 1em;
  margin-top: 0.4em;
`;

export const MitigationLabel = <
  ApplyEventType extends EventType,
  RemoveEventType extends EventType
>({
  mitigation,
  long,
}: {
  mitigation: Mitigation<ApplyEventType, RemoveEventType>;
  long?: boolean;
}) => {
  const fightStart = useInfo()?.fightStart ?? 0;
  return (
    <>
      <SpellLink id={mitigation.start.ability.guid} />
      {long ? ', active from ' : ' @ '}
      {formatDuration(mitigation.start.timestamp - fightStart)}
      {long ? ' to ' : ' - '}
      {formatDuration(mitigation.end.timestamp - fightStart)}
    </>
  );
};

const BuffTooltip = ({
  mitigation,
  segments,
  maxValue,
}: {
  mitigation: Mitigation<EventType.ApplyBuff, EventType.RemoveBuff>;
  segments: MitigationSegment[];
  maxValue: number;
}) => {
  return (
    <div>
      <div>
        <MitigationLabel mitigation={mitigation} />
      </div>
      <MitigationDataRow>
        <div>Mitigated {formatNumber(mitigation.amount)} Damage</div>
        <TooltipSegments segments={segments} maxValue={maxValue} />
      </MitigationDataRow>
    </div>
  );
};

export const useMaxMitigationValue = () => {
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
  const analyzers = useAnalyzers(TIMELINE_ANALYZERS);

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
          exactlySpells={MAJOR_DEFENSIVES.map(([talent]) => talent).filter(
            (talent) =>
              !isTalent(talent) || (isTalent(talent) && info?.combatant.hasTalent(talent)),
          )}
        />
      </SpellTimeline>
    </BareTimelineContainer>
  );
};

const BuffTimelineContainer = styled.div`
  margin-left: 48px;
`;

export default function Timeline(): JSX.Element | null {
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
    <>
      <DamageMitigationChart onHover={onHover} />
      <BuffTimelineContainer>
        <BuffDisplay hoverKey={chartHover} />
        <AutoSizer disableHeight>{(props) => <DefensiveTimeline {...props} />}</AutoSizer>
      </BuffTimelineContainer>
    </>
  );
}
