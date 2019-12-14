import React from 'react';

import InterfacePanel from 'interface/others/Panel';
import STATISTIC_CATEGORY from 'interface/others/STATISTIC_CATEGORY';
import ErrorBoundary from 'interface/common/ErrorBoundary';

interface Props extends React.ComponentProps<typeof InterfacePanel> {
  children: React.ReactNode;
  category?: string;
  position: number;
}

const Panel = ({
  category = STATISTIC_CATEGORY.PANELS,
  position,
  ...others
}: Props) => (
  <ErrorBoundary>
    <InterfacePanel {...others} />
  </ErrorBoundary>
);

export default Panel;
