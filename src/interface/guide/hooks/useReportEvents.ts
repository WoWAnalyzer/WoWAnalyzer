import { AnyEvent } from 'parser/core/Events';
import { useState, useEffect } from 'react';
import { useAnalysisDataSource } from 'report-data/AnalysisDataSourceContext';
import { useFight } from 'interface/report/context/FightContext';

/**
 * Fetch report events from WCL. This is a wrapper around the internal `fetchEvents` API.
 */
export default function useReportEvents(
  reportCode: string | undefined,
  startTime: number | undefined,
  endTime: number | undefined,
  filter: string,
): AnyEvent[] | undefined {
  const [data, setData] = useState<AnyEvent[] | undefined>();
  const source = useAnalysisDataSource();
  const { fight } = useFight();

  useEffect(() => {
    if (!reportCode || !startTime || !endTime) {
      return;
    }
    if (filter.length === 0) {
      console.error('attempted useReportEvents with no filter');
      return;
    }
    let cancelled = false;

    const run = async () => {
      if (!source.loadFilteredEvents) {
        setData([]);
        return;
      }
      const events = await source.loadFilteredEvents({
        fightId: fight.id,
        start: startTime,
        end: endTime,
        filter,
      });

      if (!cancelled) {
        setData(events);
      }
    };

    run();

    return () => {
      cancelled = true;
    };
  }, [reportCode, startTime, endTime, filter, source, fight.id]);

  return data;
}
