import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import { getReportHistory } from 'selectors/reportHistory';

class ReportHistory extends React.PureComponent {
  static propTypes = {
    reportHistory: PropTypes.arrayOf(PropTypes.shape({
      code: PropTypes.string.isRequired,
      title: PropTypes.string.isRequired,
      start: PropTypes.number.isRequired,
      end: PropTypes.number.isRequired,
    })).isRequired,
  };

  render() {
    const { reportHistory } = this.props;

    return (
      <div className="report-history">
        {reportHistory.reverse().map(report => (
          <div>
            <div className={`playerName ${report.playerClass}`}>{report.playerName}</div>
            <div className="fightName">{report.fightName}</div>
          </div>
        ))}
      </div>
    );
  }
}

const mapStateToProps = state => ({
  reportHistory: getReportHistory(state),
});
export default connect(mapStateToProps, null)(ReportHistory);
