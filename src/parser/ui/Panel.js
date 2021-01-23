import React from 'react';
import PropTypes from 'prop-types';

import { Panel as InterfacePanel, ErrorBoundary } from 'interface';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';

const Panel = ({ category = STATISTIC_CATEGORY.PANELS, position, ...others }) => (
  <ErrorBoundary>
    <InterfacePanel {...others} />
  </ErrorBoundary>
);
Panel.propTypes = {
  children: PropTypes.node.isRequired,
  // eslint-disable-next-line react/no-unused-prop-types
  category: PropTypes.oneOf(Object.values(STATISTIC_CATEGORY)),
  // eslint-disable-next-line react/no-unused-prop-types
  position: PropTypes.number,
};
Panel.defaultProps = {
  category: STATISTIC_CATEGORY.PANELS,
};

export default Panel;
