import { EventType } from 'parser/core/Events';

export interface BasePhaseFilter {
  type: EventType;
  eventInstance?: number;
}

export interface HealthPhaseFilter extends BasePhaseFilter {
  type: EventType.Health;
  guid: number;
  health: number;
}

export interface ApplyBuffPhaseFilter extends BasePhaseFilter {
  type: EventType.ApplyBuff;
  ability: {
    id: number;
  };
}

export interface RemoveBuffPhaseFilter extends BasePhaseFilter {
  type: EventType.RemoveBuff;
  ability: {
    id: number;
  };
}

export interface ApplyDebuffPhaseFilter extends BasePhaseFilter {
  type: EventType.ApplyDebuff;
  ability: {
    id: number;
  };
}

export interface CastPhaseFilter extends BasePhaseFilter {
  type: EventType.Cast;
  ability: {
    id: number;
  };
}

export interface BeginCastPhaseFilter extends BasePhaseFilter {
  type: EventType.BeginCast;
  ability: {
    id: number;
  };
}

export type PhaseFilter =
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
}
