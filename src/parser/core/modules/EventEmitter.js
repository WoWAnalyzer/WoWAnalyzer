import { captureException } from 'common/errorLogger';

import Module from '../Module';
import { SELECTED_PLAYER, SELECTED_PLAYER_PET } from '../Analyzer';
import EventFilter from '../EventFilter';

const CATCH_ALL_EVENT = 'event';

/**
 * This (core) module takes care of:
 * - tracking attached event listeners
 * - filtering event listeners (as configured in EventFilter)
 * - firing event listeners
 */
class EventEmitter extends Module {
  static __dangerousInvalidUsage = false;

  _eventListenersByEventType = {};
  addEventListener(eventFilter, listener, module) {
    const eventType = eventFilter instanceof EventFilter ? eventFilter.eventType : eventFilter;
    const options = {};
    if (eventFilter instanceof EventFilter) {
      const by = eventFilter.by();
      if (by === SELECTED_PLAYER) {
        options.byPlayer = true;
      }
      if (by === SELECTED_PLAYER_PET) {
        options.byPlayerPet = true;
      }
      const to = eventFilter.to();
      if (to === SELECTED_PLAYER) {
        options.toPlayer = true;
      }
      if (to === SELECTED_PLAYER_PET) {
        options.toPlayerPet = true;
      }
    }
    this._eventListenersByEventType[eventType] = this._eventListenersByEventType[eventType] || [];
    this._eventListenersByEventType[eventType].push({
      ...options,
      eventFilter,
      listener: this._compileListener(eventFilter, listener, module),
    });
  }
  _compileListener(eventFilter, listener, module) {
    if (eventFilter instanceof EventFilter) {
      listener = this._prependFilters(eventFilter, listener);
    }
    // We need to do this last so it's at the top level
    listener = this._prependActiveCheck(listener, module);
    return listener;
  }
  _prependActiveCheck(listener, module) {
    return function (event) {
      if (!module.active) return;
      listener(event);
    };
  }
  _prependFilters(eventFilter, listener) {
    // const by = eventFilter.by();
    // if (by) {
    //   listener = this._prependByCheck(listener, by);
    // }
    return listener;
  }
  // _prependByCheck(listener, by) {
  //   const requiresSelectedPlayer = by & SELECTED_PLAYER;
  //   const requiresSelectedPlayerPet = by & SELECTED_PLAYER_PET;
  //
  //
  // }

  triggerEvent(event) {
    if (process.env.NODE_ENV === 'development') {
      if (!event.type) {
        console.log(event);
        throw new Error('Events should have a type. No type received. See the console for the event.');
      }
    }

    // When benchmarking the event triggering make sure to disable the event batching and turn the listener into a dummy so you get the performance of just this piece of code. At the time of writing the event triggering code only has about 12ms overhead for a full log.

    if (event.timestamp) {
      this.owner._timestamp = event.timestamp;
    }

    const isByPlayer = this.owner.byPlayer(event);
    const isToPlayer = this.owner.toPlayer(event);
    const isByPlayerPet = this.owner.byPlayerPet(event);
    const isToPlayerPet = this.owner.toPlayerPet(event);

    // TODO: Refactor this to compose a function with only the necessary if-statements in the addEventListener method so this doesn't become an endless list of if-statements
    const run = options => {
      if (!isByPlayer && options.byPlayer) {
        return;
      }
      if (!isByPlayerPet && options.byPlayerPet) {
        return;
      }
      if (!isToPlayer && options.toPlayer) {
        return;
      }
      if (!isToPlayerPet && options.toPlayerPet) {
        return;
      }

      try {
        options.listener(event);
      } catch (err) {
        if (process.env.NODE_ENV === 'development') {
          throw err;
        }
        console.error('Disabling', options.module.constructor.name, 'and child dependencies because an error occured', err);
        // Disable this module and all active modules that have this as a dependency
        this.owner.deepDisable(options.module);
        captureException(err);
      }
    };

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
  }
}

export default EventEmitter;
