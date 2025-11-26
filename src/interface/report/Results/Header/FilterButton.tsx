import styled from '@emotion/styled';
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

const Btn = styled.button`
  appearance: none;
  border: none;
  box-shadow: ${design.level2.shadow};
  background: ${design.level2.background};
  border: 1px solid ${design.level2.border};
  border-radius: 0.5rem;
  padding: 0 1rem;
  grid-area: filter;

  align-self: start;
  margin-top: 0.6rem;

  & .glyphicon {
    padding-right: 0.25rem;
    font-size: 75%;
  }

  &:hover {
    filter: brightness(115%);
  }
`;

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
      <Btn ref={ref} onClick={toggleMenu}>
        <span className="glyphicon glyphicon-filter" /> {filterLabel}
      </Btn>
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

const FilterDialogContainer = styled.dialog`
  position: absolute;
  z-index: 1000;
  margin: 0;
  padding: 1rem;

  display: flex;
  flex-direction: column;

  gap: 0.5rem;

  border: 1px solid ${design.level2.border};
  box-shadow: ${design.level1.shadow};
  background: ${design.level1.background};
  border-radius: 0.5rem;

  color: ${design.colors.bodyText};
`;

interface FilterMenuProps extends Props {
  position: Pick<React.CSSProperties, 'top' | 'left'>;
  closeMenu: () => void;
}

const FilterRadioButton = styled.label`
  border: 1px solid ${design.level2.border};
  background: ${design.level2.background};
  box-shadow: ${design.level2.shadow};
  padding: 0.5rem 1rem;
  position: relative;
  flex-grow: 1;
  // z-index hack for shadows
  z-index: 0;

  cursor: pointer;

  font-weight: normal;

  &:first-of-type {
    border-top-left-radius: 0.5rem;
    border-bottom-left-radius: 0.5rem;
  }

  &:last-of-type {
    border-top-right-radius: 0.5rem;
    border-bottom-right-radius: 0.5rem;
  }

  & input[type='radio'] {
    appearance: none;
    background: none;
    border: none;
  }

  &:hover {
    filter: brightness(115%);
  }

  &:has(input[type='radio']:checked) {
    border-color: ${design.colors.wowaYellow};
    background: ${design.level2.background_active};
    z-index: 1;
  }
`;

const FilterRadioGroup = styled.div`
  display: flex;
`;

// TODO: better/custom ui for dungeon pulls?
type FilterMode = 'phase' | 'time';

const TimeFilterContainer = styled.div`
  & .time-input {
    display: flex;
    flex-wrap: nowrap;
    flex-direction: row;
    align-items: center;
  }

  & > form {
    display: flex;
    flex-direction: column;
    gap: 1rem;

    align-items: end;
  }
`;

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
