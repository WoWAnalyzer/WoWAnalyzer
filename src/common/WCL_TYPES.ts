import { Event } from 'parser/core/Events';
import { WCLFight } from 'parser/core/Fight';

export interface WCLGuildReport {
  "id": string;
  "title": string;
  "owner": string;
  "zone": number;
  "start": number;
  "end": number;
}

export type WCLGuildReportsResponse = WCLGuildReport[];


export interface WCLFightsResponse {
  fights: WCLFight[];
}

export interface WCLEventsResponse {
  events: Event<any>[];
  nextPageTimestamp?: number;
}

export interface WCLHealing {
  total: number;
  overheal?: number;
}

export interface WCLHealingTableResponse {
  entries: WCLHealing[];
}

export type WCLResponseJSON = WCLGuildReportsResponse | WCLFightsResponse | WCLEventsResponse | WCLHealingTableResponse;

export interface WclOptions {
  timeout: number;
  [key: string]: number | string | boolean;
}
