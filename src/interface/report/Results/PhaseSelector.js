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
    this.state = {
      phase: this.props.selectedPhase,
    };
  }

  componentDidUpdate(prevProps, prevState, prevContext) {
    const changed = this.props.selectedPhase !== prevProps.selectedPhase
      || this.props.selectedPhase !== this.state.phase;
    if (changed) {
      this.setState({
        phase: this.props.selectedPhase,
      });
    }
  }

  handleChange(e) {
    const phase = parseInt(e.target.value, 10) || SELECTION_ALL_PHASES;
    this.setState({
      phase: phase,
    });
    this.props.handlePhaseSelection(phase);
  }

  render() {
    const {phases} = this.props;
    return (
      <form>
        <select
          className="form-control region"
          //ref={this.regionInput}
          defaultValue={this.state.phase}
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
