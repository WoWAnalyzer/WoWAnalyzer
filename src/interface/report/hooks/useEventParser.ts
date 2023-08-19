import { captureException } from 'common/errorLogger';
import ExtendableError from 'es6-error';
import getBuild from 'interface/selectors/url/report/getBuild';
import Config from 'parser/Config';
import CharacterProfile from 'parser/core/CharacterProfile';
import CombatLogParser from 'parser/core/CombatLogParser';
import { AnyEvent, CombatantInfoEvent, EventType } from 'parser/core/Events';
import Fight from 'parser/core/Fight';
import EventEmitter from 'parser/core/modules/EventEmitter';
import { PlayerInfo } from 'parser/core/Player';
import Report from 'parser/core/Report';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';

const BENCHMARK = false;
// Picking a correct batch duration is hard. I tried various durations to get the batch sizes to 1 frame, but that results in a lot of wasted time waiting for the next frame. 30ms (33 fps) as well causes a lot of wasted time. 60ms (16fps) seem to have really low wasted time while not blocking the UI anymore than a user might expect.
const MAX_BATCH_DURATION = 32; // ms
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
  events?: AnyEvent[];
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
  const eventIndexRef = useRef(0);

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
    eventIndexRef.current = 0;
    setProgress(0);
    setIsLoading(true);
    return result;
  }, [events, parser, eventIndexRef]);

  const eventEmitter = useMemo(() => parser?.getModule(EventEmitter), [parser]);

  const processEventBatch = useCallback(() => {
    let done = false;
    if (
      parser === null ||
      normalizedEvents === null ||
      eventIndexRef.current >= normalizedEvents?.length
    ) {
      return done;
    }

    let currentIndex = eventIndexRef.current;

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
      eventIndexRef.current = currentIndex;
      setProgress(Math.min(1, currentIndex / normalizedEvents.length));
      if (currentIndex === normalizedEvents.length) {
        done = true;
        parser.finish();
        setIsLoading(false);
      }
      benchEnd('event loop');
    }

    return done;
  }, [parser, normalizedEvents, eventEmitter]);

  useEffect(() => {
    // this setup handles event processing with relatively minimal blocking of the UI thread
    //
    // `requestIdleCallback` adds our callback to the queue to run the next time the browser is idle, aka not busy with animation or user input.
    // The `timeout` option causes it to be added to the queue immediately if that does not occur within `timeout` ms (here, 50 ms)
    //
    // As long as event processing isn't done, we keep requesting idle callbacks to process batches. Once we're done (or the component is unmounted),
    // we end the loop by not calling `next()`
    let isCancelled = false;
    const next = () =>
      requestIdleCallback(
        () => {
          const done = processEventBatch();

          if (!done && !isCancelled) {
            next();
          }
        },
        { timeout: 50 },
      );

    next();

    return () => {
      isCancelled = true;
    };
  }, [processEventBatch]);

  return {
    isLoading,
    progress,
    parser,
  };
};

export default useEventParser;
