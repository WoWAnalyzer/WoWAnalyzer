import { AnyEvent } from 'parser/core/Events';
import { Info } from 'parser/core/metric';
import { useEffect, useMemo, useState } from 'react';
import './ProblemList.scss';

/**
   Wrapper type used to deliver problem data and context information to the
   `ProblemList` component.

   Your editor may or may not show documentation for the fields when you read
   the type documentation. Be sure to examine the individual fields for details!
 */
export type Problem<T> = {
  /**
     The range (in time) where the problem occurred. `start`/`end` are event
     timestamps. It is okay if `start = end`.
   */
  range: { start: number; end: number };
  /**
     The amount of time shown `before`/`after` the problem to help the user
     understand the context. If you want the same amount of time before and
     after the problem, you can set this to a number (so: `5000` instead of `{
     before: 5000, after: 5000 }`).
   */
  context:
    | number
    | {
        before: number;
        after: number;
      };
  /**
     An (optional) severity. When present, will be used to show the highest
     severity problems first. The scale of this value is not important---only
     whether one value is bigger or smaller than another.

     # Examples

     - The amount of overhealing on a key spell. (More overhealing = more severe)
     - The amount of damage taken by a tank without mitigation active (More damage = more severe)
     - The healing done by a spell that scales with damage taken (such as Death
       Strike). Less healing = more severe. A simple trick is to use a
       *negative* value to flip the order: `severity: -deathStrikeHealing`
     - The amount of time that you maintained a key buff during a cooldown (Less
       time = more severe). The negative trick works here too: `severity:
       -buffUptime`.
   */
  severity?: number;
  /**
     Extra data attached to the problem. This is not used by `ProblemList`, but
     is passed to your `ProblemRenderer`.
   */
  data: T;
};

/**
   The properties passed to a problem renderer.

   # Usage

   ```tsx
   function Renderer({ events, problem, info }: ProblemRendererProps<MyProblemType>): JSX.Element {
     // ...
   }
   ```

   # Props

   - `problem` - An individual problem.
   - `info` - The `info` from the `Guide`.
   - `events` - The `events` list from the `Guide`, filtered down to only
     include events that have `timestamp`s between `start - context.before` and
     `end + context.after`.

   # Rules

   - A `ProblemRenderer` must not be used to detect problems. Problems should be pre-computed and passed to the `ProblemList`.
   - It is okay if you compute some extra data from the `events` list to show more detail, make a graph, etc.
 */
export type ProblemRendererProps<T> = {
  events: AnyEvent[];
  problem: Problem<T>;
  info: Info;
};

/**
   Convenience type for a React component that takes `ProblemRendererProps<T>` as its props.

   # Usage

   ```tsx
   const Renderer: ProblemRenderer<MyProblemType> = ({ events, problem, info }) => {
     // ...
   };
   ```
 */
export type ProblemRenderer<T> = (props: ProblemRendererProps<T>) => JSX.Element;

export function NoProblem({ children }: React.PropsWithChildren<object>) {
  return (
    <div className="problem-list-container no-problems">
      <span>
        <i className="glyphicon glyphicon-ok" />
        {children ?? <>No problems found.</>}
      </span>
    </div>
  );
}

/**
   Render a list of problems. Only a single problem is shown at a time. The
   problems are displayed in order of severity (most severe first).

   The intention is for all of the problems to be related. For example: they may
   all be places that a spell was mis-used, or a proc was missed.

   # Props

   - `renderer` - The component that will be used to render the problem. See
     `ProblemRenderer` for a description of the props.
   - `problems` - An array of problems that your analysis identified.
   - `events`, `info` - The `events` and `info` props that your `Guide` receives.

   # Usage

   In order to use this component, you need to build two things:

   1. A list of problems.
   2. A problem renderer.

   ## A List of Problems

   This can be done by one or more `Analyzer`s. For example: the Purifying Brew
   problems are built by the `PurifyingBrewProblems` analyzer, while the Shuffle
   problems are built by processing data from the `Shuffle` analyzer.

   The only rule is that this must have the type `Array<Problem<T>>`, where `T`
   can be any type you want.

   For example, if you were identifying casts with high overhealing, you might do this:

   ```ts
   type OverhealProblemData = {
     event: HealEvent;
   };

   // in your analyzer...
   get overhealProblems(): Array<Problem<OverhealProblemData>> {
     return this.massiveOverheals.map((event) => ({
       context: 5000, // show 5 seconds before and after the event
       range: { start: event.timestamp, end: event.timestamp },
       severity: event.overheal,
       data: { event }
     }));
   }
   ```

   ## A Problem Renderer

   A renderer is just a react component that takes your problem and a list of
   events and produces some JSX. A full example with charts and such is beyond
   the scope of this docstring, but a very basic example might look like:

   ```tsx
   const OverhealProblemRenderer: ProblemRenderer<OverhealProblemData> = ({ problem, events }) => {
     const { overheal, amount, absorbed, targetID } = problem.data;
     const targetDamageTaken = events.filter(event => event.targetID === targetID)
         .reduce((totalDamage, event) => totalDamage + event.amount, 0);

     const pctWasted = (amount + absorbed ?? 0) / (amount + absorbed ?? 0 + overheal ?? 0);

     return (
       <>
         <p>
           Your <SpellLink id={SPELLS.WHATEVER.id} /> overhealed by
           <strong>{formatNumber(overheal)}</strong>, wasting
           {pctWasted.toFixed(1)}% of the spell.
         </p>
         <p>
           Your target took {formatNumber(targetDamageTaken)} damage around
           the time that you cast the spell.
         </p>
       </>
     )
   };
   ```

   ## Putting it Together

   Once you have both of those things, usage is simple:

   ```tsx
   <ProblemList
     renderer={OverhealProblemRenderer}
     problems={modules.mySpellAnalyzer.overhealProblems}
     events={events}
     info={info}
     />
   ```
 */
export default function ProblemList<T>({
  renderer: Component,
  problems,
  events,
  info,
  label,
}: {
  problems: Array<Problem<T>>;
  events: AnyEvent[];
  renderer: ProblemRenderer<T>;
  info: Info;
  label?: string;
}) {
  const sortedProblems = useMemo(
    () => problems.sort((a, b) => (b.severity ?? 0) - (a.severity ?? 0)),
    [problems],
  );
  const [problemIndex, setProblemIndex] = useState(0);
  const problem = sortedProblems[problemIndex];

  useEffect(() => setProblemIndex(0), [problems]);

  if (!problem) {
    return <NoProblem />;
  }

  const start =
    problem.range.start -
    (typeof problem.context === 'number' ? problem.context : problem.context.before);
  const end =
    problem.range.end +
    (typeof problem.context === 'number' ? problem.context : problem.context.after);
  const childEvents = events.filter(({ timestamp }) => timestamp >= start && timestamp <= end);

  return (
    <div className="problem-list-container">
      <header>
        <span>
          {label ?? 'Problem Point'} {problemIndex + 1} of {sortedProblems.length}
        </span>
        <div className="btn-group">
          <button
            onClick={() => setProblemIndex(Math.max(0, problemIndex - 1))}
            disabled={problemIndex === 0}
          >
            <span className="icon-button glyphicon glyphicon-chevron-left" aria-hidden />
          </button>
          <button
            disabled={problemIndex === sortedProblems.length - 1}
            onClick={() => setProblemIndex(Math.min(sortedProblems.length - 1, problemIndex + 1))}
          >
            <span className="icon-button glyphicon glyphicon-chevron-right" aria-hidden />
          </button>
        </div>
      </header>
      <Component events={childEvents} problem={problem} info={info} />
    </div>
  );
}
