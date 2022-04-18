import { captureException } from 'common/errorLogger';
import { fabricateBossPhaseEvents } from 'common/fabricateBossPhaseEvents';
import { fetchEvents } from 'common/fetchWclApi';
import { makeWclBossPhaseFilter } from 'common/makeWclBossPhaseFilter';
import { PhaseEvent } from 'parser/core/Events';
import { WCLFight } from 'parser/core/Fight';
import Report from 'parser/core/Report';
import { useEffect, useState } from 'react';

import BossPhasesState from '../BOSS_PHASES_STATE';

const useBossPhaseEvents = ({ report, fight }: { report: Report; fight: WCLFight }) => {
  const [loadingState, setLoadingState] = useState<BossPhasesState>(BossPhasesState.LOADING);
  const [events, setEvents] = useState<PhaseEvent[] | null>(null);

  useEffect(() => {
    const loadEvents = async () => {
      const filter = makeWclBossPhaseFilter(fight);

      if (filter) {
        const events = await fetchEvents(
          report.code,
          fight.start_time,
          fight.end_time,
          undefined,
          makeWclBossPhaseFilter(fight),
        );
        return fabricateBossPhaseEvents(events, report, fight);
      } else {
        return null;
      }
    };

    const load = async () => {
      let events = null;
      try {
        events = await loadEvents();
      } catch (err) {
        // The boss events are very nice, but we can still continue without it and just provide the entire fight for analysis.
        // We still want to log the error though, so we can potentially improve this.
        captureException(err as Error);
      }

      setLoadingState(events === null ? BossPhasesState.SKIPPED : BossPhasesState.DONE);
      setEvents(events);
    };

    setLoadingState(BossPhasesState.LOADING);
    setEvents(null);

    load();
  }, [report, fight]);

  return { loadingState, events };
};

export default useBossPhaseEvents;
