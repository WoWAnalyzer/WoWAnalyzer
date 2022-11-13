/**
 * This module contains the core types for constructing
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
import { ControlledExpandable } from 'interface/Expandable';
import DropdownIcon from 'interface/icons/Dropdown';
import type { Options } from 'parser/core/Analyzer';
import type CombatLogParser from 'parser/core/CombatLogParser';
import { AnyEvent } from 'parser/core/Events';
import { Info } from 'parser/core/metric';
import Module from 'parser/core/Module';
import React, { useContext, useMemo, useState } from 'react';
import './Guide.scss';
import { QualitativePerformance } from 'parser/ui/QualitativePerformance';

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

type GuideContextValue = Omit<GuideProps<any>, 'info'> & {
  info?: GuideProps<any>['info'];
};

export const GuideContext = React.createContext<GuideContextValue>({
  modules: {},
  events: [],
});

/**
 * Get the player `Info` object from within a Guide section.
 */
export function useInfo(): GuideContextValue['info'] {
  return useContext(GuideContext).info;
}

/**
 * Get the event list from within a Guide section.
 */
export function useEvents(): GuideContextValue['events'] {
  return useContext(GuideContext).events;
}

/**
 * Get an analysis module from within a Guide section.
 *
 * # Example
 *
 * ```
 * import BrewCDR from 'analysis/retail/monk/brewmaster/modules/core/BrewCDR';
 * import PurifyingBrew from 'analysis/retail/monk/brewmaster/modules/spells/PurifyingBrew';
 *
 * function MySection() {
 *   const cdr = useAnalyzer(BrewCDR);
 *   const pb = useAnalyzer(PurifyingBrew);
 *    // ...
 * }
 *
 * // ... later, in the Guide component
 *
 * function Guide(props) {
 *   return (
 *    // ...
 *    <MySection />
 *    // ...
 *   )
 * }
 * ```
 */
export function useAnalyzer<T extends typeof Module>(moduleType: T): InstanceType<T> | undefined;
export function useAnalyzer(moduleKey: string): Module | undefined;
export function useAnalyzer<T extends typeof Module>(value: string | T) {
  const ctx = useContext(GuideContext);
  return useMemo(() => {
    if (typeof value === 'string') {
      return ctx.modules[value];
    } else {
      return Object.values(ctx.modules).find((module) => module instanceof value) as
        | InstanceType<T>
        | undefined;
    }
  }, [value, ctx]);
}

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
}: React.PropsWithChildren<{ title?: string; style?: React.CSSProperties }>) => (
  <section className="subsection">
    <header>{title || ''}</header>
    <div style={style}>{children}</div>
  </section>
);

/*
 * Common styling colors and marks
 */

export const PerfectMark = () => <i className="glyphicon glyphicon-ok-circle perfect-mark" />;
export const GoodMark = () => <i className="glyphicon glyphicon-ok good-mark" />;
export const OkMark = () => <i className="glyphicon glyphicon-asterisk ok-mark" />;
export const BadMark = () => <i className="glyphicon glyphicon-remove bad-mark" />;

export const PerfectColor = getComputedStyle(document.documentElement).getPropertyValue(
  '--guide-perfect-color',
);
export const GoodColor = getComputedStyle(document.documentElement).getPropertyValue(
  '--guide-good-color',
);
export const OkColor = getComputedStyle(document.documentElement).getPropertyValue(
  '--guide-ok-color',
);
export const BadColor = getComputedStyle(document.documentElement).getPropertyValue(
  '--guide-bad-color',
);

// some extra colors for fun
export const VeryBadColor = getComputedStyle(document.documentElement).getPropertyValue(
  '--guide-very-bad-color',
);
export const MediocreColor = getComputedStyle(document.documentElement).getPropertyValue(
  '--guide-mediocre-color',
);

/** Shows a glyph - either a green checkmark or a red X depending on if 'pass' is true */
export const PassFailCheckmark = ({ pass }: { pass: boolean }) =>
  pass ? <GoodMark /> : <BadMark />;

/** Shows a glyph depending on given performance */
export const PerformanceMark = ({ perf }: { perf: QualitativePerformance }) => {
  switch (perf) {
    case QualitativePerformance.Perfect:
      return <PerfectMark />;
    case QualitativePerformance.Good:
      return <GoodMark />;
    case QualitativePerformance.Ok:
      return <OkMark />;
    case QualitativePerformance.Fail:
      return <BadMark />;
  }
};
