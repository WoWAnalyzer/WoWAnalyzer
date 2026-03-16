import { formatDuration, formatNumber } from 'common/format';
import { SpellLink, Tooltip } from 'interface';
import { GoodColor, useAnalyzer, useEvents, useInfo } from 'interface/guide';
import { AbilityEvent, EventType, HasAbility } from 'parser/core/Events';
import { useCallback, useMemo, useState, type JSX } from 'react';
import { SignalListener } from 'react-vega';
import AutoSizer from 'react-virtualized-auto-sizer';
import {
  EmbeddedTimelineContainer,
  SpellTimeline,
} from 'interface/report/Results/Timeline/EmbeddedTimeline';
import Abilities from 'parser/core/modules/Abilities';
import { isApplicableEvent } from 'interface/report/Results/Timeline/Casts';
import { isApplicableUpdateSpellUsableEvent } from 'interface/report/Results/Timeline/Component';
import Cooldowns from 'interface/report/Results/Timeline/Cooldowns';
import { DamageMitigationChart } from './DamageMitigationChart';
import {
  MitigationSegment,
  MitigationSegments,
} from 'interface/guide/components/MajorDefensives/MitigationSegments';
import MajorDefensive, {
  Mitigation,
} from 'interface/guide/components/MajorDefensives/MajorDefensiveAnalyzer';
import Spell from 'common/SPELLS/Spell';
import styles from './Timeline.module.scss';

interface HoverKey {
  startTime: number;
}

const BuffBar = ({
  start,
  end,
  fightDuration,
}: {
  start: number;
  end: number;
  fightDuration: number;
}) => (
  <div
    className={styles.buffBar}
    style={{
      backgroundColor: GoodColor,
      width: `${((end - start) / fightDuration) * 100}%`,
      left: `${(start / fightDuration) * 100}%`,
    }}
  />
);

const MitigationLabel = ({ mitigation, long }: { mitigation: Mitigation; long?: boolean }) => {
  const fightStart = useInfo()?.fightStart ?? 0;
  return (
    <>
      <SpellLink spell={mitigation.start.ability.guid} />
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
  mitigation: Mitigation;
  segments: MitigationSegment[];
  maxValue: number;
}) => {
  return (
    <div>
      <div>
        <MitigationLabel mitigation={mitigation} />
      </div>
      <div className={styles.mitigationDataRow}>
        <div>Mitigated {formatNumber(mitigation.amount)} Damage</div>
        <MitigationSegments
          segments={segments}
          maxValue={maxValue}
          className={styles.tooltipSegments}
        />
      </div>
    </div>
  );
};

export const useMaxMitigationValue = <Apply extends EventType, Remove extends EventType>(
  analyzers: readonly MajorDefensive<Apply, Remove>[],
) => {
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

const BuffDisplay = <Apply extends EventType, Remove extends EventType>({
  analyzers,
  hoverKey,
}: {
  hoverKey: HoverKey | null;
  analyzers: readonly MajorDefensive<Apply, Remove>[];
}) => {
  const info = useInfo();

  const maxValue = useMaxMitigationValue(analyzers);

  if (!info) {
    return null;
  }

  const mitigations = analyzers.flatMap((analyzer) =>
    analyzer.mitigations.map((mit) => ({
      mit,
      ability: analyzer.spell,
      segments: analyzer.mitigationSegments(mit),
    })),
  );

  const buffEvents = mitigations.map(({ mit, ability, segments }) => {
    return {
      externalHover: mit.start.timestamp - info.fightStart === hoverKey?.startTime,
      start: mit.start.timestamp - info.fightStart,
      end: mit.end.timestamp - info.fightStart,
      ability,
      tooltipData: {
        mitigation: mit,
        segments,
      },
    };
  });

  return (
    <div className={styles.buffBarContainer}>
      {buffEvents.map(({ start, end, ability, externalHover, tooltipData }) => (
        <Tooltip
          key={`${start}-${ability.id}`}
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
    </div>
  );
};

const DefensiveTimeline = ({ width, spells }: { width: number; spells: Spell[] }) => {
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
      // oxlint-disable-next-line typescript-eslint/no-explicit-any -- Baseline suppression. Try to fix if you edit this code.
      (event): event is AbilityEvent<any> =>
        HasAbility(event) && spells.some((spell) => spell.id === event.ability.guid),
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
      className={styles.bareTimelineContainer}
    >
      <SpellTimeline>
        <Cooldowns
          start={info.fightStart}
          end={info.fightEnd}
          secondWidth={secondWidth}
          eventsBySpellId={eventsBySpellId}
          abilities={abilities!}
          exactlySpells={spells.filter((spell) => abilities?.getAbility(spell.id))}
        />
      </SpellTimeline>
    </EmbeddedTimelineContainer>
  );
};

interface Props<Apply extends EventType, Remove extends EventType> {
  analyzers: readonly MajorDefensive<Apply, Remove>[];
  yScale?: number;
}

export default function Timeline<Apply extends EventType, Remove extends EventType>({
  analyzers,
  yScale,
}: Props<Apply, Remove>): JSX.Element | null {
  const info = useInfo();
  const [chartHover, setChartHover] = useState<HoverKey | null>(null);

  const spells = analyzers.map((analyzer) => analyzer.spell);

  const onHover = useCallback((_event: string, item: { key: string[]; startTime: number[] }) => {
    if (item.key === undefined) {
      setChartHover(null);
    } else {
      setChartHover({
        startTime: item.startTime[0],
      });
    }
  }, []) as SignalListener;

  if (!info) {
    return null;
  }

  return (
    <>
      <DamageMitigationChart onHover={onHover} analyzers={analyzers} yScale={yScale} />
      <div className={styles.buffTimelineContainer}>
        <BuffDisplay hoverKey={chartHover} analyzers={analyzers} />
        <AutoSizer disableHeight>
          {(props) => <DefensiveTimeline spells={spells} {...props} />}
        </AutoSizer>
      </div>
    </>
  );
}
