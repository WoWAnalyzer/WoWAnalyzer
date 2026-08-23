import type { LocalActor, LocalCombatLogDiscovery, LocalDiagnostic } from '../LocalCombatLogParser';
import type { TargetDummyBuildBinding } from './combatant-info/validator';

export type TargetDummyActorKind =
  | 'player'
  | 'creature'
  | 'pet'
  | 'guardian'
  | 'vehicle'
  | 'game-object';

export interface TargetDummyActorAggregate {
  readonly guid: string;
  readonly kind: TargetDummyActorKind;
  readonly name?: string;
  /** Bitwise union of the actor flags observed for this GUID. */
  readonly flags: number;
  readonly sourceObservationCount: number;
  readonly targetObservationCount: number;
}

export interface TargetDummyPlayerCandidate extends TargetDummyActorAggregate {
  readonly kind: 'player';
  readonly recorderCandidate: boolean;
  readonly outgoingCastCount: number;
  readonly outgoingDamageCount: number;
  readonly directHostileActionCount: number;
  readonly targetInteractionCount: number;
  /** Ranking score derived only from direct hostile casts and damage. */
  readonly activityScore: number;
}

export interface TargetDummyDiscoveryRetentionSummary {
  readonly actorCount: number;
  readonly candidateWindowCount: number;
  readonly ownedEntityCount: number;
  readonly retainedRawLineCount: 0;
  readonly retainedNormalizedEventCount: 0;
}

export type TargetDummyOwnershipEvidence =
  | 'advanced-owner-guid'
  | 'summon'
  | 'create'
  | 'affiliation-mine';

export interface TargetDummyOwnedEntity {
  readonly guid: string;
  readonly ownerGuid: string;
  readonly evidence: TargetDummyOwnershipEvidence;
}

export type TargetDummySessionConfidence = 'likely' | 'possible' | 'incidental';

export type TargetDummyConfidenceReason =
  | 'player-intent-present'
  | 'multiple-player-actions'
  | 'minimum-duration-met'
  | 'sustained-activity'
  | 'short-duration'
  | 'sparse-activity'
  | 'passive-or-owned-activity-only'
  | 'non-player-target'
  | 'multi-target';

export interface TargetDummySessionCandidate {
  readonly id: string;
  readonly playerGuid: string;
  readonly targetGuids: readonly string[];
  /** Timestamp of the first qualifying action, without pre-roll. */
  readonly activityStart: number;
  /** Five-second pre-roll clamped to the current segment/hard boundary. */
  readonly fightStart: number;
  readonly end: number;
  readonly durationMs: number;
  readonly confidence: TargetDummySessionConfidence;
  readonly reasons: readonly TargetDummyConfidenceReason[];
  readonly qualifyingActionCount: number;
  readonly playerInitiatedActionCount: number;
}

export interface TargetDummySessionDiscoveryOptions {
  readonly inactivityThresholdMs?: number;
  readonly likelyMinimumDurationMs?: number;
  readonly likelyMinimumPlayerInitiatedActions?: number;
  readonly likelyMinimumQualifyingActions?: number;
  readonly includeIncidental?: boolean;
}

export interface TargetDummyActorDiscoveryResult {
  readonly actors: readonly TargetDummyActorAggregate[];
  readonly players: readonly TargetDummyPlayerCandidate[];
  readonly sessions: readonly TargetDummySessionCandidate[];
  readonly ownedEntities: readonly TargetDummyOwnedEntity[];
  /** Present only when exactly one player GUID carries AFFILIATION_MINE. */
  readonly proposedRecorderGuid?: string;
  readonly recordsScanned: number;
  readonly retainedState: TargetDummyDiscoveryRetentionSummary;
}

export interface UnsupportedTargetDummyInput {
  readonly code: 'no-usable-encounter-or-target-dummy-session';
  readonly message: string;
  readonly diagnostics: readonly LocalDiagnostic[];
}

export type TargetDummyDiscoveryRoute =
  | {
      readonly type: 'encounter';
      readonly discovery: LocalCombatLogDiscovery;
    }
  | {
      readonly type: 'target-dummy-input-required';
      readonly discovery: TargetDummyActorDiscoveryResult;
      readonly diagnostics: readonly LocalDiagnostic[];
      /** Worker-only state retained across the preparation pause. */
      readonly localActors: readonly LocalActor[];
      readonly build: TargetDummyBuildBinding;
    }
  | {
      readonly type: 'unsupported-input';
      readonly error: UnsupportedTargetDummyInput;
    };
