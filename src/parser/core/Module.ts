import { formatMilliseconds } from 'common/format';

import { FullCombatant } from './Combatant';
import CombatLogParser from './CombatLogParser';

export interface Options {
  [prop: string]: unknown;
  owner: CombatLogParser;
  priority: number;
}

/**
 * A reference to a Module (sub)class usable as a dependency lookup key.
 *
 * Dependencies are resolved via `instanceof`, not instantiation, so an
 * abstract base class (e.g. a shared abstract Analyzer subclass) is just as
 * valid a dependency key as a concrete class — this lets a module depend on
 * "whichever concrete subclass of this abstract class the owning spec
 * registered" instead of a specific spec's subclass.
 */
export type ModuleConstructor<T extends Module = Module, O extends Options = Options> = {
  name: string;
} & ((new (options: O) => T) | (abstract new (options: O) => T));

class Module {
  static dependencies: Record<string, ModuleConstructor> = {};

  protected readonly owner!: CombatLogParser;
  /** Whether or not this module is active, usually depends on specific items or talents. */
  active = true;
  /** This module's execution priority, this makes sure dependencies are executed before modules that depend on them. */
  priority = 0;
  /** This module's given name by the parser, sometimes auto generated and sometimes requested. */
  key!: string;
  get selectedCombatant(): FullCombatant {
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
    const { owner, priority } = options;
    this.owner = owner;
    this.priority = priority;
    Module.applyDependencies(options, this);
  }

  static applyDependencies(options: Options, instance: Module) {
    // We can't set the options via the constructor since the child fields are initialized to undefined.
    // as we move towards a `this.deps` world, this ceases to be a problem.
    //
    // See https://github.com/Microsoft/TypeScript/issues/6110, https://github.com/microsoft/TypeScript/issues/37640 for more info
    Object.assign(
      instance,
      Object.fromEntries(
        Object.entries(options).filter(([key]) => key !== 'priority' && key !== 'owner'),
      ),
    );
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
