import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import { getReportHistory } from 'Interface/selectors/reportHistory';

import ReportHistory from './ReportHistory';

class Panel extends React.PureComponent {
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
      <div className="panel">
        <div className="panel-heading">
          <h2>Recently viewed</h2>
        </div>
        <div className="panel-body" style={{ padding: 0 }}>
          <ReportHistory reportHistory={reportHistory} />
        </div>
      </div>
    );
  }
}

const mapStateToProps = state => ({
  reportHistory: getReportHistory(state),
});
export default connect(mapStateToProps, null)(Panel);

