import { WCLEventsResponse } from 'common/WCL_TYPES';
import { captureException } from 'common/errorLogger';
import fetchWcl from 'common/fetchWclApi';
import { AnyEvent } from 'parser/core/Events';
import { WCLDungeonPull, WCLFight } from 'parser/core/Fight';
import { PlayerInfo } from 'parser/core/Player';
import Report from 'parser/core/Report';
import { useEffect, useState } from 'react';
import { isCommonError } from '../handleApiError';

interface EventRange {
  target: WCLFight | WCLDungeonPull;
  start_time: number;
  end_time: number;
}

async function* fetchEvents(
  report: Report,
  fight: WCLFight,
  player: Pick<PlayerInfo, 'id'>,
): AsyncGenerator<{ target: EventRange['target']; events: AnyEvent[] }> {
  const timeRanges = fightTimeRanges(fight);

  for (const { target, start_time, end_time } of timeRanges) {
    let events: AnyEvent[] = [];
    let nextStartTime: number | undefined = start_time;
    do {
      const page: WCLEventsResponse = await fetchWcl(`report/events/${report.code}`, {
        start: nextStartTime,
        end: end_time,
        actorid: player.id,
        translate: true,
      });

      events = events.concat(page.events);

      nextStartTime = page.nextPageTimestamp;
    } while (Number.isFinite(nextStartTime));

    yield { target, events };
  }
}

function fightTimeRanges(fight: WCLFight): EventRange[] {
  if (!fight.dungeonPulls) {
    return [{ ...fight, target: fight }];
  }

  return fight.dungeonPulls.map((pull, index, pulls) => {
    const previousEndTime = pulls[index - 1]?.end_time ?? fight.start_time;
    return { target: pull, start_time: previousEndTime, end_time: pull.end_time };
  });
}

export interface DungeonPullEvents {
  target: EventRange['target'];
  events: AnyEvent[];
}

const useEvents = ({
  report,
  fight,
  player,
}: {
  report: Report;
  fight: WCLFight;
  player: Pick<PlayerInfo, 'id'>;
}) => {
  const [events, setEvents] = useState<AnyEvent[] | null>(null);
  const [pulls, setPulls] = useState<DungeonPullEvents[]>([]);
  const [currentTime, setCurrentTime] = useState<number>(fight.start_time);
  const [error, setError] = useState<Error | undefined>();

  useEffect(() => {
    let cancelled = false;
    (async () => {
      let events: AnyEvent[] = [];
      try {
        for await (const range of fetchEvents(report, fight, player)) {
          if (cancelled) {
            break;
          }

          setPulls((pulls) => [...pulls, range]);
          setCurrentTime(range.target.end_time);
          events = events.concat(range.events);
        }
      } catch (err) {
        if (!isCommonError(err)) {
          captureException(err as Error);
        }
        setError(err as Error);
      }

      setEvents(events);
    })();

    return () => {
      cancelled = true;
    };
  }, [report, fight, player]);
  return { events, currentTime, error, pulls };
};

export default useEvents;
