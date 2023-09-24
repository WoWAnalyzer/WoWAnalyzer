import { fetchEvents } from 'common/fetchWclApi';
import { AnyEvent } from 'parser/core/Events';
import { WCLFight } from 'parser/core/Fight';
import { PlayerInfo } from 'parser/core/Player';
import Report from 'parser/core/Report';
import { useEffect, useState } from 'react';

const PAGE_SIZE = 5 * 60 * 1000;
const FORCE_PAGES_SIZE = 15 * 60 * 1000;

const fightPageCount = (fight: WCLFight) =>
  fight.end_time - fight.start_time >= FORCE_PAGES_SIZE
    ? Math.ceil((fight.end_time - fight.start_time) / PAGE_SIZE)
    : 1;

const useEvents = ({
  report,
  fight,
  player,
}: {
  report: Report;
  fight: WCLFight;
  player: PlayerInfo;
}) => {
  const [events, setEvents] = useState<AnyEvent[] | null>(null);
  // we manually paginate here. WCL could turn pagination back on in the WCL API but the amount loaded per page is too low
  // for M+ to be usable without deeper changes on the WCL side.
  const pageCount = fightPageCount(fight);
  const [pagesLoaded, setPagesLoaded] = useState(0);

  useEffect(() => {
    let cancelled = false;
    const loadPage = async (startTime: number, endTime: number) => {
      return await fetchEvents(report.code, startTime, endTime, player.id);
    };

    const load = async () => {
      if (fight.end_time - fight.start_time < FORCE_PAGES_SIZE) {
        // short circuit for fights below the cutoff
        setEvents(null);
        const events = await loadPage(fight.start_time, fight.end_time);
        if (cancelled) {
          return;
        }
        setEvents(events);
        setPagesLoaded(1);
      } else {
        // we need to paginate.
        let nextStartTime = fight.start_time;
        let partialEvents: AnyEvent[] = [];
        while (nextStartTime < fight.end_time) {
          const endTime = Math.min(fight.end_time, nextStartTime + PAGE_SIZE);
          const page = await loadPage(nextStartTime, endTime);
          if (cancelled) {
            return;
          }
          partialEvents = partialEvents.concat(page);
          setPagesLoaded((pages) => pages + 1);
          nextStartTime += PAGE_SIZE;
        }

        setEvents(partialEvents);
      }
    };

    load();

    return () => {
      cancelled = true;
    };
  }, [report, fight, player]);

  return { events, pageCount, pagesLoaded };
};

export default useEvents;
