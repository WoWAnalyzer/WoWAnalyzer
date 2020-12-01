import React from 'react';
import PropTypes from 'prop-types';
import { compose } from 'redux';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';
import { Link } from 'react-router-dom';
import { Trans } from '@lingui/macro';

import getFightName from 'common/getFightName';
import Tooltip from 'common/Tooltip';
import PatreonIcon from 'interface/icons/PatreonTiny';
import DiscordIcon from 'interface/icons/DiscordTiny';
import GitHubIcon from 'interface/icons/GitHubMarkSmall';
import PremiumIcon from 'interface/icons/Premium';
import { ReactComponent as Logo } from 'interface/images/logo.svg';
import { getFightId, getPlayerName, getReportCode } from 'interface/selectors/url/report';
import { getReport } from 'interface/selectors/report';
import { getFightById } from 'interface/selectors/fight';
import { getUser } from 'interface/selectors/user';
import makeAnalyzerUrl from 'interface/common/makeAnalyzerUrl';

import './NavigationBar.scss';

const NavigationBar = props => {
  const { playerName, report, fight, user } = props;

  return (
    <nav className="global">
      <div className="container">
        <div className="menu-item logo required">
          <Link to={makeAnalyzerUrl()}>
            <Logo />
          </Link>
        </div>
        {report && (
          <div className="menu-item report-title">
            <Link to={makeAnalyzerUrl(report)}>{report.title}</Link>
          </div>
        )}
        {report && (
          <div className="menu-item">
            <Link to={makeAnalyzerUrl(report)}>
              {fight ? getFightName(report, fight) : <Trans id="interface.layout.navigationBar.fightSelection">Fight selection</Trans>}
            </Link>
          </div>
        )}
        {report && (fight || playerName) && (
          <div className="menu-item">
            <Link to={makeAnalyzerUrl(report, fight ? fight.id : undefined)}>
              {playerName || <Trans id="interface.layout.navigationBar.playerSelection">Player selection</Trans>}
            </Link>
          </div>
        )}
        <div className="spacer" />
        <div className="menu-item required">
          {user && user.premium ? (
            <Tooltip content={<Trans id="interface.layout.navigationBar.premiumActive">Premium active</Trans>}>
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
        <Tooltip content="Patreon">
          <div className="menu-item optional">
            <a href="https://www.patreon.com/join/wowanalyzer">
              <PatreonIcon />
            </a>
          </div>
        </Tooltip>
      </div>
    </nav>
  );
};

NavigationBar.propTypes = {
  playerName: PropTypes.string,
  report: PropTypes.shape({
    title: PropTypes.string.isRequired,
  }),
  fight: PropTypes.object,
  user: PropTypes.oneOfType([
    PropTypes.shape({
      name: PropTypes.string,
      premium: PropTypes.bool,
    }),
    PropTypes.bool, // false; logged out
  ]),
};

const mapStateToProps = (state, props) => ({
  playerName: getPlayerName(props.location.pathname),

  report: getReportCode(props.location.pathname) && getReport(state),
  fight: getFightById(state, getFightId(props.location.pathname)),
  user: getUser(state),
});

export default compose(withRouter, connect(mapStateToProps))(NavigationBar);
