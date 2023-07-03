import CombatLogParser from 'parser/core/CombatLogParser';
import { useEffect, useState } from 'react';
import { AnyEvent } from 'parser/core/Events';

export const useRetrievedEvents = ({
  combatLogParser,
}: {
  combatLogParser: CombatLogParser | null;
}) => {
  const [events, setEvents] = useState<AnyEvent[] | null>(null);

  useEffect(() => {
    const load = async () => {
      if (!combatLogParser) {
        return;
      }
      const events = await combatLogParser.retrieve();
      setEvents(events);
    };

    setEvents(null);
    load();
  }, [combatLogParser]);

  return events;
};
