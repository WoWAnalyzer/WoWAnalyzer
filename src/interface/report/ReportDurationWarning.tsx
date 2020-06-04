import React from 'react';
import { Trans } from '@lingui/macro';

import Warning from 'interface/Alert/Warning';
import { formatNumber } from '../../common/format';

interface Props {
  duration: number,
}

const DAYS_IN_MS = 86400000;
export const MAX_REPORT_DURATION = DAYS_IN_MS * 7;

class ReportDurationWarning extends React.PureComponent<Props> {

  get durationInDays() {
    return this.props.duration / DAYS_IN_MS;
  }

  render() {
    return (
      <div className="container">
        <Warning style={{ marginBottom: 30 }}>
          <h2><Trans>Report exceeds supported duration</Trans></h2>
          <Trans>
            The current report contains data collected over <strong>{formatNumber(this.durationInDays)} {this.durationInDays > 1 ? 'days' : 'day'}</strong>.
            This could lead to parsing issues with fights later in the report.
            We recommend that you split your logs before uploading them to warcraftlogs.com.
          </Trans>
        </Warning>
      </div>
    );
  }
}

export default ReportDurationWarning;
