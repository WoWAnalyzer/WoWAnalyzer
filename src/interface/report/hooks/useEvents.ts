import { captureException } from 'common/errorLogger';
import { useAnalysisDataSource } from 'report-data/AnalysisDataSourceContext';
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
  const dataSource = useAnalysisDataSource();

  const updateState = (error: Error | null, events: AnyEvent[] | null) => {
    setError(error);
    setEvents(events);
  };

  useEffect(() => {
    let cancelled = false;
    const controller = new AbortController();
    const load = async (startTime: number): Promise<AnyEvent[]> => {
      if (cancelled) {
        return [];
      }

      const events = await dataSource.loadEvents({
        fightId: fight.id,
        start: startTime,
        end: fight.end_time,
        actorId: player.id,
        signal: controller.signal,
        onProgress: (progress) => {
          if (!cancelled) {
            setCurrentTime(fight.start_time + (fight.end_time - fight.start_time) * progress);
          }
        },
      });
      setCurrentTime(fight.end_time);
      return events;
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
      controller.abort();
    };
  }, [report, fight, player, dataSource]);

  return { events, currentTime, error };
};

export default useEvents;
