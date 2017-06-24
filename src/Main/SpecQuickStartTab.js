import React from 'react';
import PropTypes from 'prop-types';
import Toggle from 'react-toggle';
import 'react-toggle/style.css';

import UpArrow from 'Icons/UpArrow';

import Icon from 'common/Icon';

import ISSUE_IMPORTANCE from 'Parser/Core/ISSUE_IMPORTANCE';

class SpecQuickStartTab extends React.Component {
  static propTypes = {
    parser: PropTypes.object.isRequired,
  };

  render() {
    const { parser } = this.props;

    return (
      <div>
        <div className="panel-heading">
          <h2>Spec Quick Start</h2>
        </div>
        <div style={{ padding: 0 }}>
          
        </div>
      </div>
    );
  }
}

export default SpecQuickStartTab;
