import React from 'react';

import { SELECTION_ALL_PHASES, SELECTION_CUSTOM_PHASE } from 'interface/report/PhaseParser';
import Fight from 'parser/core/Fight';
import { Phase } from 'raids';

import './PhaseSelector.scss';

const INSTANCE_SEPARATOR = '_INSTANCE_';

interface Props {
  fight: Fight;
  phases: {
    [key: string]: Phase
  };
  selectedPhase: String;
  selectedInstance: number;
  handlePhaseSelection: (phase?: string, instance?: number) => void;
  isLoading: boolean;
}

interface State {
  phases: {
    [key: string]: PhaseSelection
  };
}

interface PhaseSelection {
  name: string,
  key: string,
  instance: number,
  start: number,
  multiple?: boolean,
}

class PhaseSelector extends React.PureComponent<Props, State> {
  private phaseRef: React.RefObject<HTMLSelectElement>;

  constructor(args: Props) {
    super(args);
    this.state = { phases: this.buildPhases() };
    this.phaseRef = React.createRef<HTMLSelectElement>();
    this.handleChange = this.handleChange.bind(this);
  }

  handleChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const selectedPhase = this.state.phases[e.target.value];
    if (selectedPhase) {
      this.props.handlePhaseSelection(selectedPhase.key, selectedPhase.instance);
    } else {
      this.props.handlePhaseSelection(SELECTION_ALL_PHASES, 0);
    }
  }

  //builds a dictionary of phases / phase instances to keep track of in order to be able to attribute a unique "key" to each phase for the dropdown
  //without losing the actual key (and without having to for example replace an "instance token" like an underscore)
  buildPhases() : {[key: string]: PhaseSelection} {
    const phases : PhaseSelection[] = [];
    Object.keys(this.props.phases).forEach(key => {
      const phase = this.props.phases[key];
      if (phase.start.length !== phase.end.length) {
        phases.push({ name: phase.name, key: key, start: phase.start![0], instance: 0 });
      } else {
        phases.push(...phase.start!.map((start, index) => (
          {
            name: phase.name,
            key,
            instance: index,
            start: start,
            multiple: phase.multiple,
          }
        )));
      }
    });
    phases.sort((a, b) => a.start - b.start);
    return phases.reduce((obj, phase) => {
      return {
        ...obj,
        [phase.key + INSTANCE_SEPARATOR + phase.instance]: phase,
      };
    }, {});
  }

  //if phase information changed, build new dictionary of phase selection
  componentDidUpdate(prevProps: Props) {
    if (this.props.phases !== prevProps.phases) {
      this.setState({
        phases: this.buildPhases(),
      });
    }
  }

  render() {
    const { selectedPhase, selectedInstance, fight } = this.props;
    const phases = this.state.phases;
    return (
      <select
        className="form-control phase"
        value={(fight.filtered && !fight.phase) ? SELECTION_CUSTOM_PHASE : (selectedPhase === SELECTION_ALL_PHASES ? SELECTION_ALL_PHASES : selectedPhase + INSTANCE_SEPARATOR + selectedInstance)}
        onChange={this.handleChange}
        ref={this.phaseRef}
        disabled={this.props.isLoading}
      >
        {fight.filtered && !fight.phase && <option key="custom" value={SELECTION_CUSTOM_PHASE}>Custom</option>}
        <option key="all" value={SELECTION_ALL_PHASES}>All Phases</option>
        {Object.keys(phases).map(key =>
          <option key={key} value={key}>{phases[key].name}{phases[key].multiple ? ' ' + (phases[key].instance + 1) : ''}</option>,
        )}
      </select>
    );
  }
}

export default PhaseSelector;
