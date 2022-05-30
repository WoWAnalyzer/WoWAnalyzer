import { AnyEvent } from 'parser/core/Events';
import { Info } from 'parser/core/metric';
import { useMemo, useState } from 'react';

export type Problem<T> = {
  range: { start: number; end: number };
  context:
    | number
    | {
        before: number;
        after: number;
      };
  severity?: number;
  data: T;
};

export type ProblemRendererProps<T> = {
  events: AnyEvent[];
  problem: Problem<T>;
  info: Info;
};
export type ProblemRenderer<T> = (props: ProblemRendererProps<T>) => JSX.Element;

function NoProblem() {
  return (
    <div className="problem-list-container no-problems">
      <span>
        <i className="glyphicon glyphicon-ok" />
        No problems found.
      </span>
    </div>
  );
}

export default function ProblemList<T>({
  renderer: Component,
  problems,
  events,
  info,
}: {
  problems: Array<Problem<T>>;
  events: AnyEvent[];
  renderer: ProblemRenderer<T>;
  info: Info;
}) {
  const sortedProblems = useMemo(
    () => problems.sort((a, b) => (b.severity ?? 0) - (a.severity ?? 0)),
    [problems],
  );
  const [problemIndex, setProblemIndex] = useState(0);
  const problem = sortedProblems[problemIndex];

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
          Problem Point {problemIndex + 1} of {sortedProblems.length}
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
