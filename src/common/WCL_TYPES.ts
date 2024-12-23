import { AnyEvent, CastEvent, DeathEvent, Item } from 'parser/core/Events';
import { WCLReport } from 'parser/core/Report';
import Spell from 'common/SPELLS/Spell';

export interface WCLGuildReport {
  id: string;
  title: string;
  owner: string;
  zone: number;
  start: number;
  end: number;
}

export type WCLGuildReportsResponse = WCLGuildReport[];

export type WCLFightsResponse = WCLReport;

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

export type WCLRanking = {
  name: string;
  class: number;
  spec: number;
  duration: number;
  startTime: number;
  fightID: number;
  reportID: string;
  guildName: string;
  serverName: string;
  regionName: string;
  hidden: boolean;
  talents: WCLRankingTalent[];
  gear: WCLRankingGear[];
} & (
  | {
      total: number;
      itemLevel: number;
    }
  | { amount: number; bracketData: number }
);

interface WCLRankingTalent {
  name: string;
  id: number;
  talentID: number;
  points: number;
  icon: string;
}

export interface WCLRankingGear {
  name: string;
  quality?: string;
  id: number;
  icon: string;
  itemLevel?: string;
  bonusIds?: string[];
  gems?: { id: string; itemLevel: string }[];
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

export interface WCLDamageDoneTableResponse {
  entries: WCLDamageDone[];
  totalTime: number;
}

// These should be the same data. Im just making it so things are logical
// Worst comes to worse we unextend it and just define it. But from my testing
// It works perfectly fine
type WCLDamageDone = WCLDamageTaken;

export interface WCLDamageTaken {
  abilities: Array<{ name: string; total: number; totalReduced: number; type: number }>;
  sources: Array<{ name: string; total: number; totalReduced: number; type: string }>;
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

interface HeroismEvent {
  startTime: number;
  endTime: number;
  startEvent: CastEvent;
}

interface BossSeries {
  name: string;
  id: number;
  guid: number;
  type: 'Boss';
  currentValues: number[];
  data: number[][];
  events: any[];
  maxValues: number[];
}

export interface WCLBossResources {
  deaths: DeathEvent[];
  heroism: HeroismEvent[];
  series: BossSeries[];
}

export interface WCLThreatBand {
  startTime: number;
  endTime: number;
  startEvent: AnyEvent;
  endEvent: AnyEvent;
}

interface WCLThreatTarget {
  name: string;
  id: number;
  guid: number;
  type: string;
  icon: string;
  totalUptime: number;
  bands: WCLThreatBand[];
}

interface WCLThreatEntry {
  name: string;
  id: number;
  guid: number;
  type: string;
  icon: string;
  targets: WCLThreatTarget[];
}

export interface WCLThreatTableResponse {
  threat: WCLThreatEntry[];
}

export interface WCLParse {
  encounterID: number;
  encounterName: string;
  class: string;
  spec: string;
  rank: number;
  outOf: number;
  duration: number;
  startTime: number;
  reportID: string;
  fightID: number;
  difficulty: number;
  size: number;
  characterID: number;
  characterName: string;
  server: string;
  percentile: number;
  ilvlKeyOrPatch: number;
  covenantID: number;
  soulbindID: number;
  // this will be replaced with the new talent system eventually
  talents: Spell[];
  gear: Item[];
  soulbindPowers: Spell[];
  conduitPowers: Spell[];
  legendaryEffects: Spell[];
  total: number;
  estimated: boolean;
}

export type WCLParsesResponse = WCLParse[] | { hidden: true };

export function isHiddenParsesResponse(data: WCLParsesResponse): data is { hidden: true } {
  return !Array.isArray(data);
}

export type WCLResponseJSON =
  | WCLGuildReportsResponse
  | WCLFightsResponse
  | WCLEventsResponse
  | WCLHealingTableResponse
  | WCLDamageTakenTableResponse
  | WCLRankingsResponse
  | WCLBossResources
  | WCLDamageDoneTableResponse
  | WCLThreatTableResponse
  | WCLParsesResponse;

export interface WclOptions {
  timeout: number;

  [key: string]: number | string | boolean;
}

export enum WclTable {
  Summary = 'summary',
  DamageDone = 'damage-done',
  DamageTaken = 'damage-taken',
  Healing = 'healing',
  Casts = 'casts',
  Summons = 'summons',
  Buffs = 'buffs',
  Debuffs = 'debuffs',
  Deaths = 'deaths',
  Survivability = 'survivability',
  Resources = 'resources',
  ResourceGains = 'resources-gains',
  Threat = 'threat',
}
