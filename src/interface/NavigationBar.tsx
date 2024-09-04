import { Trans } from '@lingui/macro';
import DiscordIcon from 'interface/icons/DiscordTiny';
import GitHubIcon from 'interface/icons/GitHubMarkSmall';
import PremiumIcon from 'interface/icons/Premium';
import Logo from 'interface/images/logo.svg?react';
import makeAnalyzerUrl from 'interface/makeAnalyzerUrl';
import { getPlayerName } from 'interface/selectors/url/report';
import { getUser } from 'interface/selectors/user';
import Tooltip from 'interface/Tooltip';
import { useWaSelector } from 'interface/utils/useWaSelector';
import { HTMLAttributes, ReactNode } from 'react';
import { Link, useLocation } from 'react-router-dom';

import './NavigationBar.scss';

interface Props extends HTMLAttributes<HTMLDivElement> {
  children?: ReactNode;
}

const NavigationBar = ({ children, ...others }: Props) => {
  const { pathname } = useLocation();
  const playerName = getPlayerName(pathname);
  const report = useWaSelector((state) => state.navigation.report);
  const fight = useWaSelector((state) => state.navigation.fight);
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
        {report ? (
          <div className="menu-item report-title">
            <Link to={report.link}>{report.title}</Link>
          </div>
        ) : null}
        {report ? (
          <div className="menu-item">
            <Link to={report.link}>
              {fight ? (
                fight.title
              ) : (
                <Trans id="interface.layout.navigationBar.fightSelection">Fight selection</Trans>
              )}
            </Link>
          </div>
        ) : null}
        {report && (fight || playerName) && (
          <div className="menu-item">
            <Link to={fight?.link ?? report.link}>
              {playerName ?? (
                <Trans id="interface.layout.navigationBar.playerSelection">Player selection</Trans>
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
                <Trans id="interface.layout.navigationBar.premiumActive">Premium active</Trans>
              }
            >
              <Link to="/premium">
                <PremiumIcon /> <span className="optional">{user.name}</span>
              </Link>
            </Tooltip>
          ) : (
            <Tooltip content={<Trans id="interface.layout.navigationBar.premium">Premium</Trans>}>
              <Link to="/premium" className="premium">
                <PremiumIcon />{' '}
                <span className="optional">
                  <Trans id="interface.layout.navigationBar.premium">Premium</Trans>
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
