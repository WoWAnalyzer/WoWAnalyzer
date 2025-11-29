import { Trans } from '@lingui/react/macro';
import Icon from 'interface/Icon';
import UpArrow from 'interface/icons/UpArrow';
import SpellIcon from 'interface/SpellIcon';
import ISSUE_IMPORTANCE from 'parser/core/ISSUE_IMPORTANCE';
import { Issue } from 'parser/core/ParseResults';
import { ReactNode, useState } from 'react';

function getIssueImportance(importance: ISSUE_IMPORTANCE) {
  switch (importance) {
    case ISSUE_IMPORTANCE.MAJOR:
      return (
        <Trans id="interface.report.results.overview.suggestions.major">
          Major <UpArrow />
        </Trans>
      );
    case ISSUE_IMPORTANCE.REGULAR:
      return <Trans id="interface.report.results.overview.suggestions.average">Average</Trans>;
    case ISSUE_IMPORTANCE.MINOR:
      return (
        <Trans id="interface.report.results.overview.suggestions.minor">
          Minor <UpArrow style={{ transform: 'rotate(180deg) translateZ(0)' }} />
        </Trans>
      );
    default:
      return '';
  }
}

interface Props extends Omit<Issue, 'issue'> {
  children: ReactNode;
}

const Suggestion = ({ children, icon, spell, stat, importance, details }: Props) => {
  const [expanded, setExpanded] = useState(false);

  const handleClick = () => {
    setExpanded(!expanded);
  };

  return (
    <>
      <li
        className={`item ${importance || ''} ${details ? 'clickable' : ''}`}
        onClick={details ? handleClick : undefined}
      >
        <div className="icon">
          {icon ? <Icon icon={icon} alt="Icon" /> : spell ? <SpellIcon spell={spell} /> : null}
        </div>
        <div className="suggestion">
          {children}
          {stat && <small>{stat}</small>}
        </div>
        <div className="importance">
          {/* element needed for vertical alignment */}
          <div>{getIssueImportance(importance)}</div>
        </div>
      </li>
      {expanded && details && <li>{details()}</li>}
    </>
  );
};

export default Suggestion;
