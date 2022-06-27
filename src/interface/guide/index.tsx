import { ControlledExpandable } from 'interface/Expandable';
import DropdownIcon from 'interface/icons/Dropdown';
import type { Options } from 'parser/core/Analyzer';
import type CombatLogParser from 'parser/core/CombatLogParser';
import { AnyEvent } from 'parser/core/Events';
import { Info } from 'parser/core/metric';
import { useState } from 'react';

import './Guide.scss';

type Constructed<T> = T extends new (options: Options) => infer R ? R : never;
type ConstructedModules<T> = {
  [Key in keyof T]: Constructed<T[Key]>;
};

type HasSpecModules<Deps> = { specModules: Deps };

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
export type ModulesOf<T extends typeof CombatLogParser> = ConstructedModules<
  typeof CombatLogParser.internalModules
> &
  ConstructedModules<typeof CombatLogParser.defaultModules> &
  (T extends HasSpecModules<infer Deps> ? ConstructedModules<Deps> : never);

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
export type GuideProps<T extends typeof CombatLogParser> = {
  modules: ModulesOf<T>;
  events: AnyEvent[];
  info: Info;
};

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
export type Guide<T extends typeof CombatLogParser = any> = (
  props: GuideProps<T>,
) => JSX.Element | null;

export default Guide;

/**
 * The header for a `<Section />`. Exported as a convenient way for others to
 * use the same structure. If you're building a section of your guide, you
 * probably want `Section` instead.
 */
export const SectionHeader = ({ children }: { children: React.ReactNode }) => (
  <header className="flex">
    <div className="flex-main name">{children}</div>
    <div className="flex-sub chevron">
      <DropdownIcon />
    </div>
  </header>
);

/**
 * An expandable guide section. Defaults to expanded.
 */
export const Section = ({ children, title }: React.PropsWithChildren<{ title: string }>) => {
  const [isExpanded, setIsExpanded] = useState(true);

  return (
    <ControlledExpandable
      header={<SectionHeader>{title}</SectionHeader>}
      element="section"
      inverseExpanded={() => setIsExpanded(!isExpanded)}
      expanded={isExpanded}
    >
      {children}
    </ControlledExpandable>
  );
};

/**
 * The overall guide container. You will never need this, it is used by the WoWA
 * core to hold your `Guide` component.
 */
export const GuideContainer = ({ children }: { children: React.ReactNode }) => (
  <div className="guide-container">{children}</div>
);

/**
 * A section within a section. This can be nested (so you'd have a
 * sub-sub-section). Don't go too crazy with that.
 */
export const SubSection = ({
  children,
  title,
  style,
}: React.PropsWithChildren<{ title: string; style?: React.CSSProperties }>) => (
  <section className="subsection">
    <header>{title}</header>
    <div style={style}>{children}</div>
  </section>
);

/**
 * A simplified form of the Checklist's success meters.
 *
 * # Props
 * - `pass` - The number of successes.
 * - `total` - The number of events that *could have* succeeded (also known as `successes + failures`).
 *
 * # Styles
 *
 * You can control the colors of this component by wrapping it in a container
 * `div` and setting the `background-color` for the `.pass-bar` and `.fail-bar`
 * classes.
 *
 * For an example, see the Brewmaster `PurifyReasonBreakdown` component, which
 * sets `.fail-bar` to be transparent.
 */
export function PassFailBar({ pass, total }: { pass: number; total: number }) {
  const perf = pass / total;
  return (
    <div className="pass-fail-bar-container">
      <div className="pass-bar" style={{ minWidth: `${perf * 100}%` }} />
      {perf < 1 && <div className="fail-bar" style={{ minWidth: `${(1 - perf) * 100}%` }} />}
    </div>
  );
}
