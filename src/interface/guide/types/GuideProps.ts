import type CombatLogParser from 'parser/core/CombatLogParser';
import { AnyEvent } from 'parser/core/Events';
import { Info } from 'parser/core/metric';
import ModulesOf from './ModulesOf';

/**
 * React props passed to guide components. Make sure to specify your spec's
 * `CombatLogParser` as the type parameter to get module access!
 *
 * # Usage
 *
 * ```tsx
 * function MyGuide({ modules, events, info }: GuideProps<typeof SpecCombatLogParser>): JSX.Element {
 *   // ...
 * }
 * ```
 */
type GuideProps<T extends typeof CombatLogParser> = {
  modules: ModulesOf<T>;
  events: AnyEvent[];
  info: Info;
};

export default GuideProps;
