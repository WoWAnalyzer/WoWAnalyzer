import React from 'react';

import Module from 'Parser/Core/Module';

class NotImplementedYet extends Module {
  statistic() {
    return (
      <div className="col-lg-12">
        <div className="panel statistic-box">
          <div className="panel-heading" style={{ color: 'red' }}>
            <h2>This spec is not yet supported</h2>
          </div>
          <div className="panel-body" style={{ padding: '16px 22px 14px' }}>
            You don't need to to do anything special to add a spec. The real issue preventing specs from being added is that in order to add a spec, you need to have the following 3 properties:<br />
            1. Know the spec well enough to actually create something useful<br />
            2. Know how to program well enough to implement the analysis<br />
            3. Have the time and motivation to actually do it<br /><br />

            If you want to give it a try you can find documentation here:{' '}
            <a href="https://github.com/WoWAnalyzer/WoWAnalyzer/blob/master/README.md">https://github.com/WoWAnalyzer/WoWAnalyzer/blob/master/README.md</a>
          </div>
        </div>
      </div>
    );
  }
}

export default NotImplementedYet;
