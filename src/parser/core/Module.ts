import { formatMilliseconds } from 'common/format';

import Combatant from './Combatant';
import CombatLogParser from './CombatLogParser';

export interface Options {
  [prop: string]: unknown;
  owner: CombatLogParser;
  priority: number;
}

class Module {
  static dependencies: { [desiredPropName: string]: typeof Module } = {};

  protected readonly owner!: CombatLogParser;
  /** Whether or not this module is active, usually depends on specific items or talents. */
  active: boolean = true;
  /** This module's execution priority, this makes sure dependencies are executed before modules that depend on them. */
  priority: number = 0;
  /** This module's given name by the parser, sometimes auto generated and sometimes requested. */
  key!: string;
  get selectedCombatant(): Combatant {
    return this.owner.selectedCombatant;
  }
  get config() {
    return this.owner.config;
  }
  constructor(options: Options) {
    if (!options) {
      throw new Error(
        '`options` is a required parameter. Make sure you pass it to a `super();` call.',
      );
    }
    const { owner, priority, ...others } = options;
    this.owner = owner;
    this.priority = priority;

    // This doesn't set the properties of any class that inherits this class
    // since a parent constructor can't override the values of a child's class
    // properties.
    // See https://github.com/Microsoft/TypeScript/issues/6110 for more info
    Object.keys(others).forEach((key) => {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      this[key] = others[key];
    });
  }

  get consoleMeta() {
    const fightDuration = formatMilliseconds(
      this.owner.currentTimestamp - this.owner.fight.start_time,
    );
    return [fightDuration, `(module: ${this.constructor.name})`];
  }
  debug(...args: unknown[]) {
    console.debug(...this.consoleMeta, ...args);
  }
  log(...args: unknown[]) {
    console.log(...this.consoleMeta, ...args);
  }
  warn(...args: unknown[]) {
    console.warn(...this.consoleMeta, ...args);
  }
  error(...args: unknown[]) {
    console.error(...this.consoleMeta, ...args);
  }
}

export default Module;
