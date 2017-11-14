import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';

import { getReport } from 'selectors/report';
import { getFightById } from 'selectors/fight';

import GithubLogo from '../Images/GitHub-Mark-Light-32px.png';

import FightSelectorHeader from '../FightSelectorHeader';
import PlayerSelectorHeader from '../PlayerSelectorHeader';

import makeAnalyzerUrl from '../makeAnalyzerUrl';

class NavigationBar extends React.PureComponent {
  static propTypes = {
    fightId: PropTypes.number,
    playerName: PropTypes.string,

    report: PropTypes.shape({
      title: PropTypes.string.isRequired,
    }),
    fight: PropTypes.object,
  };

  render() {
    const {
      fightId, playerName,
      report, fight, combatants, parser, progress,
    } = this.props;

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
            <FightSelectorHeader
              className="menu-item"
              fightId={fightId}
              parser={parser}
            />
          )}
          {report && playerName && (
            <PlayerSelectorHeader
              className="menu-item"
              fightId={fightId}
              combatants={combatants || []}
              selectedPlayerName={playerName}
            />
          )}
          <div className="spacer" />
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

const mapStateToProps = (state, { fightId }) => ({
  report: getReport(state),
  fight: getFightById(state, fightId),
});

export default connect(
  mapStateToProps
)(NavigationBar);
