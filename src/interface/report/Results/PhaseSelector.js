import React from 'react';
import PropTypes from 'prop-types';

import { SELECTION_ALL_PHASES, SELECTION_CUSTOM_PHASE } from 'interface/report/PhaseParser';

import './PhaseSelector.scss';

class PhaseSelector extends React.PureComponent {
  static propTypes = {
    fight: PropTypes.object.isRequired,
    phases: PropTypes.object.isRequired,
    selectedPhase: PropTypes.string.isRequired,
    handlePhaseSelection: PropTypes.func.isRequired,
    isLoading: PropTypes.bool.isRequired,
  };

  constructor(...args){
    super(...args);
    this.phaseRef = React.createRef();
    this.handleChange = this.handleChange.bind(this);
  }

  handleChange(e) {
    this.props.handlePhaseSelection(e.target.value || SELECTION_ALL_PHASES);
  }

  render() {
    const {phases, selectedPhase, fight} = this.props;
    return (
      <select
        className="form-control phase"
        defaultValue={selectedPhase}
        value={(fight.filtered && !fight.phase) ? SELECTION_CUSTOM_PHASE : selectedPhase}
        onChange={this.handleChange}
        ref={this.phaseRef}
        disabled={this.props.isLoading}
      >
        {fight.filtered && !fight.phase && <option key="custom" value={SELECTION_CUSTOM_PHASE}>Custom</option>}
        <option key="all" value={SELECTION_ALL_PHASES}>All Phases</option>
        {Object.keys(phases).map(key =>
          <option key={key} value={key}>{phases[key].name}</option>
        )}
      </select>
    );
  }
}

export default PhaseSelector;
