import { captureException } from 'common/errorLogger';
import Events from '../Events';

import Module from '../Module';
import { SELECTED_PLAYER, SELECTED_PLAYER_PET } from '../Analyzer';
import EventFilter from '../EventFilter';

const CATCH_ALL_EVENT = 'event';

const PROFILE = false;

/**
 * This (core) module takes care of:
 * - tracking attached event listeners
 * - filtering event listeners (as configured in EventFilter)
 * - firing event listeners
 */
class EventEmitter extends Module {
  static get catchAll() {
    return new EventFilter(CATCH_ALL_EVENT);
  }

  constructor(options) {
    super(options);
    if (PROFILE) {
      this.addEventListener(Events.fightend, this.reportModuleTimes.bind(this), this);
    }
  }

  _eventListenersByEventType = {};
  /**
   * @param {string|EventFilter} eventFilter
   * @param {function} listener
   * @param {Module} module
   */
  addEventListener(eventFilter, listener, module) {
    const eventType = eventFilter instanceof EventFilter ? eventFilter.eventType : eventFilter;
    this._eventListenersByEventType[eventType] = this._eventListenersByEventType[eventType] || [];
    this._eventListenersByEventType[eventType].push({
      eventFilter,
      module, // used when the listener throws an exception to disable the related module
      listener: this._compileListener(eventFilter, listener, module),
    });
  }
  _compileListener(eventFilter, listener, module) {
    listener = this._prependCounter(listener);
    if (eventFilter instanceof EventFilter) {
      listener = this._prependFilters(eventFilter, listener);
    }
    // We need to prepend this last so it's at the top level (the first check)
    listener = this._prependActiveCheck(listener, module);
    return listener;
  }
  _actualExecutions = 0;
  _prependCounter(listener) {
    return event => {
      this._actualExecutions += 1;
      listener(event);
    };
  }
  _prependActiveCheck(listener, module) {
    return function (event) {
      if (module.active) {
        listener(event);
      }
    };
  }
  _prependFilters(eventFilter, listener) {
    const by = eventFilter.by();
    if (by) {
      listener = this._prependByCheck(listener, by);
    }
    const to = eventFilter.to();
    if (to) {
      listener = this._prependToCheck(listener, to);
    }
    const spell = eventFilter.spell();
    if (spell) {
      listener = this._prependSpellCheck(listener, spell);
    }
    return listener;
  }
  _prependByCheck(listener, by) {
    const requiresSelectedPlayer = by & SELECTED_PLAYER;
    const requiresSelectedPlayerPet = by & SELECTED_PLAYER_PET;

    let check;
    if (requiresSelectedPlayer && requiresSelectedPlayerPet) {
      check = event => this.owner.byPlayer(event) || this.owner.byPlayerPet(event);
    } else if (requiresSelectedPlayer) {
      check = event => this.owner.byPlayer(event);
    } else if (requiresSelectedPlayerPet) {
      check = event => this.owner.byPlayerPet(event);
    } else {
      return listener;
    }

    return function (event) {
      if (check(event)) {
        listener(event);
      }
    };
  }
  _prependToCheck(listener, to) {
    const requiresSelectedPlayer = to & SELECTED_PLAYER;
    const requiresSelectedPlayerPet = to & SELECTED_PLAYER_PET;

    let check;
    if (requiresSelectedPlayer && requiresSelectedPlayerPet) {
      check = event => this.owner.toPlayer(event) || this.owner.toPlayerPet(event);
    } else if (requiresSelectedPlayer) {
      check = event => this.owner.toPlayer(event);
    } else if (requiresSelectedPlayerPet) {
      check = event => this.owner.toPlayerPet(event);
    } else {
      return listener;
    }

    return function (event) {
      if (check(event)) {
        listener(event);
      }
    };
  }
  _prependSpellCheck(listener, spell) {
    if (spell instanceof Array) {
      return function (event) {
        if (event.ability && spell.some(s => s.id === event.ability.guid)) {
          listener(event);
        }
      };
    }
    const spellId = spell.id;
    return function (event) {
      if (event.ability && event.ability.guid === spellId) {
        listener(event);
      }
    };
  }

  _listenersCalled = 0;
  _isHandlingEvent = false;
  triggerEvent(event) {
    if (process.env.NODE_ENV === 'development') {
      this._validateEvent(event);
    }

    // When benchmarking the event triggering make sure to disable the event batching and turn the listener into a dummy so you get the performance of just this piece of code. At the time of writing the event triggering code only has about 12ms overhead for a full log.

    // TODO: Make a module that does the timestamp tracking
    if (event.timestamp) {
      this.owner._timestamp = event.timestamp;
    }

    let run = options => {
      try {
        this._listenersCalled += 1;
        options.listener(event);
      } catch (err) {
        if (process.env.NODE_ENV !== 'production') {
          throw err;
        }
        console.error('Disabling', options.module.constructor.name, 'and child dependencies because an error occured', err);
        // Disable this module and all active modules that have this as a dependency
        this.owner.deepDisable(options.module);
        captureException(err);
      }
    };
    if (PROFILE) {
      run = this.profile(run);
    }

    {
      // Handle on_event (listeners of all events)
      const listeners = this._eventListenersByEventType[CATCH_ALL_EVENT];
      if (listeners) {
        listeners.forEach(run);
      }
    }
    {
      const listeners = this._eventListenersByEventType[event.type];
      if (listeners) {
        listeners.forEach(run);
      }
    }

    this.owner.eventHistory.push(event);
    // Some modules need to have a primitive value to cause re-renders
    // TODO: This can probably be removed since we only render upon completion now
    this.owner.eventCount += 1;

    this.runFinally();

    return event;
  }
  /** @var {Map} */
  timePerModule = PROFILE ? new Map() : undefined;
  profile(run) {
    return options => {
      const start = performance.now();
      run(options);
      const duration = performance.now() - start;
      const sum = this.timePerModule.get(options.module) || 0;
      this.timePerModule.set(options.module, sum + duration);
    };
  }
  reportModuleTimes() {
    const table = [];
    const totalDuration = Array.from(this.timePerModule).reduce((sum, [, value]) => sum + value, 0);
    this.timePerModule.forEach((value, key) => {
      table.push({
        module: key,
        duration: Math.ceil(value),
        ofTotal: `${(value / totalDuration * 100).toFixed(2)}%`,
      });
    });
    console.groupCollapsed('Module time consumption');
    console.table(table.sort((a, b) => b.duration - a.duration));
    console.log('Total module time:', totalDuration, 'ms');
    console.groupEnd();
  }
  _finally = null;
  finally(func) {
    this._finally = this._finally || [];
    this._finally.push(func);
  }
  runFinally() {
    if (this._finally) {
      const currentBatch = this._finally;
      // Reset before running so if an item calls another event, it doesn't do the same finally multiple times
      this._finally = null;
      currentBatch.forEach(item => item());
    }
  }
  fabricateEvent(event, trigger = null) {
    const fabricatedEvent = {
      // When no timestamp is provided in the event (you should always try to), the current timestamp will be used by default.
      timestamp: this.owner.currentTimestamp,
      // If this event was triggered you should pass it along
      trigger: trigger ? trigger : undefined,
      ...event,
      type: event.type instanceof EventFilter ? event.type.eventType : event.type,
      __fabricated: true,
    };
    this.finally(() => {
      this.triggerEvent(fabricatedEvent);
    });
    return fabricatedEvent;
  }
  _validateEvent(event) {
    if (!event.type) {
      console.log(event);
      throw new Error('Events should have a type. No type received. See the console for the event.');
    }
  }
}

export default EventEmitter;
