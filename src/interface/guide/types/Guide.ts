import type CombatLogParser from 'parser/core/CombatLogParser';
import GuideProps from './GuideProps';

/**
 * Shortcut type for guide components. Make sure to specify your spec's
 * `CombatLogParser` as the type parameter to get module access!
 *
 * # Usage
 *
 * ```tsx
 * const MyGuide: Guide<typeof SpecCombatLogParser> = ({ modules, events, info }) => {
 *    // ...
 * }
 * ```
 */
type Guide<T extends typeof CombatLogParser = any> = (props: GuideProps<T>) => JSX.Element | null;

export default Guide;
