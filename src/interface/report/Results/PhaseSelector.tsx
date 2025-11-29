import { Phase } from 'game/raids';
import { SELECTION_ALL_PHASES, SELECTION_CUSTOM_PHASE } from 'interface/report/hooks/usePhases';
import Fight from 'parser/core/Fight';
import * as React from 'react';

import './PhaseSelector.scss';
import { useEffect, useState } from 'react';

const INSTANCE_SEPARATOR = '_INSTANCE_';

interface Props {
  fight: Fight;
  phases: Record<string, Phase>;
  selectedPhase: string;
  selectedInstance: number;
  handlePhaseSelection: (phase: string, instance: number) => void;
  isLoading: boolean;
}

interface PhaseSelection {
  name: string;
  key: string;
  instance: number;
  start: number;
  multiple?: boolean;
}

const PhaseSelector = ({
  fight,
  phases,
  selectedPhase,
  selectedInstance,
  handlePhaseSelection,
  isLoading,
}: Props) => {
  const [phasesState, setPhasesState] = useState<Record<string, PhaseSelection>>(() =>
    buildPhases(),
  );

  useEffect(() => {
    setPhasesState(buildPhases());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phases]);

  const phaseRef = React.useRef<HTMLSelectElement>(null);

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedPhase = phasesState[e.target.value];

    if (selectedPhase) {
      handlePhaseSelection(selectedPhase.key, selectedPhase.instance);
    } else {
      handlePhaseSelection(SELECTION_ALL_PHASES, 0);
    }
  };

  //builds a dictionary of phases / phase instances to keep track of in order to be able to attribute a unique "key" to each phase for the dropdown
  //without losing the actual key (and without having to for example replace an "instance token" like an underscore)
  const buildPhases = (): Record<string, PhaseSelection> => {
    const builtPhases: PhaseSelection[] = [];
    Object.keys(phases).forEach((key) => {
      const phase = phases[key as keyof typeof phases];

      if (phase.start.length !== phase.end.length) {
        builtPhases.push({ name: phase.name, key: key, start: phase.start![0], instance: 0 });
      } else {
        builtPhases.push(
          ...phase.start!.map((start, index) => ({
            name: phase.name,
            key,
            instance: index,
            start: start,
            multiple: phase.multiple,
          })),
        );
      }
    });

    builtPhases.sort((a, b) => a.start - b.start);

    return builtPhases.reduce(
      (obj, phase) => ({
        ...obj,
        [phase.key + INSTANCE_SEPARATOR + phase.instance]: phase,
      }),
      {},
    );
  };

  return (
    <select
      className="form-control phase"
      value={
        fight.filtered && !fight.phase
          ? SELECTION_CUSTOM_PHASE
          : selectedPhase === SELECTION_ALL_PHASES
            ? SELECTION_ALL_PHASES
            : selectedPhase + INSTANCE_SEPARATOR + selectedInstance
      }
      onChange={handleChange}
      ref={phaseRef}
      disabled={isLoading}
    >
      {fight.filtered && !fight.phase && (
        <option key="custom" value={SELECTION_CUSTOM_PHASE}>
          Custom
        </option>
      )}
      <option key="all" value={SELECTION_ALL_PHASES}>
        All Phases
      </option>
      {Object.keys(phasesState).map((key) => (
        <option key={key} value={key}>
          {phasesState[key].name}
          {phasesState[key].multiple ? ' ' + (phasesState[key].instance + 1) : ''}
        </option>
      ))}
    </select>
  );
};

export default PhaseSelector;
