import { Trans } from '@lingui/macro';
import { ReactNode } from 'react';

import './Checklist.scss';

const Checklist = ({ children }: { children: ReactNode }) => {
  return (
    <ul className="checklist">
      {!children && (
        <li>
          <div className="alert alert-danger">
            <Trans id="shared.checklist.missingChecklist">
              The checklist is not yet available for this spec. See{' '}
              <a href="https://github.com/WoWAnalyzer/WoWAnalyzer">GitHub</a> or join us on{' '}
              <a href="https://discord.gg/AxphPxU">Discord</a> if you're interested in contributing
              this.
            </Trans>
          </div>
        </li>
      )}

      {children}
    </ul>
  );
};

export default Checklist;
