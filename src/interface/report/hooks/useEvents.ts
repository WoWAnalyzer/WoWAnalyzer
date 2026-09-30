import { WCLEventsResponse } from 'common/WCL_TYPES';
import { captureException } from 'common/errorLogger';
import fetchWcl from 'common/fetchWclApi';
import { AnyEvent } from 'parser/core/Events';
import { WCLFight } from 'parser/core/Fight';
import { PlayerInfo } from 'parser/core/Player';
import Report from 'parser/core/Report';
import { useEffect, useState } from 'react';
import { isCommonError } from '../handleApiError';

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
  const [currentTime, setCurrentTime] = useState<number>(fight.start_time);
  const [error, setError] = useState<Error | null>(null);

  const updateState = (error: Error | null, events: AnyEvent[] | null) => {
    setError(error);
    setEvents(events);
  };

  useEffect(() => {
    let cancelled = false;
    // we are using the raw `fetchWcl` here for greater control
    const loadPage = (startTime: number) =>
      fetchWcl<WCLEventsResponse>(`report/events/${report.code}`, {
        start: startTime,
        end: fight.end_time,
        actorid: player.id,
        translate: true,
      });

    const load = async (startTime: number): Promise<AnyEvent[]> => {
      if (cancelled) {
        return [];
      }

      const { events, nextPageTimestamp } = await loadPage(startTime);

      if (!nextPageTimestamp) {
        setCurrentTime(fight.end_time);
        return events;
      } else {
        setCurrentTime(nextPageTimestamp);

        return events.concat(await load(nextPageTimestamp));
      }
    };

    (async () => {
      try {
        const events = await load(fight.start_time);
        updateState(null, events);
      } catch (err) {
        if (!isCommonError(err)) {
          captureException(err as Error);
        }
        updateState(err as Error, null);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [report, fight, player]);

  return { events, currentTime, error };
};

export default useEvents;
