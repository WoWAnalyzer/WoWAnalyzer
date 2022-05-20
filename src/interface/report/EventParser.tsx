import { captureException } from 'common/errorLogger';
import sleep from 'common/sleep';
import ExtendableError from 'es6-error';
import { RootState } from 'interface/reducers';
import { getBuild } from 'interface/selectors/url/report';
import Config, { Builds } from 'parser/Config';
import CharacterProfile from 'parser/core/CharacterProfile';
import CombatLogParser from 'parser/core/CombatLogParser';
import { AnyEvent, CombatantInfoEvent, EventType } from 'parser/core/Events';
import Fight from 'parser/core/Fight';
import EventEmitter from 'parser/core/modules/EventEmitter';
import { PlayerInfo } from 'parser/core/Player';
import Report from 'parser/core/Report';
import * as React from 'react';
import { connect } from 'react-redux';
import { RouteComponentProps, withRouter } from 'react-router-dom';
import { compose } from 'redux';

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

interface Props {
  report: Report;
  fight: Fight;
  config: Config;
  player: PlayerInfo;
  combatants: CombatantInfoEvent[];
  applyTimeFilter: (start: number, end: number) => null;
  applyPhaseFilter: (phase: string, instance: any) => null;
  parserClass: new (...args: ConstructorParameters<typeof CombatLogParser>) => CombatLogParser;
  build?: string;
  builds?: Builds;
  characterProfile: CharacterProfile;
  events: AnyEvent[];
  children: (
    isLoading: boolean,
    progress: number,
    parser: CombatLogParser | null,
  ) => React.ReactNode;
}

interface State {
  isLoading: boolean;
  progress: number;
  parser: CombatLogParser | null;
}

class EventParser extends React.PureComponent<Props, State> {
  state = {
    isLoading: true,
    progress: 0,
    parser: null,
  };

  componentDidMount() {
    // noinspection JSIgnoredPromiseFromCall
    this.parse();
  }
  componentDidUpdate(prevProps: Props, prevState: State) {
    const changed =
      this.props.report !== prevProps.report ||
      this.props.fight !== prevProps.fight ||
      this.props.player !== prevProps.player ||
      this.props.combatants !== prevProps.combatants ||
      this.props.parserClass !== prevProps.parserClass ||
      this.props.characterProfile !== prevProps.characterProfile ||
      this.props.events !== prevProps.events ||
      this.props.build !== prevProps.build ||
      this.props.builds !== prevProps.builds;
    if (changed) {
      this.setState({
        isLoading: true,
        progress: 0,
        parser: null,
      });
      // noinspection JSIgnoredPromiseFromCall
      this.parse();
    }
  }

  makeParser() {
    const {
      config,
      report,
      fight,
      combatants,
      player,
      characterProfile,
      build,
      builds,
      parserClass,
    } = this.props;

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
    parser.applyTimeFilter = this.props.applyTimeFilter;
    parser.applyPhaseFilter = this.props.applyPhaseFilter;

    this.setState({
      parser,
    });
    return parser;
  }
  makeEvents(parser: CombatLogParser) {
    let { events } = this.props;
    // The events we fetched will be all events related to the selected player. This includes the `combatantinfo` for the selected player. However we have already parsed this event when we loaded the combatants in the `initializeAnalyzers` of the CombatLogParser. Loading the selected player again could lead to bugs since it would reinitialize and overwrite the existing entity (the selected player) in the Combatants module.
    events = events.filter((event) => event.type !== EventType.CombatantInfo);
    //sort now normalized events to avoid new fabricated events like "prepull" casts etc being in incorrect order with casts "kept" from before the filter
    events = parser.normalize(events).sort((a, b) => a.timestamp - b.timestamp);
    // if in dev
    if (process.env.NODE_ENV !== 'production') {
      // verify events
      const types = new Set<string>(Object.values(EventType));
      // cycle through events
      events.forEach((event) => {
        // do we have the type?
        if (!types.has(event.type)) {
          throw new Error(
            `Unknown event type detected ${event.type} if you created a new type you will need to add it to Event.ts`,
          );
        }
      });
    }
    return events;
  }
  async parse() {
    try {
      bench('total parse');
      bench('initialize');
      const parser = this.makeParser();
      const events = this.makeEvents(parser);
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
          this.setState({
            progress: Math.min(1, eventIndex / numEvents),
          });
          // Delay the next iteration until next frame so the browser doesn't appear to be frozen
          await sleep(0); // eslint-disable-line no-await-in-loop
        }
      }
      parser.finish();
      benchEnd('events');
      benchEnd('total parse');
      this.setState({
        isLoading: false,
        progress: 1,
      });
    } catch (err) {
      captureException(err as Error);
      throw new EventsParseError(err as Error);
    }
  }

  render() {
    return this.props.children(this.state.isLoading, this.state.progress, this.state.parser);
  }
}
const mapStateToProps = (state: RootState, props: RouteComponentProps) => ({
  // Because build comes from the URL we can't use local state
  build: getBuild(props.location.pathname),
});
export default compose(withRouter, connect(mapStateToProps))(EventParser) as typeof EventParser;
