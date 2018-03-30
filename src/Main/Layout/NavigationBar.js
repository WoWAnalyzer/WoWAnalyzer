import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';

import { getFightId, getPlayerName } from 'selectors/url/report';
import { getReport } from 'selectors/report';
import { getFightById } from 'selectors/fight';
import { getReportProgress } from 'selectors/reportProgress';

import GithubLogo from '../Images/GitHub-Mark-Light-32px.png';

import FightSelectorHeader from '../Report/FightSelectorHeader';
import PlayerSelectorHeader from '../Report/PlayerSelectorHeader';
import makeAnalyzerUrl from '../makeAnalyzerUrl';

class NavigationBar extends React.PureComponent {
  static propTypes = {
    playerName: PropTypes.string,

    report: PropTypes.shape({
      title: PropTypes.string.isRequired,
    }),
    fight: PropTypes.object,
    progress: PropTypes.number,
  };

  render() {
    const { playerName, report, fight, progress } = this.props;

    return (
      <nav>
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
            <Link to="/login">
              Login
            </Link>
          </div>
          <div className="menu-item main">
            <a href="https://github.com/WoWAnalyzer/WoWAnalyzer">
              <img src={GithubLogo} alt="GitHub logo" /><span className="optional" style={{ paddingLeft: 6 }}> View on GitHub</span>
            </a>
          </div>
        </div>
        <div className="progress" style={{ width: `${progress * 100}%`, opacity: progress === 0 || progress >= 1 ? 0 : 1 }} />
      </nav>
    );
  }
}

const mapStateToProps = state => ({
  playerName: getPlayerName(state),

  report: getReport(state),
  fight: getFightById(state, getFightId(state)),
  progress: getReportProgress(state),
});

export default connect(
  mapStateToProps
)(NavigationBar);
