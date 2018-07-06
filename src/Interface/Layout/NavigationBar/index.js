import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';

import PatreonIcon from 'Interface/Icons/PatreonTiny';
import DiscordIcon from 'Interface/Icons/DiscordTiny';
import GitHubIcon from 'Interface/Icons/GitHubMarkSmall';
import PremiumIcon from 'Interface/Icons/Premium';
import { getFightId, getPlayerName, getReportCode } from 'Interface/selectors/url/report';
import { getReport } from 'Interface/selectors/report';
import { getFightById } from 'Interface/selectors/fight';
import { getReportProgress } from 'Interface/selectors/reportProgress';
import { getUser } from 'Interface/selectors/user';
import makeAnalyzerUrl from 'Interface/common/makeAnalyzerUrl';

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
            <Link to={makeAnalyzerUrl()} data-tip="Home">
              <img src="/favicon.png" alt="WoWAnalyzer logo" />
            </Link>
          </div>
          {report && (
            <div className="menu-item" data-tip="Back to fight selection">
              <Link to={makeAnalyzerUrl(report)}>{report.title}</Link>
            </div>
          )}
          {report && fight && (
            <FightSelectorHeader className="menu-item" data-tip="Change fight" />
          )}
          {report && playerName && (
            <PlayerSelectorHeader className="menu-item" data-tip="Change player" />
          )}
          <div className="spacer" />
          <div className="menu-item required">
            {user && user.premium ? (
              <Link to="/premium" data-tip="Premium active">
                <PremiumIcon /> <span className="optional">{user.name}</span>
              </Link>
            ) : (
              <Link to="/premium" className="premium" data-tip="Premium">
                <PremiumIcon /> <span className="optional">Premium</span>
              </Link>
            )}
          </div>
          <div className="menu-item optional" data-tip="Discord">
            <a href="https://wowanalyzer.com/discord">
              <DiscordIcon />
            </a>
          </div>
          <div className="menu-item optional" data-tip="GitHub">
            <a href="https://github.com/WoWAnalyzer/WoWAnalyzer">
              <GitHubIcon />
            </a>
          </div>
          <div className="menu-item optional" data-tip="Patreon">
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

  report: getReportCode(state) && getReport(state),
  fight: getFightById(state, getFightId(state)),
  progress: getReportProgress(state),
  user: getUser(state),
});

export default connect(
  mapStateToProps
)(NavigationBar);
