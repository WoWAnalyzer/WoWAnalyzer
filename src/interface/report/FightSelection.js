import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import ReactTooltip from 'react-tooltip';
import { t } from '@lingui/macro';

import getFightName from 'common/getFightName';
import { i18n } from 'interface/RootLocalizationProvider';
import makeAnalyzerUrl from 'interface/common/makeAnalyzerUrl';
import { getFightId } from 'interface/selectors/url/report';
import { getFightFromReport } from 'interface/selectors/fight';
import DocumentTitle from 'interface/common/DocumentTitle';

import FightSelectionPanel from './FightSelectionPanel';

class FightSelection extends React.PureComponent {
  static propTypes = {
    report: PropTypes.shape({
      code: PropTypes.string.isRequired,
      title: PropTypes.string.isRequired,
      fights: PropTypes.array.isRequired,
    }),
    refreshReport: PropTypes.func.isRequired,
    children: PropTypes.func.isRequired,
    fightId: PropTypes.number,
  };

  componentWillUnmount() {
    ReactTooltip.hide();
  }

  renderFightSelection() {
    const { report, refreshReport } = this.props;

    return (
      <div className="container">
        <div className="row">
          <div className="col-lg-10 col-md-8" style={{ position: 'relative' }}>
            <div className="back-button" style={{ fontSize: 36, width: 20 }}>
              <Link to={makeAnalyzerUrl()} data-tip={i18n._(t`Back to home`)}>
                <span className="glyphicon glyphicon-chevron-left" aria-hidden="true" />
              </Link>
            </div>
            <h1>
              {report.title}
            </h1>
          </div>
          <div className="col-lg-2 col-md-4">
            <a
              href={`https://www.warcraftlogs.com/reports/${report.code}`}
              target="_blank"
              rel="noopener noreferrer"
              className="pull-right"
            >
              <span className="glyphicon glyphicon-link" aria-hidden /> Warcraft Logs
            </a>
          </div>
        </div>

        <FightSelectionPanel
          report={report}
          refreshReport={refreshReport}
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
