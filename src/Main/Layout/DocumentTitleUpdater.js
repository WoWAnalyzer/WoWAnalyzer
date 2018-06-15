import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import getFightName from 'common/getFightName';
import { getFightId, getPlayerName, getReportCode } from 'selectors/url/report';
import { getFightById } from 'selectors/fight';
import { getReport } from 'selectors/report';

const fightShape = {
  start_time: PropTypes.number.isRequired,
  end_time: PropTypes.number.isRequired,
  name: PropTypes.string.isRequired,
  kill: PropTypes.bool,
  difficulty: PropTypes.number,
};

class DocumentTitleUpdater extends React.PureComponent {
  static propTypes = {
    reportCode: PropTypes.string,
    playerName: PropTypes.string,
    report: PropTypes.shape({
      title: PropTypes.string,
      fights: PropTypes.arrayOf(PropTypes.shape(fightShape)),
    }),
    fight: PropTypes.shape(fightShape),
  };
  render() {
    const { reportCode, playerName, report, fight } = this.props;

    let title = 'WoWAnalyzer';
    if (reportCode && report) {
      if (fight) {
        if (playerName) {
          title = `${getFightName(report, fight)} by ${playerName} in ${report.title} - ${title}`;
        } else {
          title = `${getFightName(report, fight)} in ${report.title} - ${title}`;
        }
      } else {
        title = `${report.title} - ${title}`;
      }
    }
    document.title = title;

    return null;
  }
}

const mapStateToProps = state => ({
  reportCode: getReportCode(state),
  playerName: getPlayerName(state),
  report: getReport(state),
  fight: getFightById(state, getFightId(state)),
});

export default connect(mapStateToProps)(DocumentTitleUpdater);
