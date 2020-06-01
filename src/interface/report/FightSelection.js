import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { t, Trans } from '@lingui/macro';
import { Link } from 'react-router-dom';
import Toggle from 'react-toggle';

import getFightName from 'common/getFightName';
import Tooltip from 'common/Tooltip';
import { i18n } from 'interface/RootLocalizationProvider';
import makeAnalyzerUrl from 'interface/common/makeAnalyzerUrl';
import { getFightId } from 'interface/selectors/url/report';
import { getFightFromReport } from 'interface/selectors/fight';
import DocumentTitle from 'interface/DocumentTitle';
import ReportDurationWarning, { MAX_REPORT_DURATION } from 'interface/report/ReportDurationWarning';

import FightSelectionPanel from './FightSelectionPanel';

class FightSelection extends React.PureComponent {
  static propTypes = {
    report: PropTypes.shape({
      code: PropTypes.string.isRequired,
      title: PropTypes.string.isRequired,
      fights: PropTypes.array.isRequired,
      start: PropTypes.number.isRequired,
      end: PropTypes.number.isRequired,
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
              <Tooltip content={i18n._(t`Back to home`)}>
                <Link to="/">
                  <span className="glyphicon glyphicon-chevron-left" aria-hidden="true" />
                  <label>
                    {' '}<Trans>Home</Trans>
                  </label>
                </Link>
              </Tooltip>
            </div>
            <h1 style={{ lineHeight: 1.4, margin: 0 }}><Trans>Fight selection</Trans></h1>
            <small style={{ marginTop: -5 }}><Trans>Select the fight you wish to analyze.</Trans></small>
          </div>
          <div className="flex-sub">
            <div>
              <Tooltip content={<Trans>This will refresh the fights list which can be useful if you're live logging.</Trans>}>
                <Link
                  to={makeAnalyzerUrl(report)}
                  onClick={refreshReport}
                >
                  <span className="glyphicon glyphicon-refresh" aria-hidden="true" /> <Trans>Refresh</Trans>
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
                  {' '}<Trans>Kills only</Trans>
                </label>
              </span>
            </div>
          </div>
        </div>

        {reportDuration > MAX_REPORT_DURATION &&
        <ReportDurationWarning duration={reportDuration} />}

        <FightSelectionPanel
          report={report}
          refreshReport={refreshReport}
          killsOnly={killsOnly}
        />
      </div>
    );
  }
  render() {
    const { report, fightId } = this.props;

    const fight = getFightFromReport(report, fightId);
    if (!fightId || !fight) {
      return this.renderFightSelection();
    }

    return (
      <>
        {/* TODO: Refactor the DocumentTitle away */}
        <DocumentTitle title={fight ? i18n._(t`${getFightName(report, fight)} in ${report.title}`) : report.title} />

        {this.props.children(fight)}
      </>
    );
  }
}

const mapStateToProps = state => ({
  // Because fightId comes from the URL we can't use local state
  fightId: getFightId(state),
});
export default connect(mapStateToProps)(FightSelection);
