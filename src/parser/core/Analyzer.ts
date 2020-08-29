import React from 'react';

import EventSubscriber, { EventListener } from './EventSubscriber';
import EventFilter, {
  SELECTED_PLAYER,
  SELECTED_PLAYER_PET,
} from './EventFilter';
import { SuggestionAssertion } from './ParseResults';
import { Event } from './Events';

export { SELECTED_PLAYER, SELECTED_PLAYER_PET };

const EVENT_LISTENER_REGEX = /on_((by|to)Player(Pet)?_)?(.+)/;

/**
 * Get a list of all methods of all classes in the prototype chain until this
 * class. Orginal source: https://stackoverflow.com/a/40577337/684353
 * @param {object} obj A class instance
 * @returns {Set<any>}
 */
function getAllChildMethods(obj: object) {
  // Set is required here to avoid duplicate methods (if a class extends another it might override the same method)
  const methods = new Set<string>();
  // eslint-disable-next-line no-cond-assign
  while ((obj = Object.getPrototypeOf(obj)) && obj !== Analyzer.prototype) {
    const keys = Object.getOwnPropertyNames(obj).concat(
      (Object.getOwnPropertySymbols(obj) as unknown) as string[],
    );
    keys.forEach(k => methods.add(k));
  }
  return methods;
}
function addLegacyEventListenerSupport(object: Analyzer) {
  const methods = getAllChildMethods(object);
  let hasLegacyEventListener = false;
  // Check for any methods that match the old magic method names and connect them to the new event listeners
  // Based on https://github.com/xivanalysis/xivanalysis/blob/a24b9c0ed8b341cbb8bd8144a772e95a08541f8d/src/parser/core/Module.js#L51
  methods.forEach(name => {
    const match = EVENT_LISTENER_REGEX.exec(name);
    if (!match) {
      return;
    }
    const [listener, , playerFilter, pet, eventType] = match;
    const filter = new EventFilter(eventType);

    // This only shows available filters used by the legacy method.
    // For a full list of supported properties see the core CombatLogParser
    let by = 0;
    if (playerFilter === 'by' && !pet) {
      by = by | SELECTED_PLAYER;
    }
    if (playerFilter === 'by' && pet) {
      by = by | SELECTED_PLAYER_PET;
    }
    filter.by(by);
    let to = 0;
    if (playerFilter === 'to' && !pet) {
      to = to | SELECTED_PLAYER;
    }
    if (playerFilter === 'to' && pet) {
      to = to | SELECTED_PLAYER_PET;
    }
    filter.to(to);

    // @ts-ignore
    object.addEventListener(filter, object[listener]);
    hasLegacyEventListener = true;
  });
  object.hasLegacyEventListener = hasLegacyEventListener;
}

class Analyzer extends EventSubscriber {
  hasLegacyEventListener = false;

  /**
   * Called when the parser finished initializing; after all required
   * dependencies are loaded, normalizers have ran and combatants were
   * initialized. Use this method to toggle the module on/off based on having
   * items equipped, talents selected, etc.
   */
  constructor(options: any) {
    super(options);
    addLegacyEventListenerSupport(this);
  }
  addEventListener<ET extends string, E extends Event<ET>>(
    eventFilter: ET | EventFilter<ET>,
    listener: EventListener<ET, E>,
  ) {
    if (this.hasLegacyEventListener) {
      throw new Error(
        'You can not combine legacy event listeners with manual event listeners, use only one method.',
      );
    }
    super.addEventListener(eventFilter, listener);
  }

  // Override these with functions that return info about their rendering in the specific slots
  statistic(): React.ReactNode {
    return undefined;
  }
  /**
   * @deprecated Set the `position` property on the Statistic component instead.
   */
  statisticOrder?: number = undefined;
  suggestions(when: (actual: object | any) => SuggestionAssertion) {}
  /**
   * @deprecated Return a `Panel` from the statistic method instead.
   */
  tab(): {
    title: string;
    url: string;
    render: React.FC;
  } | void {}
}

export default Analyzer;
