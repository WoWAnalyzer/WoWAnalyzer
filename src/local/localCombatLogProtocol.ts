import type { AnyEvent } from 'parser/core/Events';
import type Report from 'parser/core/Report';

import type { LocalActor, LocalDiagnostic } from './LocalCombatLogParser';
import type { LocalImportKind } from './localReportStore';
import type {
  TargetDummyActorDiscoveryResult,
  TargetDummySessionCandidate,
} from './target-dummy/contracts';
import type { BuiltCombatantInfo } from './target-dummy/combatant-info/builder';
import type { SimcProfileFailure } from './target-dummy/simc/contracts';

export interface TargetDummyPreparationInput {
  readonly playerGuid: string;
  readonly sessionId: string;
  readonly simcProfile: string;
  readonly factionChoice?: 1 | 2;
}

export interface TargetDummyInputRequest {
  readonly discovery: TargetDummyActorDiscoveryResult;
  readonly diagnostics: readonly LocalDiagnostic[];
  readonly validationError?: SimcProfileFailure;
}

export interface PreparedTargetDummyInput {
  readonly playerGuid: string;
  readonly session: TargetDummySessionCandidate;
  readonly combatantInfo: BuiltCombatantInfo;
}

export type LocalCombatLogWorkerInput =
  | { readonly type: 'start'; readonly file: File; readonly operationId: string }
  | { readonly type: 'ack'; readonly operationId: string; readonly batchId: number }
  | {
      readonly type: 'prepare-target-dummy';
      readonly operationId: string;
      readonly requestId: number;
      readonly input: TargetDummyPreparationInput;
    };

type OperationMessage = { readonly operationId: string };

export type LocalCombatLogWorkerOutput =
  | (OperationMessage & {
      readonly type: 'progress';
      readonly phase: 'discovering' | 'normalizing';
      readonly progress: number;
    })
  | (OperationMessage & {
      readonly type: 'discovered';
      readonly importKind: LocalImportKind;
      readonly report: Report;
      readonly actors: LocalActor[];
      readonly diagnostics: LocalDiagnostic[];
    })
  | (OperationMessage & {
      readonly type: 'target-dummy-input-required';
      readonly requestId: number;
      readonly request: TargetDummyInputRequest;
    })
  | (OperationMessage & {
      readonly type: 'target-dummy-input-error';
      readonly requestId: number;
      readonly request: TargetDummyInputRequest & { readonly validationError: SimcProfileFailure };
    })
  | (OperationMessage & {
      readonly type: 'target-dummy-prepared';
      readonly requestId: number;
      readonly prepared: PreparedTargetDummyInput;
    })
  | (OperationMessage & {
      readonly type: 'batch';
      readonly batchId: number;
      readonly fightId: number;
      readonly events: AnyEvent[];
    })
  | (OperationMessage & {
      readonly type: 'complete';
      readonly diagnostics: LocalDiagnostic[];
    })
  | (OperationMessage & {
      readonly type: 'error';
      readonly name?: string;
      readonly message: string;
      readonly diagnostics?: LocalDiagnostic[];
    });
