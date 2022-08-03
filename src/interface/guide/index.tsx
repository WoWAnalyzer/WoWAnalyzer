/**
 * This module contains the core types and utility components for constructing
 * analysis summaries in the new "Guide" format.
 *
 * # What is a "Guide"?
 *
 * In user terms, this is just a way of presenting our existing analysis that is
 * focused on details & readability. I recommend looking at the work on the
 * Brewmaster and (soon:tm:) Restoration Druid guides for concrete examples of
 * this. It is certainly a place where showing is easier than telling.
 *
 * In technical terms, a guide is just a React component that takes a certain
 * set of props (see `GuideProps` for details) and returns JSX. There is no magic.
 *
 * The two main props that you'll want are `events` (a list of all events after
 * normalization and fabrication) and `modules` (an object with all of your
 * spec's modules after analysis is complete).
 *
 * ## The Most Basic Guide
 *
 * If you had a module `foo: Foo` listed in your spec's `CombatLogParser`, then you could implement a guide like so:
 *
 * ```tsx
 * import type SpecCombatLogParser from './path/to/CombatLogParser';
 * import SPELLS from 'common/SPELLS';
 * import { Section, GuideProps } from 'interface/guide';
 * import { SpellLink } from 'interface';
 *
 * export default function Guide({ modules, events, info }: GuideProps<typeof SpecCombatLogParser>): JSX.Element {
 *   const result = modules.foo.myAnalysisResult();
 *   return (
 *     <Section title="Basics of Foo">
 *       <SpellLink id={SPELLS.FOO.id} /> is very important to your success as a
 *       player. Optimizing it is very complicated. Here are some details on how
 *       you did:
 *
 *       <ul>
 *         <li>{result.foo}</li>
 *         <li>{result.bar}</li>
 *       </ul>
 *     </Section>
 *   );
 * }
 * ```
 *
 * # Designing Guide Contents
 *
 * This structure is much more flexible than our existing Checklist/Suggestions
 * setup, which can make it difficult to start building your own component.
 *
 * We are working on a set of components to handle common cases here. For example:
 *
 * - `interface/guide/Problems` contains a `ProblemList` component that you can
 *   use to show individual problems sorted in order of priority. The user can
 *   click through the list to see all of the identified problems.
 *
 * Please take a look through the files and folders under `interface/guide` for a complete, up-to-date list.
 *
 * ## Using Your `Guide` Component
 *
 * In your spec's `CombatLogParser`:
 *
 * 1. Import your `Guide` component.
 * 2. Add `static guide = Guide;` to the `CombatLogParser` class.
 *
 * The guide will now be the default summary view for analysis (or will be after
 * we exit the prototype phase---in the meantime, click the "View Prototype"
 * link in the top right).
 *
 * @module
 */
import { Tooltip } from 'interface';
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
  const perf = Math.min(pass / total, 1);
  return (
    <div className="pass-fail-bar-container">
      <div className="pass-bar" style={{ minWidth: `${perf * 100}%` }} />
      {perf < 1 && <div className="fail-bar" style={{ minWidth: `${(1 - perf) * 100}%` }} />}
    </div>
  );
}

export const PerfectMark = () => <i className="glyphicon glyphicon-ok-circle perfect-mark" />;
export const GoodMark = () => <i className="glyphicon glyphicon-ok good-mark" />;
export const OkMark = () => <i className="glyphicon glyphicon-asterisk ok-mark" />;
export const BadMark = () => <i className="glyphicon glyphicon-remove bad-mark" />;

/** Shows a glyph - either a green checkmark or a red X depending on if 'pass' is true */
export const PassFailCheckmark = ({ pass }: { pass: boolean }) =>
  pass ? <GoodMark /> : <BadMark />;

/**
 * A slightly more complex form of the Checklist's success meters that allows for more than two outcomes.
 * Not all result types need be included, depending on the bar's context.
 *
 * # Props
 * - `perfect` - The number of flawless executions (or an object with the number plus a tooltip label)
 * - `good` - The number of acceptable executions (or an object with the number plus a tooltip label)
 * - `ok` - The number of suboptimal executions (or an object with the number plus a tooltip label)
 * - `bad` - The number of unacceptable executions (or an object with the number plus a tooltip label)
 */
export function GradiatedPerformanceBar({
  perfect,
  good,
  ok,
  bad,
}: {
  perfect?: number | GradiatedPerformanceBarInfo;
  good?: number | GradiatedPerformanceBarInfo;
  ok?: number | GradiatedPerformanceBarInfo;
  bad?: number | GradiatedPerformanceBarInfo;
}) {
  const perfectObj = getDefaultInfo(perfect);
  const goodObj = getDefaultInfo(good);
  const okObj = getDefaultInfo(ok);
  const badObj = getDefaultInfo(bad);

  const total = perfectObj.count + goodObj.count + okObj.count + badObj.count;
  return (
    <div className="gradiated-bar-container">
      {perfectObj.count > 0 && (
        <Tooltip
          content={
            <>
              {perfectObj.label && `${perfectObj.label} - `}
              <strong>
                {perfectObj.count} / {total}
              </strong>
            </>
          }
        >
          <div
            className="perfect-bar"
            style={{ minWidth: `${(perfectObj.count / total) * 100}%` }}
          />
        </Tooltip>
      )}
      {goodObj.count > 0 && (
        <Tooltip
          content={
            <>
              {goodObj.label && `${goodObj.label} - `}
              <strong>
                {goodObj.count} / {total}
              </strong>
            </>
          }
        >
          <div className="good-bar" style={{ minWidth: `${(goodObj.count / total) * 100}%` }} />
        </Tooltip>
      )}
      {okObj.count > 0 && (
        <Tooltip
          content={
            <>
              {okObj.label && `${okObj.label} - `}
              <strong>
                {okObj.count} / {total}
              </strong>
            </>
          }
        >
          <div className="ok-bar" style={{ minWidth: `${(okObj.count / total) * 100}%` }} />
        </Tooltip>
      )}
      {badObj.count > 0 && (
        <Tooltip
          content={
            <>
              {badObj.label && `${badObj.label} - `}
              <strong>
                {badObj.count} / {total}
              </strong>
            </>
          }
        >
          <div className="bad-bar" style={{ minWidth: `${(badObj.count / total) * 100}%` }} />
        </Tooltip>
      )}
    </div>
  );
}

function getDefaultInfo(val?: number | GradiatedPerformanceBarInfo) {
  if (val === undefined) {
    return { count: 0, label: '' };
  } else if (typeof val === 'number') {
    return { count: val, label: '' };
  } else {
    return val;
  }
}

type GradiatedPerformanceBarInfo = {
  count: number;
  label: string;
};
