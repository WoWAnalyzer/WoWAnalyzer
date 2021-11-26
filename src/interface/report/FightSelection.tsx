import { t, Trans } from '@lingui/macro';
import getFightName from 'common/getFightName';
import DocumentTitle from 'interface/DocumentTitle';
import makeAnalyzerUrl from 'interface/makeAnalyzerUrl';
import { RootState } from 'interface/reducers';
import ClassicLogWarning from 'interface/report/ClassicLogWarning';
import FightSelectionPanel from 'interface/report/FightSelectionPanel';
import ReportDurationWarning, { MAX_REPORT_DURATION } from 'interface/report/ReportDurationWarning';
import { getFightFromReport } from 'interface/selectors/fight';
import { getFightId } from 'interface/selectors/url/report';
import Tooltip from 'interface/Tooltip';
import { WCLFight } from 'parser/core/Fight';
import Report from 'parser/core/Report';
import React from 'react';
import { connect } from 'react-redux';
import { Link, RouteComponentProps, withRouter } from 'react-router-dom';
import Toggle from 'react-toggle';
import { compose } from 'redux';

interface ConnectedProps {
  fightId: number | null;
}

interface PassedProps {
  report: Report;
  refreshReport: () => void;
  children: (fight: WCLFight) => void;
}

type Props = ConnectedProps & PassedProps;

interface State {
  killsOnly: boolean;
}

class FightSelection extends React.PureComponent<Props, State> {
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
              <Tooltip
                content={t({
                  id: 'interface.report.fightSelection.tooltip.backToHome',
                  message: `Back to home`,
                })}
              >
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
              <Trans id="interface.report.fightSelection.fightSelectionDetails">
                Select the fight you wish to analyze. If a boss or encounter is missing, or the list
                below is empty, press the Refresh button above to re-pull the log from Warcraft
                Logs. Additionally, please note that due to the way combat logs work, we are unable
                to evaluate Target Dummy logs.
              </Trans>
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
                  onChange={(event) => this.setState({ killsOnly: event.currentTarget.checked })}
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

        {report.gameVersion === 2 && <ClassicLogWarning />}

        {reportDuration > MAX_REPORT_DURATION && (
          <ReportDurationWarning duration={reportDuration} />
        )}

        {report.gameVersion !== 2 && <FightSelectionPanel report={report} killsOnly={killsOnly} />}
      </div>
    );
  }
  render() {
    const { report, fightId } = this.props;

    const fight = fightId && getFightFromReport(report, fightId);
    if (!fightId || !fight) {
      return this.renderFightSelection();
    }

    return (
      <>
        {/* TODO: Refactor the DocumentTitle away */}
        <DocumentTitle
          title={
            fight
              ? t({
                  id: 'interface.report.fightSelection.documentTitle',
                  message: `${getFightName(report, fight)} in ${report.title}`,
                })
              : report.title
          }
        />

        {this.props.children(fight)}
      </>
    );
  }
}

const mapStateToProps = (state: RootState, props: RouteComponentProps) => ({
  // Because fightId comes from the URL we can't use local state
  fightId: getFightId(props.location.pathname),
});
export default compose(
  withRouter,
  connect(mapStateToProps),
)(FightSelection) as React.ComponentType<PassedProps>;
