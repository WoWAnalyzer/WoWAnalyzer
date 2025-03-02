import Fight from 'parser/core/Fight';
import { ChangeEventHandler, useCallback } from 'react';
import { SELECTION_ALL_PHASES, SELECTION_CUSTOM_PHASE } from 'interface/report/hooks/usePhases';
import { formatDuration } from 'common/format';
import { useFight } from '../context/FightContext';

interface DungeonPullSelectorProps {
  fight: Fight;
  selectedPull: string;
  handlePullSelection: (pull: string) => void;
  isLoading: boolean;
}

const DungeonPullSelector = ({
  fight,
  handlePullSelection,
  isLoading,
  selectedPull,
}: DungeonPullSelectorProps) => {
  // we use the raw fight to get fight start time *without* the pull selection modification.
  // without this, a pull "Abc (1:23)" gets displayed as "Abc (0:00)" after you select it.
  const { fight: rawFight } = useFight();
  const handleChange: ChangeEventHandler<HTMLSelectElement> = useCallback(
    (event) => {
      const pullById = (fight.dungeonPulls ?? []).find(
        (pull) => String(pull.id) === event.target.value,
      );
      if (pullById) {
        handlePullSelection(String(pullById.id));
      } else {
        handlePullSelection(SELECTION_ALL_PHASES);
      }
    },
    [fight, handlePullSelection],
  );

  let currentValue: string;
  if (fight.filtered && !selectedPull) {
    currentValue = SELECTION_CUSTOM_PHASE;
  } else if (selectedPull === SELECTION_ALL_PHASES) {
    currentValue = SELECTION_ALL_PHASES;
  } else {
    currentValue = selectedPull;
  }

  return (
    <select
      className="form-control phase"
      disabled={isLoading}
      onChange={handleChange}
      value={currentValue}
    >
      {fight.filtered && !selectedPull && (
        <option key={SELECTION_CUSTOM_PHASE} value={SELECTION_CUSTOM_PHASE}>
          Custom
        </option>
      )}
      <option key={SELECTION_ALL_PHASES} value={SELECTION_ALL_PHASES}>
        All Pulls
      </option>
      {fight.dungeonPulls?.map((pull) => (
        <option key={pull.id} value={`${pull.id}`}>
          {pull.name} ({formatDuration(pull.start_time - rawFight.start_time)})
        </option>
      ))}
    </select>
  );
};
export default DungeonPullSelector;
