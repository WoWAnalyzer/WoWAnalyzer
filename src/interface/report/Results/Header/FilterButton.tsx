import { formatDuration } from 'common/format';
import * as design from 'interface/design-system';
import { useReport } from 'interface/report/context/ReportContext';
import React, { ChangeEvent, JSX, useCallback, useMemo } from 'react';
import { useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import TimeFilter from '../TimeFilter';
import Fight from 'parser/core/Fight';
import { SELECTION_ALL_PHASES, SELECTION_CUSTOM_PHASE } from 'interface/report/hooks/usePhases';
import { Filter } from 'interface/report/hooks/useTimeEventFilter';
import { useFight } from 'interface/report/context/FightContext';
import Select from 'interface/controls/Select';
import useClickOutsideHandler from 'interface/hooks/useClickOutsideHandler';
import Button from 'interface/controls/Button';
import styles from './FilterButton.module.scss';

interface Props {
  fight: Fight;
  handlePhaseSelection: (phaseIndex: number) => void;
  handleTimeSelection: (start: number, end: number) => void;
  timeFilter: Filter | undefined;
  selectedPhaseIndex: number;
}

export default function FilterButton(props: Props): JSX.Element | null {
  const ref = useRef<HTMLButtonElement | null>(null);
  const dialogRef = useRef<HTMLDialogElement | null>(null);
  const [showMenu, setShowMenu] = useState(false);
  const [position, setPosition] = useState<FilterMenuProps['position']>({});
  const closeMenu = useCallback(() => {
    setShowMenu(false);
  }, []);
  const toggleMenu = useCallback(() => {
    setShowMenu((v) => !v);
    setPosition(
      ref.current
        ? {
            top: `calc(${window.scrollY + ref.current.getBoundingClientRect().top + ref.current.clientHeight}px + 0.5rem)`,
            left: window.scrollX + ref.current.getBoundingClientRect().left,
          }
        : {},
    );
  }, []);

  useClickOutsideHandler([ref, dialogRef], closeMenu);
  const phases = usePhases();

  const filterLabel = useMemo(() => {
    if (props.selectedPhaseIndex >= 0) {
      return `Filter: ${
        phases.find((phase) => phase.value === props.selectedPhaseIndex)?.label ?? 'Unknown Phase'
      }`;
    }
    if (props.timeFilter) {
      const startTime = props.fight.start_time - props.fight.offset_time;
      return `Filter: ${formatDuration(props.timeFilter.start - startTime, 2)} to ${formatDuration(props.timeFilter.end - startTime, 2)}`;
    }

    return 'Filter';
  }, [props.selectedPhaseIndex, props.timeFilter, phases, props.fight]);

  return (
    <>
      <Button className={styles.filterButton} ref={ref} onClick={toggleMenu}>
        <span className="glyphicon glyphicon-filter" /> {filterLabel}
      </Button>
      {showMenu &&
        createPortal(
          <FilterMenu
            key={props.fight.id}
            {...props}
            ref={dialogRef}
            position={position}
            closeMenu={closeMenu}
          />,
          document.body,
        )}
    </>
  );
}

interface FilterMenuProps extends Props {
  position: Pick<React.CSSProperties, 'top' | 'left'>;
  closeMenu: () => void;
}

// TODO: better/custom ui for dungeon pulls?
type FilterMode = 'phase' | 'time';

const filterDialogStyle: React.CSSProperties = {
  border: `1px solid ${design.level2.border}`,
  boxShadow: design.level1.shadow,
  background: design.level1.background,
  color: design.colors.bodyText,
};

const filterRadioGroupStyle = {
  '--filter-radio-border': design.level2.border,
  '--filter-radio-background': design.level2.background,
  '--filter-radio-shadow': design.level2.shadow,
  '--filter-radio-active-border': design.colors.wowaYellow,
  '--filter-radio-active-background': design.level2.background_active,
} as React.CSSProperties;

const FilterMenu = ({
  ref,
  position,
  fight,
  selectedPhaseIndex: selectedPhase,
  handlePhaseSelection,
  handleTimeSelection,
  closeMenu,
}: FilterMenuProps & { ref?: React.RefObject<HTMLDialogElement | null> }): JSX.Element => {
  const phases = usePhases();
  const hasPhases = phases.length > 0 || (fight.dungeonPulls && fight.dungeonPulls.length > 0);
  const [selectedMode, setSelectedMode] = useState<FilterMode>(hasPhases ? 'phase' : 'time');

  const phaseLabel = fight?.dungeonPulls ? 'By Pull' : 'By Phase';
  const allPhasesLabel = fight?.dungeonPulls ? 'Entire Dungeon' : 'All Phases';

  const selectPhase = useCallback(
    (e: ChangeEvent<HTMLSelectElement>) => {
      handlePhaseSelection(Number(e.target.value));
      closeMenu();
    },
    [handlePhaseSelection, closeMenu],
  );

  const setTimeFilter = useCallback(
    (start: number, end: number) => {
      handleTimeSelection(start, end);
      closeMenu();
    },
    [handleTimeSelection, closeMenu],
  );

  return (
    <dialog
      ref={ref}
      className={styles.filterDialogContainer}
      style={{ ...filterDialogStyle, ...position }}
      open
    >
      {hasPhases && (
        <div className={styles.filterRadioGroup} style={filterRadioGroupStyle}>
          <label className={styles.filterRadioButton}>
            <input
              type="radio"
              name="header-filter-mode"
              value="phase"
              checked={selectedMode === 'phase'}
              onChange={() => setSelectedMode('phase')}
            />
            {phaseLabel}
          </label>
          <label className={styles.filterRadioButton}>
            <input
              type="radio"
              name="header-filter-mode"
              value="time"
              checked={selectedMode === 'time'}
              onChange={() => setSelectedMode('time')}
            />
            By Time
          </label>
        </div>
      )}
      {selectedMode === 'phase' && (
        <div>
          <Select onChange={selectPhase} value={selectedPhase}>
            {selectedPhase === SELECTION_CUSTOM_PHASE && (
              <option key="custom" value={SELECTION_CUSTOM_PHASE}>
                Custom
              </option>
            )}
            <option key="all" value={SELECTION_ALL_PHASES}>
              {allPhasesLabel}
            </option>
            {phases?.map((phase) => (
              <option key={phase.value} value={phase.value}>
                {phase.label}
              </option>
            ))}
          </Select>
        </div>
      )}
      {selectedMode === 'time' && (
        <div className={styles.timeFilterContainer}>
          <TimeFilter fight={fight} isLoading={false} applyFilter={setTimeFilter} />
        </div>
      )}
    </dialog>
  );
};

function usePhases() {
  const { report } = useReport();
  const { fight } = useFight();
  const phases = useMemo(() => {
    if (fight.dungeonPulls) {
      let bossIndex = 0;
      let pullIndex = 0;
      return fight.dungeonPulls.map((pull, index) => ({
        value: index,
        label: `${pull.boss > 0 ? `Boss ${++bossIndex}` : `Pull ${++pullIndex}`}: ${pull.name} (${formatDuration(pull.start_time - fight.start_time)} to ${formatDuration(pull.end_time - fight.start_time)})`,
      }));
    }

    const bossPhases = report?.phases.find((phases) => phases.boss === fight?.boss);

    return (
      fight?.phases?.map((phase, index) => ({
        value: index,
        label: `${bossPhases?.phases[phase.id - 1]} ${phase.startTime > fight.start_time ? `(${formatDuration(phase.startTime - fight.start_time)})` : ''}`,
      })) ?? []
    );
  }, [report?.phases, fight]);

  return phases;
}
