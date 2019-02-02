import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { t, Trans } from '@lingui/macro';

import { getReportHistory } from 'interface/selectors/reportHistory';
import { i18n } from 'interface/RootLocalizationProvider';
import { hasPremium } from 'interface/selectors/user';

import ReportHistory from './index';

class Panel extends React.PureComponent {
  static propTypes = {
    reportHistory: PropTypes.array.isRequired,
    premium: PropTypes.bool.isRequired,
  };

  render() {
    const { reportHistory, premium } = this.props;

    if (reportHistory.length === 0) {
      // Hide the entire panel if there's nothing tracked yet (first time visitor)
      return null;
    }

    return (
      <>
        <div className="panel">
          <div className="panel-heading">
            <h2><Trans>Recently viewed</Trans></h2>
          </div>
          <div className="panel-body" style={{ padding: 0 }}>
            <ReportHistory reportHistory={reportHistory} />
          </div>
        </div>

        {premium === false && (
          <div className="panel">
            <div className="panel-heading">
              <h2><Trans>Advertisement</Trans></h2>
            </div>
            <div className="panel-body" style={{ padding: 0, overflow: 'hidden', textAlign: 'center', background: '#222' }}>
              <a href="/premium">
                <img src="/img/patreon6.jpg" alt={i18n._(t`WoWAnalyzer Premium`)} />
              </a>
            </div>
            <div className="panel-footer" style={{ lineHeight: 1 }}>
              <a href="mailto:wowanalyzer-ad@martijnhols.nl" className="text-muted"><Trans>Your ad here?</Trans></a>
            </div>
          </div>
        )}
      </>
    );
  }
}

const mapStateToProps = state => ({
  reportHistory: getReportHistory(state),
  premium: hasPremium(state),
});
export default connect(mapStateToProps, null)(Panel);
