import useTimeEventFilter from 'interface/useTimeEventFilter';
import { AnyEvent, PhaseEvent } from 'parser/core/Events';
import Fight, { WCLFight } from 'parser/core/Fight';
import { ReactNode } from 'react';

interface Props {
  fight: WCLFight;
  filter: Filter;
  phase: string;
  phaseinstance: number;
  bossPhaseEvents: PhaseEvent[];
  events: AnyEvent[];
  children: (isLoading: boolean, events?: AnyEvent[], fight?: Fight) => ReactNode;
}

export interface Filter {
  start: number;
  end: number;
}

const TimeEventFilter = ({ children, ...props }: Props) => {
  const { isLoading, events, fight } = useTimeEventFilter(props);

  return children(isLoading, events, fight);
};

export default TimeEventFilter as React.ComponentType<Props>;
