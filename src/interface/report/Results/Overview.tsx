import { ReactNode } from 'react';
import * as React from 'react';

import { useConfig } from '../ConfigContext';

interface Props {
  guide?: React.FC;
}

const Overview = ({ guide: GuideComponent }: Props) => {
  const config = useConfig();

  let alert: ReactNode = null;
  if (config.pages?.overview?.notes) {
    alert = (
      <div
        style={{
          marginBottom: 30,
        }}
      >
        {config.pages.overview.notes}
      </div>
    );
  }

  return GuideComponent ? (
    <div className="container" style={{ display: 'grid', gridTemplateColumns: '100%' }}>
      {alert}
      <GuideComponent />
    </div>
  ) : (
    <div className="container" style={{ display: 'grid', gridTemplateColumns: '100%' }}>
      There is no frontmatter configured for this spec.
    </div>
  );
};

export default Overview;
