import React from 'react';
import PropTypes from 'prop-types';

import './Statistic.css';

const Statistic = ({ children }) => (
  <div className="col-lg-3 col-md-4 col-sm-6 col-xs-12">
    <div className="panel statistic">
      <div className="panel-body">
        {children}
      </div>
    </div>
  </div>
);
Statistic.propTypes = {
  children: PropTypes.node.isRequired,
};

export default Statistic;
