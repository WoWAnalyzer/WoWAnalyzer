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
 *       <SpellLink spell={SPELLS.FOO.id} /> is very important to your success as a
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
import {
  PerfectColor,
  GoodColor,
  OkColor,
  BadColor,
  VeryBadColor,
  MediocreColor,
  AvailableColor,
  qualitativePerformanceToColor,
} from './consts';
import { BadMark, GoodMark, OkMark, PerfectMark } from './components/Marks';
import PerformanceMark from './components/PerformanceMark';
import PassFailCheckmark from './components/PassFailCheckmark';
import { GuideProps, ModulesOf, Guide } from './types';
import GuideContext from './GuideContext';
import SubSection from './components/SubSection';
import GuideContainer from './components/GuideContainer';
import SectionHeader from './components/SectionHeader';
import Section from './components/Section';
import { useAnalyzer, useAnalyzers, useInfo, useEvents } from './hooks';

export type { GuideProps, ModulesOf };

export default Guide;

export {
  PerfectColor,
  GoodColor,
  OkColor,
  BadColor,
  VeryBadColor,
  MediocreColor,
  AvailableColor,
  qualitativePerformanceToColor,
  PerformanceMark,
  PerfectMark,
  GoodMark,
  OkMark,
  BadMark,
  PassFailCheckmark,
  useAnalyzer,
  GuideContext,
  SubSection,
  GuideContainer,
  useAnalyzers,
  useInfo,
  useEvents,
  SectionHeader,
  Section,
};
