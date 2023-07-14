import { fetchEvents } from 'common/fetchWclApi';
import { MappedEvent } from 'parser/core/Events';
import { WCLFight } from 'parser/core/Fight';
import { PlayerInfo } from 'parser/core/Player';
import Report from 'parser/core/Report';
import { useEffect, useState } from 'react';

const useEvents = ({
  report,
  fight,
  player,
}: {
  report: Report;
  fight: WCLFight;
  player: PlayerInfo;
}) => {
  const [events, setEvents] = useState<MappedEvent[] | null>(null);

  useEffect(() => {
    const load = async () => {
      const events = await fetchEvents(report.code, fight.start_time, fight.end_time, player.id);

      setEvents(events);
    };

    setEvents(null);
    load();
  }, [report, fight, player]);

  return events;
};

export default useEvents;
