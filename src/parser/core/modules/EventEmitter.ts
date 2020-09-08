import ModuleError from 'parser/core/ModuleError';
import Events, { Event, HasAbility } from '../Events';
import Module from '../Module';
import { EventListener } from '../EventSubscriber';
import { SELECTED_PLAYER, SELECTED_PLAYER_PET } from '../Analyzer';
import EventFilter, { SpellFilter } from '../EventFilter';

const CATCH_ALL_EVENT = 'event';

const PROFILE = false;

type BoundListener<ET extends string, E extends Event<ET>> = {
  eventFilter: ET | EventFilter<ET>;
  module: Module;
  listener: EventListener<ET, E>;
}

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

  constructor(options: any) {
    super(options);
    if (PROFILE) {
      this.timePerModule = new Map<Module, number>();
      this.addEventListener(Events.fightend, this.reportModuleTimes.bind(this), this);
    }
  }

  _eventListenersByEventType: { [eventType: string]: BoundListener<any, any>[] } = {};
  numEventListeners = 0;
  /**
   * @param {string|EventFilter} eventFilter
   * @param {function} listener
   * @param {Module} module
   */
  addEventListener<ET extends string, T extends Event<ET>>(eventFilter: ET | EventFilter<ET>, listener: EventListener<ET, T>, module: Module) {
    const eventType = eventFilter instanceof EventFilter ? eventFilter.eventType : eventFilter;
    this._eventListenersByEventType[eventType] = this._eventListenersByEventType[eventType] || [];
    this._eventListenersByEventType[eventType].push({
      eventFilter,
      module, // used when the listener throws an exception to disable the related module
      listener: this._compileListener(eventFilter, listener, module),
    });
    this.numEventListeners += 1;
  }
  _compileListener<ET extends string, E extends Event<ET>>(eventFilter: ET | EventFilter<ET>, listener: EventListener<ET, E>, module: Module): EventListener<ET, E> {
    listener = this._prependCounter(listener);
    if (eventFilter instanceof EventFilter) {
      listener = this._prependFilters(eventFilter, listener);
    }
    // We need to prepend this last so it's at the top level (the first check)
    listener = this._prependActiveCheck(listener, module);
    return listener;
  }

  numActualExecutions = 0;
  _prependCounter<ET extends string, E extends Event<ET>>(listener: EventListener<ET, E>): EventListener<ET, E> {
    return event => {
      this.numActualExecutions += 1;
      listener(event);
    };
  }
  _prependActiveCheck<ET extends string, E extends Event<ET>>(listener: EventListener<ET, E>, module: Module): EventListener<ET, E> {
    return function(event: E) {
      if (module.active) {
        listener(event);
      }
    };
  }
  _prependFilters<ET extends string, E extends Event<ET>>(eventFilter: EventFilter<ET>, listener: EventListener<ET, E>): EventListener<ET, E> {
    const by = eventFilter.getBy();
    if (by) {
      listener = this._prependByCheck(listener, by);
    }
    const to = eventFilter.getTo();
    if (to) {
      listener = this._prependToCheck(listener, to);
    }
    const spell = eventFilter.getSpell();
    if (spell) {
      listener = this._prependSpellCheck(listener, spell);
    }
    return listener;
  }

  createByCheck<ET extends string, E extends Event<ET>>(by: number): ((event: E) => boolean) | null {
    const requiresSelectedPlayer = by & SELECTED_PLAYER;
    const requiresSelectedPlayerPet = by & SELECTED_PLAYER_PET;

    if (requiresSelectedPlayer && requiresSelectedPlayerPet) {
      return event => this.owner.byPlayer(event) || this.owner.byPlayerPet(event);
    } else if (requiresSelectedPlayer) {
      return event => this.owner.byPlayer(event);
    } else if (requiresSelectedPlayerPet) {
      return event => this.owner.byPlayerPet(event);
    } else {
      return null;
    }
  }
  _prependByCheck<ET extends string, E extends Event<ET>>(listener: EventListener<ET, E>, by: number): EventListener<ET, E> {
    const check = this.createByCheck(by);
    if (!check) {
      return listener;
    }

    return function(event) {
      if (check(event)) {
        listener(event);
      }
    };
  }

  createToCheck<ET extends string>(to: number): ((event: Event<ET>) => boolean) | null {
    const requiresSelectedPlayer = to & SELECTED_PLAYER;
    const requiresSelectedPlayerPet = to & SELECTED_PLAYER_PET;
    if (requiresSelectedPlayer && requiresSelectedPlayerPet) {
      return event => this.owner.toPlayer(event) || this.owner.toPlayerPet(event);
    } else if (requiresSelectedPlayer) {
      return event => this.owner.toPlayer(event);
    } else if (requiresSelectedPlayerPet) {
      return event => this.owner.toPlayerPet(event);
    } else {
      return null;
    }
  }
  _prependToCheck<ET extends string, E extends Event<ET>>(listener: EventListener<ET, E>, to: number): EventListener<ET, E> {
    const check = this.createToCheck(to);
    if (!check) {
      return listener;
    }
    return function(event: E) {
      if (check(event)) {
        listener(event);
      }
    };
  }

  createSpellCheck<ET extends string, E extends Event<ET>>(spell: SpellFilter): ((event: E) => boolean) {
    if (spell instanceof Array) {
      return event => HasAbility(event) && spell.some(s => s.id === event.ability.guid);
    }
    const spellId = spell.id;
    return event => HasAbility(event) && event.ability.guid === spellId;
  }

  _prependSpellCheck<ET extends string, E extends Event<ET>>(listener: EventListener<ET, E>, spell: SpellFilter): EventListener<ET, E> {
    const check = this.createSpellCheck(spell);
    return function(event: E) {
      if (check(event)) {
        listener(event);
      }
    };
  }

  numTriggeredEvents = 0;
  numListenersCalled = 0;
  _isHandlingEvent = false;
  triggerEvent<ET extends string, E extends Event<ET>>(event: E) {
    if (process.env.NODE_ENV === 'development') {
      this._validateEvent(event);
    }

    // When benchmarking the event triggering make sure to disable the event batching and turn the listener into a dummy so you get the performance of just this piece of code. At the time of writing the event triggering code only has about 12ms overhead for a full log.

    this.numTriggeredEvents += 1;

    // TODO: Make a module that does the timestamp tracking
    if (event.timestamp) {
      this.owner._timestamp = event.timestamp;
    }

    let run = (options: BoundListener<ET, E>) => {
      try {
        this.numListenersCalled += 1;
        options.listener(event);
      } catch (err) {
        this._handleError(err, options.module);
      }
    };
    if (PROFILE) {
      run = this.profile(run);
    }

    this._isHandlingEvent = true;
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
    this._isHandlingEvent = false;

    this.owner.eventHistory.push(event);
    // Some modules need to have a primitive value to cause re-renders
    // TODO: This can probably be removed since we only render upon completion now
    this.owner.eventCount += 1;

    this.runFinally();

    return event;
  }

  timePerModule!: Map<Module, number>;
  profile<ET extends string, E extends Event<ET>>(run: (options: BoundListener<ET, E>) => void) {
    return (options: BoundListener<ET, E>) => {
      const start = performance.now();
      run(options);
      const duration = performance.now() - start;
      const sum = this.timePerModule.get(options.module) || 0;
      this.timePerModule.set(options.module, sum + duration);
    };
  }
  reportModuleTimes() {
    const table: Array<{ module: Module, duration: number, ofTotal: string }> = [];
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
  _finally: Function[] | null = null;
  finally(func: Function) {
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
  // todo double check this 'event' shape... seems wrong
  fabricateEvent(event: { type: EventFilter<any> | string }, trigger = null) {
    const fabricatedEvent = {
      // When no timestamp is provided in the event (you should always try to), the current timestamp will be used by default.
      timestamp: this.owner.currentTimestamp,
      // If this event was triggered you should pass it along
      trigger: trigger ? trigger : undefined,
      ...event,
      type: event.type instanceof EventFilter ? event.type.eventType : event.type,
      __fabricated: true,
    };
    if (this._isHandlingEvent) {
      this.finally(() => {
        this.triggerEvent(fabricatedEvent);
      });
      return fabricatedEvent;
    } else {
      return this.triggerEvent(fabricatedEvent);
    }
  }
  _validateEvent(event: any) {
    if (!event.type) {
      console.log(event);
      throw new Error('Events should have a type. No type received. See the console for the event.');
    }
  }
  _handleError(err: Error, module: Module) {
    if (process.env.NODE_ENV !== 'production') {
      throw err;
    }
    const name = module.key;
    console.error('Disabling', name, 'and child dependencies because an error occured:', err);
    // Disable this module and all active modules that have this as a dependency
    this.owner.deepDisable(module, ModuleError.EVENTS, err);
    window.Sentry && window.Sentry.withScope(scope => {
      scope.setTag('type', 'module_error');
      scope.setTag('spec', `${this.selectedCombatant.spec.specName} ${this.selectedCombatant.spec.className}`);
      scope.setExtra('module', name);
      window.Sentry && window.Sentry.captureException(err);
    });
  }
}

export default EventEmitter;
