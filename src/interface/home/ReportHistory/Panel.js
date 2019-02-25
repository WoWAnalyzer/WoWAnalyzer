import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Trans } from '@lingui/macro';

import { getReportHistory } from 'interface/selectors/reportHistory';

import ReportHistory from './index';

class ReportHistoryPanel extends React.PureComponent {
  static propTypes = {
    reportHistory: PropTypes.array.isRequired,
  };

  render() {
    const { reportHistory } = this.props;

    if (reportHistory.length === 0) {
      // Hide the entire panel if there's nothing tracked yet (first time visitor)
      return null;
    }

    return (
      <>
        <small><Trans>Recently viewed</Trans></small><br />

        <ReportHistory reportHistory={reportHistory} />
      </>
    );
  }
}

const mapStateToProps = state => ({
  reportHistory: getReportHistory(state),
});
export default connect(mapStateToProps, null)(ReportHistoryPanel);
