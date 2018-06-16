import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';

import PatreonIcon from 'Icons/PatreonOnDarkTiny';
import DiscordIcon from 'Icons/DiscordTiny';
import GitHubIcon from 'Icons/GitHubMarkSmall';
import PremiumIcon from 'Icons/Premium';

import { getFightId, getPlayerName } from 'selectors/url/report';
import { getReport } from 'selectors/report';
import { getFightById } from 'selectors/fight';
import { getReportProgress } from 'selectors/reportProgress';
import { getUser } from 'selectors/user';

import makeAnalyzerUrl from '../makeAnalyzerUrl';
import FightSelectorHeader from './FightSelectorHeader';
import PlayerSelectorHeader from './PlayerSelectorHeader';
import LoadingBar from './LoadingBar';
import './NavigationBar.css';

class NavigationBar extends React.PureComponent {
  static propTypes = {
    playerName: PropTypes.string,

    report: PropTypes.shape({
      title: PropTypes.string.isRequired,
    }),
    fight: PropTypes.object,
    progress: PropTypes.number,
    user: PropTypes.shape({
      name: PropTypes.string.isRequired,
      premium: PropTypes.bool.isRequired,
    }),
  };

  render() {
    const { playerName, report, fight, progress, user } = this.props;

    return (
      <nav className="global">
        <div className="container">
          <div className="menu-item logo main">
            <Link to={makeAnalyzerUrl()}>
              <img src="/favicon.png" alt="WoWAnalyzer logo" />
            </Link>
          </div>
          {report && (
            <div className="menu-item">
              <Link to={makeAnalyzerUrl(report)}>{report.title}</Link>
            </div>
          )}
          {report && fight && (
            <FightSelectorHeader className="menu-item" />
          )}
          {report && playerName && (
            <PlayerSelectorHeader className="menu-item" />
          )}
          <div className="spacer" />
          <div className="menu-item main left-line">
            {user && user.premium ? (
              <Link to="/premium">
                <PremiumIcon /> <span className="optional">{user.name}</span>
              </Link>
            ) : (
              <Link to="/premium" className="premium">
                <PremiumIcon /> <span className="optional">Premium</span>
              </Link>
            )}
          </div>
          <div className="menu-item main">
            <a href="https://wowanalyzer.com/discord">
              <DiscordIcon />
            </a>
          </div>
          <div className="menu-item main">
            <a href="https://github.com/WoWAnalyzer/WoWAnalyzer">
              <GitHubIcon />
            </a>
          </div>
          <div className="menu-item main">
            <a href="https://www.patreon.com/wowanalyzer">
              <PatreonIcon />
            </a>
          </div>
          <LoadingBar progress={progress} />
        </div>
      </nav>
    );
  }
}

const mapStateToProps = state => ({
  playerName: getPlayerName(state),

  report: getReport(state),
  fight: getFightById(state, getFightId(state)),
  progress: getReportProgress(state),
  user: getUser(state),
});

export default connect(
  mapStateToProps
)(NavigationBar);
