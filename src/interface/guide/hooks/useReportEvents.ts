import { fetchEvents } from 'common/fetchWclApi';
import { AnyEvent } from 'parser/core/Events';
import { useState, useEffect } from 'react';

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
      const events = await fetchEvents(reportCode, startTime, endTime, undefined, filter);

      if (!cancelled) {
        setData(events);
      }
    };

    run();

    return () => {
      cancelled = true;
    };
  }, [reportCode, startTime, endTime, filter]);

  return data;
}
