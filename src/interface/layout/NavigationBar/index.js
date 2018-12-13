import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import { Trans, t } from '@lingui/macro';

import PatreonIcon from 'interface/icons/PatreonTiny';
import DiscordIcon from 'interface/icons/DiscordTiny';
import GitHubIcon from 'interface/icons/GitHubMarkSmall';
import PremiumIcon from 'interface/icons/Premium';
import { i18n } from 'interface/RootLocalizationProvider';
import { getFightId, getPlayerName, getReportCode } from 'interface/selectors/url/report';
import { getReport } from 'interface/selectors/report';
import { getFightById } from 'interface/selectors/fight';
import { getReportProgress } from 'interface/selectors/reportProgress';
import { getUser } from 'interface/selectors/user';
import makeAnalyzerUrl from 'interface/common/makeAnalyzerUrl';

import FightSelectorHeader from './FightSelectorHeader';
import PlayerSelectorHeader from './PlayerSelectorHeader';
import LoadingBar from './LoadingBar';
import './NavigationBar.scss';

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
            <Link to={makeAnalyzerUrl()}>
              <img src="/favicon.png" alt="WoWAnalyzer logo" />
            </Link>
          </div>
          {report && (
            <div className="menu-item report-title">
              <Link to={makeAnalyzerUrl(report)}>{report.title}</Link>
            </div>
          )}
          {report && fight && (
            <FightSelectorHeader className="menu-item" data-tip={i18n._(t`Change fight`)} />
          )}
          {report && playerName && (
            <PlayerSelectorHeader className="menu-item" data-tip={i18n._(t`Change player`)} />
          )}
          <div className="spacer" />
          <div className="menu-item required">
            {user && user.premium ? (
              <Link to="/premium" data-tip="Premium active">
                <PremiumIcon /> <span className="optional">{user.name}</span>
              </Link>
            ) : (
              <Link to="/premium" className="premium" data-tip={i18n._(t`Premium`)}>
                <PremiumIcon /> <span className="optional"><Trans>Premium</Trans></span>
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
