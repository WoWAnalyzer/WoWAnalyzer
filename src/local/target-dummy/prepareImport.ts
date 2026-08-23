import { getSpecMetadata } from 'game/getSpecMetadata';
import type { AnyEvent, CombatantInfoEvent } from 'parser/core/Events';
import type { WCLFight } from 'parser/core/Fight';
import type Report from 'parser/core/Report';

import {
  decodeCombatLogLine,
  type LocalActor,
  LocalCombatLogDiscovery,
  type LocalDiagnostic,
  normalizeCombatLogRecord,
  parseCombatLogTimestamp,
  readCombatLogLines,
} from '../LocalCombatLogParser';
import type { PreparedTargetDummyInput } from '../localCombatLogProtocol';
import type { TargetDummyActorDiscoveryResult } from './contracts';

const TARGET_DUMMY_BOSS_ID = -1;
const TARGET_DUMMY_FIGHT_ID = 1;
const NORMALIZATION_BATCH_BYTES = 512 * 1024;

export interface PreparedTargetDummyImport {
  readonly fight: WCLFight;
  readonly selectedPlayerGuid: string;
  readonly targetGuids: readonly string[];
  readonly combatantInfo: CombatantInfoEvent;
  readonly sourceWindow: {
    readonly activityStart: number;
    readonly fightStart: number;
    readonly end: number;
  };
  readonly diagnostics: LocalDiagnostic[];
}

export interface TargetDummyImportPlan extends PreparedTargetDummyImport {
  readonly report: Report;
  readonly actors: LocalActor[];
  readonly normalization: LocalCombatLogDiscovery;
}

const cloneActor = (actor: LocalActor): LocalActor => ({
  ...actor,
  fightIds: [],
  fightDetails: {},
});

export function prepareTargetDummyImport(
  reportId: string,
  discovery: TargetDummyActorDiscoveryResult,
  localActors: readonly LocalActor[],
  prepared: PreparedTargetDummyInput,
): TargetDummyImportPlan {
  const fight: WCLFight = {
    id: TARGET_DUMMY_FIGHT_ID,
    start_time: prepared.session.fightStart,
    end_time: prepared.session.end,
    boss: TARGET_DUMMY_BOSS_ID,
    name:
      prepared.session.targetGuids.length === 1
        ? 'Training Dummy'
        : `Training Dummies (${prepared.session.targetGuids.length} targets)`,
    kill: false,
  };
  const normalization = new LocalCombatLogDiscovery();
  const actors = localActors.map(cloneActor);
  for (const actor of actors) normalization.actors.set(actor.guid, actor);

  const selectedPlayer = normalization.actors.get(prepared.playerGuid);
  if (!selectedPlayer) {
    throw new Error('The selected target-dummy player is unavailable during normalization.');
  }
  const metadata = getSpecMetadata(prepared.combatantInfo.event.specID);
  selectedPlayer.className = metadata?.className ?? selectedPlayer.className;
  selectedPlayer.fightIds.push(fight.id);
  selectedPlayer.fightDetails[fight.id] = {
    specID: prepared.combatantInfo.event.specID,
    role: metadata?.role,
    className: metadata?.className,
    combatant: prepared.combatantInfo.event,
  };

  const attachedGuids = new Set([prepared.playerGuid, ...prepared.session.targetGuids]);
  for (const owned of discovery.ownedEntities) {
    if (owned.ownerGuid !== prepared.playerGuid) continue;
    attachedGuids.add(owned.guid);
    const actor = normalization.actors.get(owned.guid);
    if (actor) {
      actor.pet = true;
      actor.ownerId = selectedPlayer.id;
      actor.friendly = true;
    }
  }
  for (const guid of attachedGuids) {
    const actor = normalization.actors.get(guid);
    if (actor && !actor.fightIds.includes(fight.id)) actor.fightIds.push(fight.id);
  }

  normalization.fights.push(fight);
  normalization.start = fight.start_time;
  normalization.end = fight.end_time;
  const diagnostics = [...prepared.combatantInfo.diagnostics];

  return {
    fight,
    selectedPlayerGuid: prepared.playerGuid,
    targetGuids: [...prepared.session.targetGuids],
    combatantInfo: prepared.combatantInfo.event,
    sourceWindow: {
      activityStart: prepared.session.activityStart,
      fightStart: prepared.session.fightStart,
      end: prepared.session.end,
    },
    diagnostics,
    report: normalization.report(reportId),
    actors,
    normalization,
  };
}

export async function normalizePreparedTargetDummyImport(
  file: File,
  plan: TargetDummyImportPlan,
  onBatch: (fightId: number, events: AnyEvent[]) => Promise<void> | void,
  signal?: AbortSignal,
  progress?: (value: number) => void,
): Promise<void> {
  let batch: AnyEvent[] = [plan.combatantInfo];
  let batchBytes = 0;
  const flush = async () => {
    if (batch.length > 0) await onBatch(plan.fight.id, batch);
    batch = [];
  };

  for await (const record of readCombatLogLines(file, signal)) {
    const fields = decodeCombatLogLine(record.line);
    const timestamp = parseCombatLogTimestamp(fields[0]);
    if (
      timestamp !== null &&
      timestamp >= plan.sourceWindow.fightStart &&
      timestamp <= plan.sourceWindow.end
    ) {
      const isSelectedCombatantInfo =
        fields[1] === 'COMBATANT_INFO' && fields[2] === plan.selectedPlayerGuid;
      if (!isSelectedCombatantInfo) {
        const event = normalizeCombatLogRecord(fields, plan.normalization);
        if (event) batch.push(event);
      }
    }
    batchBytes += new TextEncoder().encode(record.line).byteLength + 1;
    if (batchBytes >= NORMALIZATION_BATCH_BYTES) {
      await flush();
      batchBytes = 0;
    }
    progress?.(file.size ? Math.min(1, record.bytesRead / file.size) : 1);
  }
  await flush();
  progress?.(1);
}
