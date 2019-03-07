import React from 'react';
import PropTypes from 'prop-types';

import InterfacePanel from 'interface/others/Panel';
import STATISTIC_CATEGORY from 'interface/others/STATISTIC_CATEGORY';
import ErrorBoundary from 'interface/common/ErrorBoundary';

const Panel = ({ category, position, ...others }) => (
  <ErrorBoundary>
    <InterfacePanel
      {...others}
    />
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
