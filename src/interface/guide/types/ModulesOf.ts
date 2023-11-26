import type CombatLogParser from 'parser/core/CombatLogParser';
import ConstructedModules from './ConstructedModules';
import HasSpecModules from './HasSpecModules';

/**
 * Construct a type representing the *constructed* modules for a given
   CombatLogParser sub-class.
 *
 * Due to type limitations with the combination of static properties and class
 * inheritance, the exact properties of `internalModules` and `defaultModules`
 * are erased. Using those modules will require a typecast from the generic
 * `Module` type. `specModules` are represented exactly and do not require
 * typecasting to use.
 */
type ModulesOf<T extends typeof CombatLogParser> = ConstructedModules<
  typeof CombatLogParser.internalModules
> &
  ConstructedModules<typeof CombatLogParser.defaultModules> &
  (T extends HasSpecModules<infer Deps> ? ConstructedModules<Deps> : never);

export default ModulesOf;
