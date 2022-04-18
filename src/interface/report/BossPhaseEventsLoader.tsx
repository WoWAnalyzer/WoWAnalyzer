import BossPhasesState from 'interface/report/BOSS_PHASES_STATE';
import useBossPhaseEvents from 'interface/useBossPhaseEvents';
import { PhaseEvent } from 'parser/core/Events';
import { WCLFight } from 'parser/core/Fight';
import Report from 'parser/core/Report';
import * as React from 'react';

interface Props {
  report: Report;
  fight: WCLFight;
  children: (loadingState: BossPhasesState, events: PhaseEvent[] | null) => React.ReactNode;
}

// TODO: Refactor Report to a functional component so this component can be
//  removed in favor of using the hook
const BossPhaseEventsLoader = ({ children, report, fight }: Props) => {
  const { loadingState, events } = useBossPhaseEvents({ report, fight });

  return children(loadingState, events);
};

export default BossPhaseEventsLoader as React.ComponentType<Props>;
