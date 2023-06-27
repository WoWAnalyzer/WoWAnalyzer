
import getFightName from 'common/getFightName';
import DiscordIcon from 'interface/icons/DiscordTiny';
import GitHubIcon from 'interface/icons/GitHubMarkSmall';
import PremiumIcon from 'interface/icons/Premium';
import { ReactComponent as Logo } from 'interface/images/logo.svg';
import makeAnalyzerUrl from 'interface/makeAnalyzerUrl';
import { getFightById } from 'interface/selectors/fight';
import { getReport } from 'interface/selectors/report';
import { getFightId, getPlayerName, getReportCode } from 'interface/selectors/url/report';
import { getUser } from 'interface/selectors/user';
import Tooltip from 'interface/Tooltip';
import { useWaSelector } from 'interface/utils/useWaSelector';
import { HTMLAttributes, ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { useLocation } from 'react-router-dom';

import './NavigationBar.scss';

interface Props extends HTMLAttributes<HTMLDivElement> {
  children?: ReactNode;
}

const NavigationBar = ({ children, ...others }: Props) => {
  const { pathname } = useLocation();
  const playerName = getPlayerName(pathname);
  const report = useWaSelector((state) => getReportCode(pathname) && getReport(state));
  const fight = useWaSelector((state) => getFightById(state, getFightId(pathname)));
  const user = useWaSelector((state) => getUser(state));

  return (
    <nav className="global" {...others}>
      <div className="container">
        <div className="menu-item logo required">
          <Link to={makeAnalyzerUrl()}>
            <Logo />
          </Link>
        </div>
        {children && <div className="menu-item">{children}</div>}
        {report && (
          <div className="menu-item report-title">
            <Link to={makeAnalyzerUrl(report)}>{report.title}</Link>
          </div>
        )}
        {report && (
          <div className="menu-item">
            <Link to={makeAnalyzerUrl(report)}>
              {fight ? (
                getFightName(report, fight)
              ) : (
                <>Fight selection</>
              )}
            </Link>
          </div>
        )}
        {report && (fight || playerName) && (
          <div className="menu-item">
            <Link to={makeAnalyzerUrl(report, fight ? fight.id : undefined)}>
              {playerName || (
                <>Player selection</>
              )}
            </Link>
          </div>
        )}
        <div className="spacer" />
        <Tooltip content="Discord">
          <div className="menu-item optional">
            <a href="https://wowanalyzer.com/discord">
              <DiscordIcon />
            </a>
          </div>
        </Tooltip>
        <Tooltip content="GitHub">
          <div className="menu-item optional">
            <a href="https://github.com/WoWAnalyzer/WoWAnalyzer">
              <GitHubIcon />
            </a>
          </div>
        </Tooltip>
        <div className="menu-item required">
          {user && user.premium ? (
            <Tooltip
              content={
                <>Premium active</>
              }
            >
              <Link to="/premium">
                <PremiumIcon /> <span className="optional">{user.name}</span>
              </Link>
            </Tooltip>
          ) : (
            <Tooltip content={<>Premium</>}>
              <Link to="/premium" className="premium">
                <PremiumIcon />{' '}
                <span className="optional">
                  <>Premium</>
                </span>
              </Link>
            </Tooltip>
          )}
        </div>
      </div>
    </nav>
  );
};

export default NavigationBar;
