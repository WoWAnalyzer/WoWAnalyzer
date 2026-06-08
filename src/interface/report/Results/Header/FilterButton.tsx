import cssComponent from 'interface/utils/css-component';
import styles from './FilterButton.module.scss';
import { formatDuration } from 'common/format';
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

const FilterContainer = cssComponent('div', styles.FilterContainer, [] as const);

const Btn = cssComponent(Button, styles.Btn, [] as const);

const PullNavBtn = cssComponent(Button, styles.PullNavBtn, [] as const);

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

  const { hasDungeonPulls, canGoPrev, canGoNext, goToPrevPull, goToNextPull } =
    usePullNavigation(props);

  return (
    <>
      <FilterContainer>
        {hasDungeonPulls && <PrevPullButton disabled={!canGoPrev} onClick={goToPrevPull} />}
        <Btn ref={ref} onClick={toggleMenu}>
          <span className="glyphicon glyphicon-filter" /> {filterLabel}
        </Btn>
        {hasDungeonPulls && <NextPullButton disabled={!canGoNext} onClick={goToNextPull} />}
      </FilterContainer>
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

const FilterDialogContainer = cssComponent('dialog', styles.FilterDialogContainer, [] as const);

interface FilterMenuProps extends Props {
  position: Pick<React.CSSProperties, 'top' | 'left'>;
  closeMenu: () => void;
}

const FilterRadioButton = cssComponent('label', styles.FilterRadioButton, [] as const);

const FilterRadioGroup = cssComponent('div', styles.FilterRadioGroup, [] as const);

// TODO: better/custom ui for dungeon pulls?
type FilterMode = 'phase' | 'time';

const TimeFilterContainer = cssComponent('div', styles.TimeFilterContainer, [] as const);

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
    <FilterDialogContainer ref={ref} style={position} open>
      {hasPhases && (
        <FilterRadioGroup>
          <FilterRadioButton>
            <input
              type="radio"
              name="header-filter-mode"
              value="phase"
              checked={selectedMode === 'phase'}
              onChange={() => setSelectedMode('phase')}
            />
            {phaseLabel}
          </FilterRadioButton>
          <FilterRadioButton>
            <input
              type="radio"
              name="header-filter-mode"
              value="time"
              checked={selectedMode === 'time'}
              onChange={() => setSelectedMode('time')}
            />
            By Time
          </FilterRadioButton>
        </FilterRadioGroup>
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
        <TimeFilterContainer>
          <TimeFilter fight={fight} isLoading={false} applyFilter={setTimeFilter} />
        </TimeFilterContainer>
      )}
    </FilterDialogContainer>
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

interface PullNavBtnProps {
  disabled: boolean;
  onClick: () => void;
}

function PrevPullButton({ disabled, onClick }: PullNavBtnProps): JSX.Element {
  return (
    <PullNavBtn onClick={onClick} disabled={disabled} aria-label="Previous pull">
      <span className="glyphicon glyphicon-chevron-left" aria-hidden />
    </PullNavBtn>
  );
}

function NextPullButton({ disabled, onClick }: PullNavBtnProps): JSX.Element {
  return (
    <PullNavBtn onClick={onClick} disabled={disabled} aria-label="Next pull">
      <span className="glyphicon glyphicon-chevron-right" aria-hidden />
    </PullNavBtn>
  );
}

function usePullNavigation({ fight, selectedPhaseIndex, handlePhaseSelection }: Props) {
  const pullCount = fight.dungeonPulls?.length ?? 0;
  const hasDungeonPulls = pullCount > 0;

  const canGoPrev = hasDungeonPulls && selectedPhaseIndex > 0;
  const canGoNext =
    hasDungeonPulls &&
    (selectedPhaseIndex === SELECTION_ALL_PHASES || selectedPhaseIndex < pullCount - 1);

  const goToPrevPull = useCallback(() => {
    if (canGoPrev) {
      handlePhaseSelection(selectedPhaseIndex - 1);
    }
  }, [canGoPrev, handlePhaseSelection, selectedPhaseIndex]);

  const goToNextPull = useCallback(() => {
    if (canGoNext) {
      const isAllPhases = selectedPhaseIndex === SELECTION_ALL_PHASES;
      const isCustomPhase = selectedPhaseIndex === SELECTION_CUSTOM_PHASE;
      handlePhaseSelection(isAllPhases || isCustomPhase ? 0 : selectedPhaseIndex + 1);
    }
  }, [canGoNext, handlePhaseSelection, selectedPhaseIndex]);

  return { hasDungeonPulls, canGoPrev, canGoNext, goToPrevPull, goToNextPull };
}
