import EventsRetriever from 'parser/core/EventsRetriever';
import { AnyEvent } from 'parser/core/Events';
import { fetchEventsView } from 'common/fetchWclApi';
import Report from 'parser/core/Report';
import Fight from 'parser/core/Fight';

const fetchDeathEvents = (report: Report, fight: Fight, friendly: boolean) =>
  fetchEventsView('deaths', report.code, fight.start_time, fight.end_time, undefined, {
    hostility: friendly ? 0 : 1,
  });

export default class DeathEventsRetriever extends EventsRetriever {
  retrieve(): Promise<AnyEvent[]> {
    return Promise.all([
      // friendly deaths
      fetchDeathEvents(this.owner.report, this.owner.fight, true),
      // hostile deaths
      fetchDeathEvents(this.owner.report, this.owner.fight, false),
    ]).then((allDeaths) => allDeaths.flat());
  }
}
