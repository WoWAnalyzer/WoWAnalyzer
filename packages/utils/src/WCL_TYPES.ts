import { WCLFight } from 'parser/core/Fight';
import { AnyEvent } from 'parser/core/Events';

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
  title: string
  fights: WCLFight[];
}

export interface WCLEventsResponse {
  events: AnyEvent[];
  nextPageTimestamp?: number;
}

export interface WCLRankingsResponse {
  page: number;
  hasMorePages: boolean;
  count: number;
  rankings: WCLRanking[];
}

export interface WCLRanking {
  name: string;
  class: number;
  spec: number;
  total: number;
  duration: number;
  startTime: number;
  fightID: number;
  reportID: string;
  guildName: string;
  serverName: string;
  regionName: string;
  hidden: boolean;
  itemLevel: number;
}

export interface WCLHealing {
  total: number;
  overheal?: number;
}

export interface WCLHealingTableResponse {
  entries: WCLHealing[];
}

export interface WCLDamageTakenTableResponse {
  entries: WCLDamageTaken[];
  totalTime: number;
}

export interface WCLDamageTaken {
  abilities: Array<{name: string; total: number; totalReduced: number; type: number;}>;
  sources: Array<{name: string; total: number; totalReduced: number; type: string;}>;
  activeTime: number;
  activeTimeReduced: number;
  efftmi: number;
  blocked: number;
  name: string;
  id: number;
  guid: number;
  total: number;
  overheal?: number;
}

export type WCLResponseJSON = WCLGuildReportsResponse | WCLFightsResponse | WCLEventsResponse | WCLHealingTableResponse | WCLDamageTakenTableResponse | WCLRankingsResponse;

export interface WclOptions {
  timeout: number;
  [key: string]: number | string | boolean;
}
