import Fight from 'parser/core/Fight';
import { ChangeEventHandler } from 'react';
import { SELECTION_ALL_PHASES, SELECTION_CUSTOM_PHASE } from 'interface/report/hooks/usePhases';
import { formatDuration } from 'common/format';

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
  const dungeonPulls = fight.dungeonPulls ?? [];

  const handleChange: ChangeEventHandler<HTMLSelectElement> = (event) => {
    const pullById = dungeonPulls.find((pull) => String(pull.id) === event.target.value);
    if (pullById) {
      handlePullSelection(String(pullById.id));
    } else {
      handlePullSelection(SELECTION_ALL_PHASES);
    }
  };

  let currentValue: string;
  if (fight.filtered && !fight.phase) {
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
      {fight.filtered && !fight.phase && (
        <option key={SELECTION_CUSTOM_PHASE} value={SELECTION_CUSTOM_PHASE}>
          Custom
        </option>
      )}
      <option key={SELECTION_ALL_PHASES} value={SELECTION_ALL_PHASES}>
        All Pulls
      </option>
      {dungeonPulls.map((pull) => (
        <option key={pull.id} value={`${pull.id}`}>
          {pull.name} ({formatDuration(pull.start_time - fight.start_time)})
        </option>
      ))}
    </select>
  );
};
export default DungeonPullSelector;
