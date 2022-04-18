import useEventParser from 'interface/useEventParser';
import Config, { Builds } from 'parser/Config';
import CharacterProfile from 'parser/core/CharacterProfile';
import CombatLogParser from 'parser/core/CombatLogParser';
import { AnyEvent, CombatantInfoEvent } from 'parser/core/Events';
import Fight from 'parser/core/Fight';
import { PlayerInfo } from 'parser/core/Player';
import Report from 'parser/core/Report';
import * as React from 'react';

interface Props {
  report: Report;
  fight: Fight;
  config: Config;
  player: PlayerInfo;
  combatants: CombatantInfoEvent[];
  applyTimeFilter: (start: number, end: number) => null;
  applyPhaseFilter: (phase: string, instance: any) => null;
  parserClass: new (...args: ConstructorParameters<typeof CombatLogParser>) => CombatLogParser;
  build?: string;
  builds?: Builds;
  characterProfile: CharacterProfile;
  events: AnyEvent[];
  children: (
    isLoading: boolean,
    progress: number,
    parser: CombatLogParser | null,
  ) => React.ReactNode;
}

const EventParser = ({ children, ...props }: Props) => {
  const { isLoading, progress, parser } = useEventParser(props);

  return children(isLoading, progress, parser);
};

export default EventParser as React.ComponentType<Props>;
