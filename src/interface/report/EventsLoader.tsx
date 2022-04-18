import useEvents from 'interface/useEvents';
import { AnyEvent } from 'parser/core/Events';
import { WCLFight } from 'parser/core/Fight';
import { PlayerInfo } from 'parser/core/Player';
import Report from 'parser/core/Report';
import * as React from 'react';

interface Props {
  report: Report;
  fight: WCLFight;
  player: PlayerInfo;
  children: (isLoading: boolean, events: AnyEvent[] | null) => React.ReactNode;
}

// TODO: Refactor Report to a functional component so this component can be
//  removed in favor of using the hook
const EventsLoader = ({ children, report, fight, player }: Props) => {
  const events = useEvents({ report, fight, player });

  return children(!events, events);
};

export default EventsLoader as React.ComponentType<Props>;
