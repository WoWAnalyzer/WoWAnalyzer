import ParseResults from 'parser/core/ParseResults';
import { Section, useAnalyzers } from 'interface/guide/index';

import Analyzer from 'parser/core/Analyzer';
import { useMemo, useState } from 'react';
import Toggle from 'react-toggle';

import Suggestions from './Suggestions';

interface SuggestionSectionProps<T extends typeof Analyzer> {
  analyzers?: T[];
}

/**
 * Section that can be included in Guides in order to make transitioning away from
 * Suggestions easier.
 *
 * # Example
 *
 * ```
 * <SuggestionSection analyzers={[FoodChecker, WeaponEnhancementChecker]} />
 * ```
 */
const SuggestionSection = <T extends typeof Analyzer>({ analyzers }: SuggestionSectionProps<T>) => {
  const [showMinorIssues, setShowMinorIssues] = useState(false);
  const analyzerInstances = useAnalyzers(analyzers ?? []);
  const parseResults = useMemo(() => {
    const results = new ParseResults();
    analyzerInstances.forEach((analyzer) => {
      const maybeResult = analyzer.suggestions(results.suggestions.when);
      if (maybeResult) {
        maybeResult.forEach((issue) => results.addIssue(issue));
      }
    });
    return results;
  }, [analyzerInstances]);

  return (
    <Section title="Suggestions">
      <div className="flex wrapable">
        <div className="flex-main">
          <small>
            <>
              Based on what you did in this fight, here are some things we think you might be able
              to improve.
            </>
          </small>
        </div>
        <div className="flex-sub action-buttons">
          <div className="pull-right toggle-control">
            <Toggle
              defaultChecked={showMinorIssues}
              icons={false}
              onChange={(event) => setShowMinorIssues(event.target.checked)}
              id="minor-issues-toggle"
            />
            <label htmlFor="minor-issues-toggle">
              <>Minor importance</>
            </label>
          </div>
        </div>
      </div>
      <div className="flex" style={{ paddingTop: 10, paddingBottom: 10 }}>
        <Suggestions parseResults={parseResults} showMinorIssues={showMinorIssues} />
      </div>
      <div className="flex">
        <small>
          <>
            Some of these suggestions may be nitpicky or fight dependent, but often it's still
            something you could look to improve. Try to focus on improving one thing at a time -
            don't try to improve everything at once.
          </>
        </small>
      </div>
    </Section>
  );
};

export default SuggestionSection;
