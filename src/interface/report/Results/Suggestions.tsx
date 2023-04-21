import { Trans } from '@lingui/macro';
import Icon from 'interface/Icon';
import Panel from 'interface/Panel';
import { Suggestion as SuggestionData } from 'parser/core/CombatLogParser';
import ISSUE_IMPORTANCE from 'parser/core/ISSUE_IMPORTANCE';
import { Issue } from 'parser/core/ParseResults';
import { PureComponent, CSSProperties } from 'react';
import Toggle from 'react-toggle';

import Suggestion from './Suggestion';
import './Suggestions.scss';

interface Props {
  children: Array<Issue | SuggestionData>;
  style?: CSSProperties;
}

class Suggestions extends PureComponent<Props> {
  state = {
    showMinorIssues: false,
  };

  render() {
    const { children, ...others } = this.props;

    return (
      <Panel
        title={
          <Trans id="interface.report.results.overview.suggestions.suggestions">Suggestions</Trans>
        }
        explanation={
          <Trans id="interface.report.results.overview.suggestions.explanation">
            Based on what you did in this fight, here are some things we think you might be able to
            improve.
          </Trans>
        }
        actions={
          <div className="pull-right toggle-control">
            <Toggle
              defaultChecked={this.state.showMinorIssues}
              icons={false}
              onChange={(event) => this.setState({ showMinorIssues: event.target.checked })}
              id="minor-issues-toggle"
            />
            <label htmlFor="minor-issues-toggle">
              <Trans id="interface.report.results.overview.suggestions.minorImportance">
                Minor importance
              </Trans>
            </label>
          </div>
        }
        pad={false}
        {...others}
      >
        <ul className="list issues">
          {!children.find((issue) => issue.importance === ISSUE_IMPORTANCE.MAJOR) && (
            <li className="item major" style={{ color: '#25ff00' }}>
              <div className="icon">
                <Icon icon="thumbsup" alt="Thumbsup" />
              </div>
              <div className="suggestion">
                <Trans id="interface.report.results.overview.suggestions.noMajorIssues">
                  There are no major issues in this fight. Good job!
                </Trans>
              </div>
            </li>
          )}
          {children
            .filter(
              (issue) => this.state.showMinorIssues || issue.importance !== ISSUE_IMPORTANCE.MINOR,
            )
            .map((issue, i) =>
              'issue' in issue ? (
                <Suggestion
                  key={i}
                  icon={issue.icon}
                  spell={issue.spell}
                  importance={issue.importance}
                  stat={issue.stat}
                  details={issue.details}
                >
                  {issue.issue}
                </Suggestion>
              ) : (
                <Suggestion
                  key={i}
                  spell={issue.spell}
                  icon={issue.icon}
                  stat={
                    issue.actual && issue.recommended ? (
                      <>
                        {issue.actual} ({issue.recommended})
                      </>
                    ) : (
                      issue.actual || issue.recommended
                    )
                  }
                  importance={issue.importance as unknown as ISSUE_IMPORTANCE}
                >
                  {issue.text}
                </Suggestion>
              ),
            )}
          <li>
            <small>
              <Trans id="interface.report.results.overview.suggestions.improve">
                Some of these suggestions may be nitpicky or fight dependent, but often it's still
                something you could look to improve. Try to focus on improving one thing at a time -
                don't try to improve everything at once.
              </Trans>
            </small>
          </li>
        </ul>
      </Panel>
    );
  }
}

export default Suggestions;
