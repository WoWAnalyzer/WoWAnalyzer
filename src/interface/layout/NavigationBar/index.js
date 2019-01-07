import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import { Trans, t } from '@lingui/macro';

import getFightName from 'common/getFightName';
import Tooltip from 'common/Tooltip';
import PatreonIcon from 'interface/icons/PatreonTiny';
import DiscordIcon from 'interface/icons/DiscordTiny';
import GitHubIcon from 'interface/icons/GitHubMarkSmall';
import PremiumIcon from 'interface/icons/Premium';
import Logo from 'interface/images/logo.svg';
import { i18n } from 'interface/RootLocalizationProvider';
import { getFightId, getPlayerName, getReportCode } from 'interface/selectors/url/report';
import { getReport } from 'interface/selectors/report';
import { getFightById } from 'interface/selectors/fight';
import { getReportProgress } from 'interface/selectors/reportProgress';
import { getUser } from 'interface/selectors/user';
import makeAnalyzerUrl from 'interface/common/makeAnalyzerUrl';
import FightSelectionPanel from 'interface/report/FightSelectionPanel';
import Modal from 'interface/modals/Modal';

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

  constructor() {
    super();
    this.handleFightClick = this.handleFightClick.bind(this);
    this.handleFightSelectionModalClose = this.handleFightSelectionModalClose.bind(this);
    this.state = {
      isFightSelectionModalOpen: false,
    };
  }

  handleFightClick(e) {
    e.preventDefault();
    this.setState({
      isFightSelectionModalOpen: true,
    });
  }
  handleFightSelectionModalClose() {
    this.setState({
      isFightSelectionModalOpen: false,
    });
  }

  render() {
    const { playerName, report, fight, progress, user } = this.props;

    return (
      <nav className="global">
        <div className="container">
          <div className="menu-item logo required">
            <Link to={makeAnalyzerUrl()}>
              <img src={Logo} alt="WoWAnalyzer logo" />
            </Link>
          </div>
          {report && (
            <div className="menu-item report-title">
              <Link to={makeAnalyzerUrl(report)}>{report.title}</Link>
            </div>
          )}
          {report && fight && (
            <div className="menu-item">
              <Link to={makeAnalyzerUrl(report)} onClick={this.handleFightClick}>{getFightName(report, fight)}</Link>
              {this.state.isFightSelectionModalOpen && (
                <Modal onClose={this.handleFightSelectionModalClose}>
                  <FightSelectionPanel report={report} />
                </Modal>
              )}
            </div>
          )}
          {report && playerName && (
            <div className="menu-item">
              <Link to={makeAnalyzerUrl(report, fight ? fight.id : undefined)}>{playerName}</Link>
            </div>
          )}
          <div className="spacer" />
          <div className="menu-item required">
            {user && user.premium ? (
              <Link to="/premium">
                <Tooltip content="Premium active" tagName="div">
                  <PremiumIcon /> <span className="optional">{user.name}</span>
                </Tooltip>
              </Link>
            ) : (
              <Link to="/premium" className="premium">
                <Tooltip content={i18n._(t`Premium`)} tagName="div">
                  <PremiumIcon /> <span className="optional"><Trans>Premium</Trans></span>
                </Tooltip>
              </Link>
            )}
          </div>
          <Tooltip className="menu-item optional" content="Discord" tagName="div">
            <a href="https://wowanalyzer.com/discord">
              <DiscordIcon />
            </a>
          </Tooltip>
          <Tooltip className="menu-item optional" content="GitHub" tagName="div">
            <a href="https://github.com/WoWAnalyzer/WoWAnalyzer">
              <GitHubIcon />
            </a>
          </Tooltip>
          <Tooltip className="menu-item optional" content="Patreon" tagName="div">
            <a href="https://www.patreon.com/wowanalyzer">
              <PatreonIcon />
            </a>
          </Tooltip>
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
  mapStateToProps,
  {
    // openModal,
  }
)(NavigationBar);
