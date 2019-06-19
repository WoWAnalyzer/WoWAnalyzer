import React from 'react';
import PropTypes from 'prop-types';

import { SELECTION_ALL_PHASES } from 'interface/report/PhaseParser';

class PhaseSelector extends React.PureComponent {
  static propTypes = {
    phases: PropTypes.object.isRequired,
    selectedPhase: PropTypes.string.isRequired,
    handlePhaseSelection: PropTypes.func.isRequired,
  };

  constructor(...args){
    super(...args);
    this.handleChange = this.handleChange.bind(this);
  }

  handleChange(e) {
    this.props.handlePhaseSelection(e.target.value || SELECTION_ALL_PHASES);
  }

  render() {
    const {phases, selectedPhase } = this.props;
    return (
      <select
        className="form-control phase"
        defaultValue={selectedPhase}
        onChange={this.handleChange}
      >
        <option key="all" value={SELECTION_ALL_PHASES}>All Phases</option>
        {Object.keys(phases).map(key =>
          <option key={key} value={key}>{phases[key].name}</option>
        )}
      </select>
    );
  }
}

export default PhaseSelector;
