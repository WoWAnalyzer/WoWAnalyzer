import { captureException } from 'common/errorLogger';
import sleep from 'common/sleep';
import ExtendableError from 'es6-error';
import getBuild from 'interface/selectors/url/report/getBuild';
import Config, { Builds } from 'parser/Config';
import CharacterProfile from 'parser/core/CharacterProfile';
import CombatLogParser from 'parser/core/CombatLogParser';
import { AnyEvent, CombatantInfoEvent, EventType } from 'parser/core/Events';
import Fight from 'parser/core/Fight';
import EventEmitter from 'parser/core/modules/EventEmitter';
import { PlayerInfo } from 'parser/core/Player';
import Report from 'parser/core/Report';
import { useEffect, useState } from 'react';
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
  builds?: Builds;
  characterProfile: CharacterProfile | null;
  events?: AnyEvent[];
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
  builds,
  characterProfile,
  events,
}: Props) => {
  const [isLoading, setIsLoading] = useState(true);
  const [progress, setProgress] = useState(0);
  const [parser, setParser] = useState<CombatLogParser | null>(null);
  const location = useLocation();

  const build = getBuild(location.pathname);

  useEffect(() => {
    // Original code only rendered EventParser if
    // > !this.state.isLoadingParser &&
    // > !this.state.isLoadingCharacterProfile &&
    // > !this.state.isFilteringEvents
    // We have to always run the hook, but the hook should make sure the above is true
    // isLoadingParser => parserClass == null
    // isLoadingCharacterProfile => characterProfile == null
    // isFilteringEvents => events == null
    if (fight == null || parserClass == null || characterProfile == null || events == null) {
      return;
    }

    const makeParser = () => {
      const buildKey = builds && Object.keys(builds).find((b) => builds[b].url === build);
      builds &&
        Object.keys(builds).forEach((key) => {
          builds[key].active = key === buildKey;
        });
      //set current build to undefined if default build or non-existing build selected
      const parser = new parserClass(
        config,
        report,
        player,
        fight,
        combatants,
        characterProfile,
        buildKey,
      );
      parser.applyTimeFilter = applyTimeFilter;
      parser.applyPhaseFilter = applyPhaseFilter;

      setParser(parser);

      return parser;
    };

    const makeEvents = (parser: CombatLogParser) => {
      let _events = events;
      // The events we fetched will be all events related to the selected player. This includes the `combatantinfo` for the selected player. However we have already parsed this event when we loaded the combatants in the `initializeAnalyzers` of the CombatLogParser. Loading the selected player again could lead to bugs since it would reinitialize and overwrite the existing entity (the selected player) in the Combatants module.
      _events = _events.filter((event) => event.type !== EventType.CombatantInfo);
      //sort now normalized events to avoid new fabricated events like "prepull" casts etc being in incorrect order with casts "kept" from before the filter
      _events = parser.normalize(_events).sort((a, b) => a.timestamp - b.timestamp);
      return _events;
    };

    const parse = async () => {
      try {
        bench('total parse');
        bench('initialize');
        const parser = makeParser();
        const events = makeEvents(parser);
        parser.normalizedEvents = events;

        const numEvents = events.length;

        const eventEmitter = parser.getModule(EventEmitter);
        benchEnd('initialize');
        bench('events');
        let eventIndex = 0;
        while (eventIndex < numEvents) {
          const start = Date.now();
          while (eventIndex < numEvents) {
            eventEmitter.triggerEvent(events[eventIndex]);
            eventIndex += 1;

            if (!BENCHMARK && Date.now() - start > MAX_BATCH_DURATION) {
              break;
            }
          }
          if (!BENCHMARK) {
            setProgress(Math.min(1, eventIndex / numEvents));
            // Delay the next iteration until next frame so the browser doesn't appear to be frozen
            await sleep(0); // eslint-disable-line no-await-in-loop
          }
        }
        parser.finish();
        benchEnd('events');
        benchEnd('total parse');

        setIsLoading(false);
        setProgress(1);
      } catch (err) {
        captureException(err as Error);
        throw new EventsParseError(err as Error);
      }
    };

    setIsLoading(true);
    setProgress(0);
    setParser(null);

    parse();
  }, [
    report,
    fight,
    player,
    combatants,
    parserClass,
    characterProfile,
    events,
    build,
    builds,
    config,
    applyTimeFilter,
    applyPhaseFilter,
  ]);

  return {
    isLoading,
    progress,
    parser,
  };
};

export default useEventParser;
