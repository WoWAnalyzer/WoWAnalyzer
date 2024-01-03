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
  /** The phase's name (may be localized) */
  name: string;
  /** Key for this phase, unique per fight.
   *  Will be the same for multiple instances of the same phase. */
  key: string;
  /** Difficulties this phase was done on (will this ever be multiple??) */
  difficulties: number[];
  /** Filter to apply to look for this phase boundary.
   *  Only used for WoWA generated phase boundaries,
   *  will be undefined when we get phase from report data */
  filter?: PhaseFilter;
  /** True iff this phase happens multiple times in a fight */
  multiple?: boolean;
  /** The instance index for this phase, starting from 0 */
  instance?: number;
  /** True iff this phase is an intermission */
  intermission?: boolean;
}
