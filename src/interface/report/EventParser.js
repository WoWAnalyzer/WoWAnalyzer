import React from 'react';
import PropTypes from 'prop-types';
import ExtendableError from 'es6-error';

import sleep from 'common/sleep';
import { captureException } from 'common/errorLogger';
import EventEmitter from 'parser/core/modules/EventEmitter';

const BENCHMARK = true;
// Picking a correct batch duration is hard. I tried various durations to get the batch sizes to 1 frame, but that results in a lot of wasted time waiting for the next frame. 30ms (33 fps) as well causes a lot of wasted time. 60ms (16fps) seem to have really low wasted time while not blocking the UI anymore than a user might expect.
const MAX_BATCH_DURATION = 66.67; // ms
const TIME_AVAILABLE = console.time && console.timeEnd;
const bench = id => TIME_AVAILABLE && console.time(id);
const benchEnd = id => TIME_AVAILABLE && console.timeEnd(id);

export class EventsParseError extends ExtendableError {
  reason = null;
  constructor(reason) {
    super();
    this.reason = reason;
  }
}

class EventParser extends React.PureComponent {
  static propTypes = {
    report: PropTypes.shape({
      title: PropTypes.string.isRequired,
      code: PropTypes.string.isRequired,
    }).isRequired,
    fight: PropTypes.shape({
      start_time: PropTypes.number.isRequired,
      end_time: PropTypes.number.isRequired,
      boss: PropTypes.number.isRequired,
    }).isRequired,
    player: PropTypes.shape({
      name: PropTypes.string.isRequired,
      id: PropTypes.number.isRequired,
      guid: PropTypes.number.isRequired,
      type: PropTypes.string.isRequired,
    }).isRequired,

    combatants: PropTypes.arrayOf(PropTypes.shape({
      sourceID: PropTypes.number.isRequired,
    })),
    parserClass: PropTypes.func.isRequired,
    characterProfile: PropTypes.object,
    events: PropTypes.array.isRequired,
    children: PropTypes.func.isRequired,
  };

  constructor(props) {
    super(props);
    this.state = {
      isLoading: true,
      progress: 0,
      parser: null,
    };
  }

  componentDidMount() {
    // noinspection JSIgnoredPromiseFromCall
    this.parse();
  }
  componentDidUpdate(prevProps, prevState, prevContext) {
    const changed = this.props.report !== prevProps.report
      || this.props.fight !== prevProps.fight
      || this.props.player !== prevProps.player
      || this.props.combatants !== prevProps.combatants
      || this.props.parserClass !== prevProps.parserClass
      || this.props.characterProfile !== prevProps.characterProfile
      || this.props.events !== prevProps.events;
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
    const { report, fight, combatants, player, characterProfile, parserClass } = this.props;
    const parser = new parserClass(report, player, fight, combatants, characterProfile);
    this.setState({
      parser,
    });
    return parser;
  }
  makeEvents(parser) {
    let { events } = this.props;
    // The events we fetched will be all events related to the selected player. This includes the `combatantinfo` for the selected player. However we have already parsed this event when we loaded the combatants in the `initializeAnalyzers` of the CombatLogParser. Loading the selected player again could lead to bugs since it would reinitialize and overwrite the existing entity (the selected player) in the Combatants module.
    events = events.filter(event => event.type !== 'combatantinfo');
    events = parser.normalize(events);
    return events;
  }
  async parse() {
    try {
      bench('total parse');
      bench('initialize');
      const parser = this.makeParser();
      const events = this.makeEvents(parser);

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

          if (!BENCHMARK && (Date.now() - start) > MAX_BATCH_DURATION) {
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
      captureException(err);
      throw new EventsParseError(err);
    }
  }

  render() {
    return this.props.children(this.state.isLoading, this.state.progress, this.state.parser);
  }
}

export default EventParser;
