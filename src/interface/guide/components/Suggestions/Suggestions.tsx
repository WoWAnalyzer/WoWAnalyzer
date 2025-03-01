import ParseResults from 'parser/core/ParseResults';
import ISSUE_IMPORTANCE from 'parser/core/ISSUE_IMPORTANCE';
import Icon from 'interface/Icon';
import { Trans } from '@lingui/macro';
import Suggestion from 'interface/report/Results/Suggestion';

interface SuggestionsProps {
  parseResults: Pick<ParseResults, 'issues'>;
  showMinorIssues: boolean;
}
const Suggestions = ({ parseResults, showMinorIssues }: SuggestionsProps) => (
  <ul className="list issues">
    {!parseResults.issues.find((issue) => issue.importance === ISSUE_IMPORTANCE.MAJOR) && (
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
    {parseResults.issues
      .filter((issue) => showMinorIssues || issue.importance !== ISSUE_IMPORTANCE.MINOR)
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
  </ul>
);

export default Suggestions;
