import { EventType } from 'parser/core/Events';

interface BasePhaseFilter {
  type: EventType;
  eventInstance?: number;
}

interface HealthPhaseFilter extends BasePhaseFilter {
  type: EventType.Health;
  guid: number;
  health: number;
}

interface ApplyBuffPhaseFilter extends BasePhaseFilter {
  type: EventType.ApplyBuff;
  ability: {
    id: number;
  };
}

interface RemoveBuffPhaseFilter extends BasePhaseFilter {
  type: EventType.RemoveBuff;
  ability: {
    id: number;
  };
}

interface ApplyDebuffPhaseFilter extends BasePhaseFilter {
  type: EventType.ApplyDebuff;
  ability: {
    id: number;
  };
}

interface CastPhaseFilter extends BasePhaseFilter {
  type: EventType.Cast;
  ability: {
    id: number;
  };
}

interface BeginCastPhaseFilter extends BasePhaseFilter {
  type: EventType.BeginCast;
  ability: {
    id: number;
  };
}

type PhaseFilter =
  | HealthPhaseFilter
  | ApplyBuffPhaseFilter
  | RemoveBuffPhaseFilter
  | ApplyDebuffPhaseFilter
  | CastPhaseFilter
  | BeginCastPhaseFilter;

export default interface PhaseConfig {
  name: string;
  key: string;
  difficulties: number[];
  filter?: PhaseFilter;
  multiple?: boolean;
  instance?: number;
  intermission?: boolean;
}
