import React from 'react';
import PropTypes from 'prop-types';

import { SELECTION_ALL_PHASES } from 'interface/report/PhaseSelection';

class PhaseSelector extends React.PureComponent {
  static propTypes = {
    phases: PropTypes.object.isRequired,
    selectedPhase: PropTypes.number.isRequired,
    handlePhaseSelection: PropTypes.func.isRequired,
  };

  constructor(...args){
    super(...args);
    this.handleChange = this.handleChange.bind(this);
  }

  handleChange(e) {
    this.props.handlePhaseSelection(e.target.value);
  }

  render() {
    const {phases, selectedPhase} = this.props;
    return (
      <form>
        <select
          className="form-control region"
          //ref={this.regionInput}
          defaultValue={selectedPhase}
          onChange={this.handleChange}
          >
          <option key="all" value={SELECTION_ALL_PHASES}>All Phases</option>
          {Object.keys(phases).map((key, index) =>
            <option key={key} value={index}>{phases[key].name}</option>
          )}
          </select>
      </form>
    );
  }
}

export default PhaseSelector;
