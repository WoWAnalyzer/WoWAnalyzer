import React from 'react';
import PropTypes from 'prop-types';

class HpmBreakdown extends React.Component {
  static propTypes = {
    tracker: PropTypes.object.isRequired,
    showSpenders: PropTypes.bool,
  };

  render() {
    const { tracker, showSpenders } = this.props;
    const resourceName = tracker.resource.name;

    return (
      <div>
        <table className="data-table">
          <thead>
            <tr>
              <th>Ability</th>
              <th colSpan="2">{resourceName} generated</th>
              <th colSpan="2"><dfn data-tip="This is the amount of resources that were generated while you were already at cap.">{resourceName} wasted</dfn></th>
            </tr>
          </thead>
          <tbody>
            <td>Ability</td>
            <td colSpan="2">{resourceName} generated</td>
            <td colSpan="2"><dfn data-tip="This is the amount of resources that were generated while you were already at cap.">{resourceName} wasted</dfn></td>
          </tbody>
        </table>
      </div>
    );
  }
}

export default HpmBreakdown;
