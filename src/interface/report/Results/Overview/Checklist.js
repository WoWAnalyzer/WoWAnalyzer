import React from 'react';
import PropTypes from 'prop-types';
import { Trans } from '@lingui/macro';

const Checklist = ({ children }) => (
  <div className="panel">
    <div className="panel-heading">
      <h1>
        <Trans id="interface.report.results.checklist.title">Checklist</Trans>
      </h1>
      <small>
        <Trans id="interface.report.results.checklist.subTitle">
          A quick overview of the important parts to see what you did well and what has room for
          improvement.
        </Trans>
      </small>
    </div>
    <div className="panel-body">
      {children ? (
        children
      ) : (
        <div className="item-divider" style={{ padding: '10px 22px' }}>
          <div className="alert alert-danger">
            <Trans id="interface.report.results.checklist.notAvailableYet">
              The checklist for this spec is not yet available. We could use your help to add this.
              See <a href="https://github.com/WoWAnalyzer/WoWAnalyzer">GitHub</a> or join us on{' '}
              <a href="https://discord.gg/AxphPxU">Discord</a> if you're interested in contributing
              this.
            </Trans>
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
