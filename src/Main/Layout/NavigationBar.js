import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';

import PatreonIcon from 'Icons/PatreonTiny';
import DiscordIcon from 'Icons/DiscordTiny';
import GitHubIcon from 'Icons/GitHubMarkSmall';
import PremiumIcon from 'Icons/Premium';

import { getFightId, getPlayerName, getReportCode } from 'selectors/url/report';
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
          <div className="menu-item logo required">
            <Link to={makeAnalyzerUrl()} data-tip="Home" data-effect="solid">
              <img src="/favicon.png" alt="WoWAnalyzer logo" />
            </Link>
          </div>
          {report && (
            <div className="menu-item" data-tip="Back to fight selection" data-effect="solid">
              <Link to={makeAnalyzerUrl(report)}>{report.title}</Link>
            </div>
          )}
          {report && fight && (
            <FightSelectorHeader className="menu-item" data-tip="Change fight" data-effect="solid" />
          )}
          {report && playerName && (
            <PlayerSelectorHeader className="menu-item" data-tip="Change player" data-effect="solid" />
          )}
          <div className="spacer" />
          <div className="menu-item required">
            {user && user.premium ? (
              <Link to="/premium" data-tip="Premium active" data-effect="solid">
                <PremiumIcon /> <span className="optional">{user.name}</span>
              </Link>
            ) : (
              <Link to="/premium" className="premium" data-tip="Premium" data-effect="solid">
                <PremiumIcon /> <span className="optional">Premium</span>
              </Link>
            )}
          </div>
          <div className="menu-item optional" data-tip="Discord" data-effect="solid">
            <a href="https://wowanalyzer.com/discord">
              <DiscordIcon />
            </a>
          </div>
          <div className="menu-item optional" data-tip="GitHub" data-effect="solid">
            <a href="https://github.com/WoWAnalyzer/WoWAnalyzer">
              <GitHubIcon />
            </a>
          </div>
          <div className="menu-item optional" data-tip="Patreon" data-effect="solid">
            <a href="https://www.patreon.com/wowanalyzer">
              <PatreonIcon />
            </a>
          </div>
        </div>
        <LoadingBar progress={progress} />
      </nav>
    );
  }
}

const mapStateToProps = state => ({
  playerName: getPlayerName(state),

  report: getReportCode(state) && getReport(state),
  fight: getFightById(state, getFightId(state)),
  progress: getReportProgress(state),
  user: getUser(state),
});

export default connect(
  mapStateToProps
)(NavigationBar);
