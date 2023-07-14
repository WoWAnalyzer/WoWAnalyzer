import { captureException } from 'common/errorLogger';
import ExtendableError from 'es6-error';
import getBuild from 'interface/selectors/url/report/getBuild';
import Config from 'parser/Config';
import CharacterProfile from 'parser/core/CharacterProfile';
import CombatLogParser from 'parser/core/CombatLogParser';
import { MappedEvent, CombatantInfoEvent, EventType } from 'parser/core/Events';
import Fight from 'parser/core/Fight';
import EventEmitter from 'parser/core/modules/EventEmitter';
import { PlayerInfo } from 'parser/core/Player';
import Report from 'parser/core/Report';
import { useEffect, useMemo, useState } from 'react';
import { useLocation } from 'react-router-dom';

const BENCHMARK = false;
// Picking a correct batch duration is hard. I tried various durations to get the batch sizes to 1 frame, but that results in a lot of wasted time waiting for the next frame. 30ms (33 fps) as well causes a lot of wasted time. 60ms (16fps) seem to have really low wasted time while not blocking the UI anymore than a user might expect.
const MAX_BATCH_DURATION = 66.67; // ms
const bench = (id: string) => console.time(id);
const benchEnd = (id: string) => console.timeEnd(id);

export class EventsParseError extends ExtendableError {
  reason?: ExtendableError;
  constructor(reason: ExtendableError) {
    super();
    this.reason = reason;
    this.message = `An error occurred while parsing events: ${reason.message}`;
  }
}

// "Props" is probably not correct in hook, but don't know what to call o/w
interface Props {
  report: Report;
  fight?: Fight;
  config: Config;
  player: PlayerInfo;
  combatants: CombatantInfoEvent[];
  applyTimeFilter: (start: number, end: number) => null;
  applyPhaseFilter: (phase: string, instance: any) => null;
  parserClass?: new (...args: ConstructorParameters<typeof CombatLogParser>) => CombatLogParser;
  characterProfile: CharacterProfile | null;
  events?: MappedEvent[];
  dependenciesLoading?: boolean;
}

const useEventParser = ({
  report,
  fight,
  config,
  player,
  combatants,
  applyTimeFilter,
  applyPhaseFilter,
  parserClass,
  characterProfile,
  events,
  dependenciesLoading,
}: Props) => {
  const [isLoading, setIsLoading] = useState(true);
  const [progress, setProgress] = useState(0);
  const [eventIndex, setEventIndex] = useState(0);

  const location = useLocation();
  const build = getBuild(location.pathname);

  const parser = useMemo(() => {
    // Original code only rendered EventParser if
    // > !this.state.isLoadingParser &&
    // > !this.state.isLoadingCharacterProfile &&
    // > !this.state.isFilteringEvents
    // We have to always run the hook, but the hook should make sure the above is true
    // isLoadingParser => parserClass == null
    // isLoadingCharacterProfile => characterProfile == null
    // isFilteringEvents => events == null
    if (dependenciesLoading) {
      return null;
    }
    const builds = config.builds;
    const buildKey = builds && Object.keys(builds).find((b) => builds[b].url === build);
    builds &&
      Object.keys(builds).forEach((key) => {
        builds[key].active = key === buildKey;
      });
    //set current build to undefined if default build or non-existing build selected
    const parser = new parserClass!(
      config,
      report,
      player,
      fight!,
      combatants,
      characterProfile!,
      buildKey,
    );
    parser.applyTimeFilter = applyTimeFilter;
    parser.applyPhaseFilter = applyPhaseFilter;

    return parser;
  }, [
    fight,
    dependenciesLoading,
    parserClass,
    characterProfile,
    applyPhaseFilter,
    applyTimeFilter,
    report,
    player,
    combatants,
    build,
    config,
  ]);

  const normalizedEvents = useMemo(() => {
    bench('normalizing events');
    if (events === undefined || parser === null) {
      benchEnd('normalizing events');
      return null;
    }
    // The events we fetched will be all events related to the selected player. This includes the `combatantinfo` for the selected player. However we have already parsed this event when we loaded the combatants in the `initializeAnalyzers` of the CombatLogParser. Loading the selected player again could lead to bugs since it would reinitialize and overwrite the existing entity (the selected player) in the Combatants module.
    const result = parser
      .normalize(events.filter((event) => event.type !== EventType.CombatantInfo))
      //sort now normalized events to avoid new fabricated events like "prepull" casts etc being in incorrect order with casts "kept" from before the filter
      .sort((a, b) => a.timestamp - b.timestamp);
    benchEnd('normalizing events');
    return result;
  }, [events, parser]);

  useEffect(() => {
    setEventIndex(0);
    setIsLoading(true);
    setProgress(0);
  }, [normalizedEvents]);

  const eventEmitter = useMemo(() => parser?.getModule(EventEmitter), [parser]);

  useEffect(() => {
    if (parser === null || normalizedEvents === null || eventIndex >= normalizedEvents?.length) {
      return;
    }

    let currentIndex = eventIndex;

    try {
      bench('event loop');
      parser.normalizedEvents = normalizedEvents;

      const start = Date.now();
      while (currentIndex < normalizedEvents.length) {
        eventEmitter?.triggerEvent(normalizedEvents[currentIndex]);
        currentIndex += 1;

        if (!BENCHMARK && Date.now() - start > MAX_BATCH_DURATION) {
          break;
        }
      }
    } catch (err) {
      captureException(err as Error);
      throw new EventsParseError(err as Error);
    } finally {
      setEventIndex(currentIndex);
      setProgress(Math.min(1, currentIndex / normalizedEvents.length));
      if (currentIndex === normalizedEvents.length) {
        parser.finish();
        setIsLoading(false);
      }
      benchEnd('event loop');
    }
  }, [parser, normalizedEvents, eventEmitter, eventIndex]);

  return {
    isLoading,
    progress,
    parser,
  };
};

export default useEventParser;
