import React from 'react';

import ReportHistory from './ReportHistory';

class Panel extends React.PureComponent {
  render() {
    return (
      <div className="panel">
        <div className="panel-heading">
          <h2>Recently viewed reports</h2>
        </div>
        <div className="panel-body" style={{ padding: 0 }}>
          <ReportHistory />
        </div>
      </div>
    );
  }
}

export default Panel;
