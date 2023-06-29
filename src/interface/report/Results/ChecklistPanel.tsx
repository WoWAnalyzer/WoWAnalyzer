
import * as React from 'react';

interface Props {
  children?: React.ReactNode;
}

const Checklist = ({ children }: Props) => (
  <div className="panel">
    <div className="panel-heading">
      <h1>
        <>Checklist</>
      </h1>
      <small>
        <>
          A quick overview of the important parts to see what you did well and what has room for
          improvement.
        </>
      </small>
    </div>
    <div className="panel-body">
      {children ? (
        children
      ) : (
        <div className="item-divider" style={{ padding: '10px 22px' }}>
          <div className="alert alert-danger">
            <>
              The checklist for this spec is not yet available. We could use your help to add this.
              See <a href="https://github.com/WoWAnalyzer/WoWAnalyzer">GitHub</a> or join us on{' '}
              <a href="https://discord.gg/AxphPxU">Discord</a> if you're interested in contributing
              this.
            </>
          </div>
        </div>
      )}
    </div>
  </div>
);

export default Checklist;
