import type {
  TargetDummyActorAggregate,
  TargetDummyActorDiscoveryResult,
  TargetDummyActorKind,
  TargetDummyConfidenceReason,
  TargetDummyOwnedEntity,
  TargetDummyOwnershipEvidence,
  TargetDummyPlayerCandidate,
  TargetDummySessionCandidate,
  TargetDummySessionDiscoveryOptions,
} from './contracts';
import { TARGET_DUMMY_PRE_ROLL_MS } from './constants';
import { parseCombatLogTimestamp } from '../LocalCombatLogParser';

export const COMBATLOG_OBJECT_AFFILIATION_MINE = 0x00000001;

interface MutableActorAggregate {
  guid: string;
  kind: TargetDummyActorKind;
  name?: string;
  flags: number;
  sourceObservationCount: number;
  targetObservationCount: number;
}

interface MutablePlayerAggregate extends MutableActorAggregate {
  kind: 'player';
  outgoingCastCount: number;
  outgoingDamageCount: number;
  directHostileActionCount: number;
  targetGuids: Set<string>;
}

interface ActorObservation {
  guid: string;
  kind: TargetDummyActorKind;
  name?: string;
  flags: number;
}

interface OwnershipClaim {
  guid: string;
  ownerGuid: string;
  evidence: TargetDummyOwnershipEvidence;
  strength: number;
}

interface MutableSessionWindow {
  playerGuid: string;
  activityStart: number;
  fightStart: number;
  end: number;
  lastQualifyingTime: number;
  targetGuids: Set<string>;
  qualifyingActionCount: number;
  playerInitiatedActionCount: number;
  boundaryGeneration: number;
}

interface ResolvedSessionDiscoveryOptions {
  inactivityThresholdMs: number;
  likelyMinimumDurationMs: number;
  likelyMinimumPlayerInitiatedActions: number;
  likelyMinimumQualifyingActions: number;
  includeIncidental: boolean;
}

interface SessionDiscoveryState {
  openWindows: Map<string, MutableSessionWindow>;
  windows: MutableSessionWindow[];
  playerBoundaryStart: Map<string, number>;
}

function sessionDiscoveryState(): SessionDiscoveryState {
  return {
    openWindows: new Map(),
    windows: [],
    playerBoundaryStart: new Map(),
  };
}

export const DEFAULT_TARGET_DUMMY_SESSION_DISCOVERY_OPTIONS: ResolvedSessionDiscoveryOptions = {
  inactivityThresholdMs: 10_000,
  likelyMinimumDurationMs: 20_000,
  likelyMinimumPlayerInitiatedActions: 2,
  likelyMinimumQualifyingActions: 3,
  includeIncidental: false,
};

const CAST_EVENTS = new Set(['SPELL_CAST_START', 'SPELL_CAST_SUCCESS']);
const DIRECT_DAMAGE_EVENTS = new Set([
  'RANGE_DAMAGE',
  'RANGE_MISSED',
  'SPELL_DAMAGE',
  'SPELL_MISSED',
  'SWING_DAMAGE',
  'SWING_MISSED',
]);
const PERIODIC_DAMAGE_EVENTS = new Set(['SPELL_PERIODIC_DAMAGE']);
const TARGET_END_EVENTS = new Set(['UNIT_DIED', 'UNIT_DESTROYED']);
const HARD_BOUNDARY_EVENTS = new Set(['ZONE_CHANGE', 'MAP_CHANGE']);

export function classifyTargetDummyActorGuid(guid: string): TargetDummyActorKind | undefined {
  if (guid.startsWith('Player-')) return 'player';
  if (guid.startsWith('Creature-')) return 'creature';
  if (guid.startsWith('Pet-')) return 'pet';
  if (guid.startsWith('Guardian-')) return 'guardian';
  if (guid.startsWith('Vehicle-')) return 'vehicle';
  if (guid.startsWith('GameObject-')) return 'game-object';
  return undefined;
}

function parseFlags(value: string | undefined): number {
  if (!value) return 0;
  const flags = Number.parseInt(value, value.startsWith('0x') ? 16 : 10);
  return Number.isFinite(flags) ? flags : 0;
}

function actorObservation(
  fields: readonly string[],
  guidIndex: number,
): ActorObservation | undefined {
  const guid = fields[guidIndex];
  const kind = guid ? classifyTargetDummyActorGuid(guid) : undefined;
  if (!guid || !kind) return undefined;
  const name = fields[guidIndex + 1];
  return {
    guid,
    kind,
    ...(name && name !== 'nil' ? { name } : {}),
    flags: parseFlags(fields[guidIndex + 2]),
  };
}

function targetGuidIndex(fields: readonly string[]): number {
  return classifyTargetDummyActorGuid(fields[6] ?? '') ? 6 : 5;
}

function isNonPlayer(actor: ActorObservation | undefined): actor is ActorObservation {
  return actor !== undefined && actor.kind !== 'player';
}

function isExplicitHostile(fields: readonly string[], event: string): boolean {
  return (
    CAST_EVENTS.has(event) ||
    DIRECT_DAMAGE_EVENTS.has(event) ||
    (event === 'SPELL_AURA_APPLIED' && fields.at(-1) === 'DEBUFF')
  );
}

function ownershipStrength(evidence: TargetDummyOwnershipEvidence): number {
  if (evidence === 'advanced-owner-guid') return 3;
  if (evidence === 'summon' || evidence === 'create') return 2;
  return 1;
}

function resolveOptions(
  options: TargetDummySessionDiscoveryOptions,
): ResolvedSessionDiscoveryOptions {
  const resolved = {
    ...DEFAULT_TARGET_DUMMY_SESSION_DISCOVERY_OPTIONS,
    ...options,
  };
  for (const value of [
    resolved.inactivityThresholdMs,
    resolved.likelyMinimumDurationMs,
    resolved.likelyMinimumPlayerInitiatedActions,
    resolved.likelyMinimumQualifyingActions,
  ]) {
    if (!Number.isFinite(value) || value < 0) {
      throw new RangeError('Target-dummy discovery thresholds must be finite non-negative values.');
    }
  }
  return resolved;
}

function publicActor(actor: MutableActorAggregate): TargetDummyActorAggregate {
  return {
    guid: actor.guid,
    kind: actor.kind,
    ...(actor.name === undefined ? {} : { name: actor.name }),
    flags: actor.flags,
    sourceObservationCount: actor.sourceObservationCount,
    targetObservationCount: actor.targetObservationCount,
  };
}

/**
 * Bounded pass-one actor aggregation. The scanner retains counters and GUID
 * sets only; callers can discard each decoded record immediately after consume.
 */
export class TargetDummyActorDiscovery {
  readonly #actors = new Map<string, MutableActorAggregate>();
  readonly #players = new Map<string, MutablePlayerAggregate>();
  readonly #ownership = new Map<string, OwnershipClaim>();
  readonly #sessionsWithoutAffiliation = sessionDiscoveryState();
  readonly #sessionsWithAffiliation = sessionDiscoveryState();
  readonly #options: ResolvedSessionDiscoveryOptions;
  #recordsScanned = 0;
  #lastTimestamp: number | undefined;
  #segmentStart: number | undefined;
  #boundaryGeneration = 0;
  #combatLogVersionCount = 0;
  #insideEncounter = false;

  constructor(options: TargetDummySessionDiscoveryOptions = {}) {
    this.#options = resolveOptions(options);
  }

  consume(fields: readonly string[]): void {
    this.#recordsScanned += 1;
    const bareVersion = fields[0] === 'COMBAT_LOG_VERSION';
    const event = bareVersion ? fields[0] : fields[1];
    if (!event) return;

    const parsedTimestamp = bareVersion ? null : parseCombatLogTimestamp(fields[0]);
    const timestamp = parsedTimestamp ?? undefined;
    if (
      timestamp !== undefined &&
      this.#lastTimestamp !== undefined &&
      timestamp < this.#lastTimestamp
    ) {
      this.#startBoundary(timestamp);
    }
    if (timestamp !== undefined) {
      this.#segmentStart ??= timestamp;
      this.#lastTimestamp = timestamp;
    }

    if (event === 'COMBAT_LOG_VERSION') {
      if (this.#recordsScanned > 1 || this.#combatLogVersionCount > 0) {
        this.#startBoundary(timestamp);
      }
      this.#combatLogVersionCount += 1;
      return;
    }
    if (event === 'ENCOUNTER_START') {
      this.#discardEncounterLeadIn(timestamp);
      this.#insideEncounter = true;
      this.#startBoundary(timestamp);
      return;
    }
    if (event === 'ENCOUNTER_END') {
      this.#insideEncounter = false;
      this.#startBoundary(timestamp);
      return;
    }
    if (HARD_BOUNDARY_EVENTS.has(event)) {
      this.#startBoundary(timestamp);
      return;
    }

    if (event === 'COMBATANT_INFO') {
      const guid = fields[2];
      if (guid && classifyTargetDummyActorGuid(guid) === 'player') {
        this.#observe({ guid, kind: 'player', flags: 0 }, 'source');
      }
      return;
    }

    const source = actorObservation(fields, 2);
    const target = actorObservation(fields, targetGuidIndex(fields));
    this.#observe(source, 'source');
    this.#observe(target, 'target');
    this.#observeAdvancedOwnership(fields, source, target);
    if (
      source?.kind === 'player' &&
      isNonPlayer(target) &&
      (event === 'SPELL_SUMMON' || event === 'SPELL_CREATE')
    ) {
      this.#claimOwnership(
        target.guid,
        source.guid,
        event === 'SPELL_CREATE' ? 'create' : 'summon',
      );
    }
    this.#refreshAffiliationOwnership();

    if (TARGET_END_EVENTS.has(event) && target) {
      this.#closeWindowsForTarget(target.guid, timestamp);
      return;
    }

    if (timestamp !== undefined && !this.#insideEncounter && isNonPlayer(target)) {
      const ownerGuid =
        source?.kind === 'player'
          ? { guid: source.guid, usesAffiliation: false }
          : this.#resolvePlayerOwner(source?.guid);
      if (ownerGuid) {
        const directPlayer = source?.guid === ownerGuid.guid;
        const explicit = directPlayer && isExplicitHostile(fields, event);
        const extension =
          PERIODIC_DAMAGE_EVENTS.has(event) || (!directPlayer && isExplicitHostile(fields, event));
        if (explicit || extension) {
          this.#observeSession(
            this.#sessionsWithAffiliation,
            timestamp,
            ownerGuid.guid,
            target.guid,
            explicit,
          );
          if (!ownerGuid.usesAffiliation) {
            this.#observeSession(
              this.#sessionsWithoutAffiliation,
              timestamp,
              ownerGuid.guid,
              target.guid,
              explicit,
            );
          }
        }
      }
    }

    if (source?.kind !== 'player' || !isNonPlayer(target)) return;
    const player = this.#players.get(source.guid);
    if (!player) return;

    const cast = CAST_EVENTS.has(event);
    const damage = DIRECT_DAMAGE_EVENTS.has(event);
    if (!cast && !damage) return;

    player.outgoingCastCount += Number(cast);
    player.outgoingDamageCount += Number(damage);
    player.directHostileActionCount += 1;
    player.targetGuids.add(target.guid);
  }

  finish(): TargetDummyActorDiscoveryResult {
    this.#closeAllWindows(this.#sessionsWithoutAffiliation);
    this.#closeAllWindows(this.#sessionsWithAffiliation);
    const actors = [...this.#actors.values()]
      .map(publicActor)
      .sort((left, right) => left.guid.localeCompare(right.guid));
    const players = [...this.#players.values()]
      .map(
        (player): TargetDummyPlayerCandidate => ({
          ...publicActor(player),
          kind: 'player',
          recorderCandidate: (player.flags & COMBATLOG_OBJECT_AFFILIATION_MINE) !== 0,
          outgoingCastCount: player.outgoingCastCount,
          outgoingDamageCount: player.outgoingDamageCount,
          directHostileActionCount: player.directHostileActionCount,
          targetInteractionCount: player.targetGuids.size,
          activityScore: player.outgoingDamageCount * 2 + player.outgoingCastCount,
        }),
      )
      .sort(
        (left, right) =>
          right.activityScore - left.activityScore || left.guid.localeCompare(right.guid),
      );
    const recorderCandidates = players.filter((player) => player.recorderCandidate);
    const sessions = this.#sessionCandidates(
      recorderCandidates.length === 1
        ? this.#sessionsWithAffiliation
        : this.#sessionsWithoutAffiliation,
    );
    const ownedEntities = [...this.#ownership.values()]
      .map(
        (claim): TargetDummyOwnedEntity => ({
          guid: claim.guid,
          ownerGuid: claim.ownerGuid,
          evidence: claim.evidence,
        }),
      )
      .sort((left, right) => left.guid.localeCompare(right.guid));

    return {
      actors,
      players,
      sessions,
      ownedEntities,
      ...(recorderCandidates.length === 1
        ? { proposedRecorderGuid: recorderCandidates[0].guid }
        : {}),
      recordsScanned: this.#recordsScanned,
      retainedState: {
        actorCount: actors.length,
        candidateWindowCount:
          this.#sessionsWithoutAffiliation.windows.length +
          this.#sessionsWithAffiliation.windows.length,
        ownedEntityCount: ownedEntities.length,
        retainedRawLineCount: 0,
        retainedNormalizedEventCount: 0,
      },
    };
  }

  #claimOwnership(guid: string, ownerGuid: string, evidence: TargetDummyOwnershipEvidence): void {
    if (guid === ownerGuid || classifyTargetDummyActorGuid(guid) === 'player') return;
    const candidate: OwnershipClaim = {
      guid,
      ownerGuid,
      evidence,
      strength: ownershipStrength(evidence),
    };
    const current = this.#ownership.get(guid);
    if (!current || candidate.strength > current.strength) this.#ownership.set(guid, candidate);
  }

  #observeAdvancedOwnership(
    fields: readonly string[],
    source: ActorObservation | undefined,
    target: ActorObservation | undefined,
  ): void {
    const possibleEntities = new Set([source?.guid, target?.guid]);
    for (let index = 10; index + 1 < fields.length; index += 1) {
      const guid = fields[index];
      const ownerGuid = fields[index + 1];
      if (
        possibleEntities.has(guid) &&
        classifyTargetDummyActorGuid(guid ?? '') !== 'player' &&
        classifyTargetDummyActorGuid(ownerGuid ?? '') === 'player'
      ) {
        this.#observe({ guid: ownerGuid, kind: 'player', flags: 0 }, 'source');
        this.#claimOwnership(guid, ownerGuid, 'advanced-owner-guid');
      }
    }
  }

  #refreshAffiliationOwnership(): void {
    const recorderGuids = [...this.#players.values()]
      .filter((player) => (player.flags & COMBATLOG_OBJECT_AFFILIATION_MINE) !== 0)
      .map((player) => player.guid);
    if (recorderGuids.length !== 1) {
      for (const [guid, claim] of this.#ownership) {
        if (claim.evidence === 'affiliation-mine') this.#ownership.delete(guid);
      }
      return;
    }
    for (const actor of this.#actors.values()) {
      if (actor.kind !== 'player' && (actor.flags & COMBATLOG_OBJECT_AFFILIATION_MINE) !== 0) {
        this.#claimOwnership(actor.guid, recorderGuids[0], 'affiliation-mine');
      }
    }
  }

  #resolvePlayerOwner(
    guid: string | undefined,
  ): { guid: string; usesAffiliation: boolean } | undefined {
    if (!guid) return undefined;
    const visited = new Set<string>();
    let current = guid;
    let usesAffiliation = false;
    while (!visited.has(current)) {
      visited.add(current);
      const claim = this.#ownership.get(current);
      if (!claim) return undefined;
      usesAffiliation ||= claim.evidence === 'affiliation-mine';
      if (classifyTargetDummyActorGuid(claim.ownerGuid) === 'player') {
        return { guid: claim.ownerGuid, usesAffiliation };
      }
      current = claim.ownerGuid;
    }
    return undefined;
  }

  #observeSession(
    state: SessionDiscoveryState,
    timestamp: number,
    playerGuid: string,
    targetGuid: string,
    explicit: boolean,
  ): void {
    let window = state.openWindows.get(playerGuid);
    if (
      window &&
      (window.boundaryGeneration !== this.#boundaryGeneration ||
        timestamp - window.lastQualifyingTime > this.#options.inactivityThresholdMs)
    ) {
      this.#closeWindow(state, playerGuid);
      window = undefined;
    }
    if (!window) {
      if (!explicit && !this.#options.includeIncidental) return;
      const segmentStart = Math.max(
        this.#segmentStart ?? timestamp,
        state.playerBoundaryStart.get(playerGuid) ?? -Infinity,
      );
      window = {
        playerGuid,
        activityStart: timestamp,
        fightStart: Math.max(segmentStart, timestamp - TARGET_DUMMY_PRE_ROLL_MS),
        end: timestamp,
        lastQualifyingTime: timestamp,
        targetGuids: new Set(),
        qualifyingActionCount: 0,
        playerInitiatedActionCount: 0,
        boundaryGeneration: this.#boundaryGeneration,
      };
      state.openWindows.set(playerGuid, window);
    }
    window.end = timestamp;
    window.lastQualifyingTime = timestamp;
    window.targetGuids.add(targetGuid);
    window.qualifyingActionCount += 1;
    window.playerInitiatedActionCount += Number(explicit);
  }

  #closeWindow(state: SessionDiscoveryState, playerGuid: string): void {
    const window = state.openWindows.get(playerGuid);
    if (!window) return;
    state.windows.push(window);
    state.openWindows.delete(playerGuid);
  }

  #closeAllWindows(state: SessionDiscoveryState): void {
    for (const playerGuid of [...state.openWindows.keys()]) this.#closeWindow(state, playerGuid);
  }

  #closeWindowsForTarget(targetGuid: string, timestamp: number | undefined): void {
    for (const state of [this.#sessionsWithoutAffiliation, this.#sessionsWithAffiliation]) {
      for (const [playerGuid, window] of state.openWindows) {
        if (window.targetGuids.has(targetGuid)) {
          this.#closeWindow(state, playerGuid);
          if (timestamp !== undefined) state.playerBoundaryStart.set(playerGuid, timestamp);
        }
      }
    }
  }

  #startBoundary(timestamp: number | undefined): void {
    for (const state of [this.#sessionsWithoutAffiliation, this.#sessionsWithAffiliation]) {
      this.#closeAllWindows(state);
      state.playerBoundaryStart.clear();
    }
    this.#boundaryGeneration += 1;
    this.#segmentStart = timestamp;
  }

  #discardEncounterLeadIn(timestamp: number | undefined): void {
    for (const state of [this.#sessionsWithoutAffiliation, this.#sessionsWithAffiliation]) {
      state.openWindows.clear();
      if (timestamp !== undefined) {
        state.windows.splice(
          0,
          state.windows.length,
          ...state.windows.filter(
            (window) =>
              window.boundaryGeneration !== this.#boundaryGeneration ||
              timestamp - window.end > this.#options.inactivityThresholdMs,
          ),
        );
      }
    }
  }

  #sessionCandidates(state: SessionDiscoveryState): TargetDummySessionCandidate[] {
    const indexes = new Map<string, number>();
    return state.windows
      .filter(
        (window) =>
          window.targetGuids.size > 0 &&
          (window.playerInitiatedActionCount > 0 || this.#options.includeIncidental),
      )
      .sort(
        (left, right) =>
          left.activityStart - right.activityStart ||
          left.playerGuid.localeCompare(right.playerGuid),
      )
      .map((window) => {
        const index = (indexes.get(window.playerGuid) ?? 0) + 1;
        indexes.set(window.playerGuid, index);
        const durationMs = window.end - window.activityStart;
        const reasons: TargetDummyConfidenceReason[] = [];
        if (window.playerInitiatedActionCount === 0) {
          reasons.push('passive-or-owned-activity-only');
        } else {
          reasons.push('player-intent-present');
          reasons.push(
            window.playerInitiatedActionCount >= this.#options.likelyMinimumPlayerInitiatedActions
              ? 'multiple-player-actions'
              : 'sparse-activity',
          );
          reasons.push(
            durationMs >= this.#options.likelyMinimumDurationMs
              ? 'minimum-duration-met'
              : 'short-duration',
          );
          if (window.qualifyingActionCount >= this.#options.likelyMinimumQualifyingActions) {
            reasons.push('sustained-activity');
          } else if (!reasons.includes('sparse-activity')) {
            reasons.push('sparse-activity');
          }
          reasons.push('non-player-target');
          if (window.targetGuids.size > 1) reasons.push('multi-target');
        }
        const likely =
          durationMs >= this.#options.likelyMinimumDurationMs &&
          window.playerInitiatedActionCount >= this.#options.likelyMinimumPlayerInitiatedActions &&
          window.qualifyingActionCount >= this.#options.likelyMinimumQualifyingActions;
        return {
          id: `${window.playerGuid}-session-${String(index)}`,
          playerGuid: window.playerGuid,
          targetGuids: [...window.targetGuids].sort(),
          activityStart: window.activityStart,
          fightStart: window.fightStart,
          end: window.end,
          durationMs,
          confidence:
            window.playerInitiatedActionCount === 0 ? 'incidental' : likely ? 'likely' : 'possible',
          reasons,
          qualifyingActionCount: window.qualifyingActionCount,
          playerInitiatedActionCount: window.playerInitiatedActionCount,
        } satisfies TargetDummySessionCandidate;
      });
  }

  #observe(actor: ActorObservation | undefined, role: 'source' | 'target'): void {
    if (!actor) return;
    const existing = this.#actors.get(actor.guid);
    if (existing) {
      existing.name ??= actor.name;
      existing.flags |= actor.flags;
      existing.sourceObservationCount += Number(role === 'source');
      existing.targetObservationCount += Number(role === 'target');
      return;
    }

    if (actor.kind === 'player') {
      const player: MutablePlayerAggregate = {
        ...actor,
        kind: 'player',
        sourceObservationCount: Number(role === 'source'),
        targetObservationCount: Number(role === 'target'),
        outgoingCastCount: 0,
        outgoingDamageCount: 0,
        directHostileActionCount: 0,
        targetGuids: new Set(),
      };
      this.#actors.set(actor.guid, player);
      this.#players.set(actor.guid, player);
      return;
    }
    this.#actors.set(actor.guid, {
      ...actor,
      sourceObservationCount: Number(role === 'source'),
      targetObservationCount: Number(role === 'target'),
    });
  }
}
