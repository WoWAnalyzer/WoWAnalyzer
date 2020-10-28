import React from 'react';
import PropTypes from 'prop-types';
import { Trans } from '@lingui/macro';

const Checklist = ({ children }) => (
  <div className="panel">
    <div className="panel-heading">
      <Trans id="interface.report.results.checklist.title" render="h1">Checklist</Trans>
      <Trans id="interface.report.results.checklist.subTitle" render="small">A quick overview of the important parts to see what you did well and what has room for improvement.</Trans>
    </div>
    <div className="panel-body">
      {children ? children : (
        <div className="item-divider" style={{ padding: '10px 22px' }}>
          <div className="alert alert-danger">
            <Trans>The checklist for this spec is not yet available. We could use your help to add this. See <a href="https://github.com/WoWAnalyzer/WoWAnalyzer">GitHub</a> or join us on <a href="https://discord.gg/AxphPxU">Discord</a> if you're interested in contributing this.</Trans>
          </div>
        </div>
      )}
    </div>
  </div>
);
Checklist.propTypes = {
  children: PropTypes.node,
};

export default Checklist;
