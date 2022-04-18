import { Phase } from 'game/raids';
import usePhases from 'interface/usePhases';
import { PhaseEvent } from 'parser/core/Events';
import { WCLFight } from 'parser/core/Fight';
import { ReactNode } from 'react';

interface Props {
  fight: WCLFight;
  bossPhaseEvents: PhaseEvent[];
  children: (isLoading: boolean, phases: { [key: string]: Phase } | null) => ReactNode;
}

const PhaseParser = ({ children, fight, bossPhaseEvents }: Props) => {
  const phases = usePhases({ fight, bossPhaseEvents, bossPhaseEventsLoaded: true });

  return children(!phases, phases);
};

export default PhaseParser as React.ComponentType<Props>;
