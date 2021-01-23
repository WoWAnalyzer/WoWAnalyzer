import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { t, Trans } from '@lingui/macro';
import { Link, withRouter } from 'react-router-dom';
import Toggle from 'react-toggle';
import { compose } from 'redux';

import getFightName from 'common/getFightName';
import Tooltip from 'interface/Tooltip';
import makeAnalyzerUrl from 'interface/makeAnalyzerUrl';
import { getFightId } from 'interface/selectors/url/report';
import { getFightFromReport } from 'interface/selectors/fight';
import DocumentTitle from 'interface/DocumentTitle';
import ReportDurationWarning, { MAX_REPORT_DURATION } from 'interface/report/ReportDurationWarning';
import ClassicLogWarning from 'interface/report/ClassicLogWarning';

import FightSelectionPanel from './FightSelectionPanel';

class FightSelection extends React.PureComponent {
  static propTypes = {
    report: PropTypes.shape({
      code: PropTypes.string.isRequired,
      title: PropTypes.string.isRequired,
      fights: PropTypes.array.isRequired,
      start: PropTypes.number.isRequired,
      end: PropTypes.number.isRequired,
      gameVersion: PropTypes.number.isRequired,
    }).isRequired,
    refreshReport: PropTypes.func.isRequired,
    children: PropTypes.func.isRequired,
    fightId: PropTypes.number,
  };
  state = {
    killsOnly: false,
  };

  componentDidMount() {
    this.scrollToTop();
  }
  scrollToTop() {
    window.scrollTo(0, 0);
  }

  renderFightSelection() {
    const { report, refreshReport } = this.props;
    const { killsOnly } = this.state;

    const reportDuration = report.end - report.start;

    return (
      <div className="container offset fight-selection">
        <div className="flex wrapable" style={{ marginBottom: 15 }}>
          <div className="flex-main" style={{ position: 'relative' }}>
            <div className="back-button">
              <Tooltip content={t({
                id: "interface.report.fightSelection.tooltip.backToHome",
                message: `Back to home`
              })}>
                <Link to="/">
                  <span className="glyphicon glyphicon-chevron-left" aria-hidden="true" />
                  <label>
                    {' '}
                    <Trans id="interface.report.fightSelection.tooltip.home">Home</Trans>
                  </label>
                </Link>
              </Tooltip>
            </div>
            <h1 style={{ lineHeight: 1.4, margin: 0 }}>
              <Trans id="interface.report.fightSelection.fightSelection">Fight selection</Trans>
            </h1>
            <small style={{ marginTop: -5 }}>
              <Trans id="interface.report.fightSelection.fightSelectionDetails">Select the fight you wish to analyze. If a boss or encounter is missing, or the list below is empty, press the Refresh button above to re-pull the log from Warcraft Logs. Additionally, please note that due to the way combat logs work, we are unable to evaluate Target Dummy logs.</Trans>
            </small>
          </div>
          <div className="flex-sub">
            <div>
              <Tooltip
                content={
                  <Trans id="interface.report.fightSelection.tooltip.refreshFightsList">
                    This will refresh the fights list which can be useful if you're live logging.
                  </Trans>
                }
              >
                <Link to={makeAnalyzerUrl(report)} onClick={refreshReport}>
                  <span className="glyphicon glyphicon-refresh" aria-hidden="true" />{' '}
                  <Trans id="interface.report.fightSelection.refresh">Refresh</Trans>
                </Link>
              </Tooltip>
              <span className="toggle-control" style={{ marginLeft: 5 }}>
                <Toggle
                  checked={killsOnly}
                  icons={false}
                  onChange={event => this.setState({ killsOnly: event.currentTarget.checked })}
                  id="kills-only-toggle"
                />
                <label htmlFor="kills-only-toggle">
                  {' '}
                  <Trans id="interface.report.fightSelection.killsOnly">Kills only</Trans>
                </label>
              </span>
            </div>
          </div>
        </div>

        {report.gameVersion === 2 && (
          <ClassicLogWarning />
        )}

        {reportDuration > MAX_REPORT_DURATION && (
          <ReportDurationWarning duration={reportDuration} />
        )}

        {report.gameVersion === 1 && (
          <FightSelectionPanel report={report} refreshReport={refreshReport} killsOnly={killsOnly} />
        )}
      </div>
    );
  }
  render() {
    const { report, fightId } = this.props;

    const fight = getFightFromReport(report, fightId);
    if (!fightId || !fight) {
      return this.renderFightSelection();
    }

    return <>
      {/* TODO: Refactor the DocumentTitle away */}
      <DocumentTitle
        title={
          fight ? t({
            id: "interface.report.fightSelection.documentTitle",
            message: `${getFightName(report, fight)} in ${report.title}`
          }) : report.title
        }
      />

      {this.props.children(fight)}
    </>;
  }
}

const mapStateToProps = (state, props) => ({
  // Because fightId comes from the URL we can't use local state
  fightId: getFightId(props.location.pathname),
});
export default compose(withRouter, connect(mapStateToProps))(FightSelection);
