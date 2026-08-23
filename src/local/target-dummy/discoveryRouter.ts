import {
  decodeCombatLogLine,
  LocalCombatLogDiscovery,
  readCombatLogLines,
} from '../LocalCombatLogParser';
import type { TargetDummyDiscoveryRoute } from './contracts';
import { TargetDummyActorDiscovery } from './discovery';

interface ActiveEncounterEnvelope {
  readonly encounterId: string;
  hasCombatantInfo: boolean;
}

/**
 * Feeds encounter and target-dummy discovery from the same decoded-record
 * stream, then applies genuine-encounter precedence at end of file.
 */
export class TargetDummyDiscoveryRouter {
  readonly #encounterDiscovery = new LocalCombatLogDiscovery();
  readonly #targetDummyDiscovery = new TargetDummyActorDiscovery();
  #activeEncounter: ActiveEncounterEnvelope | undefined;
  #hasUsableEncounter = false;
  #lastLine = 0;
  #wowVersion: string | undefined;

  consume(fields: string[], line: number): void {
    this.#lastLine = line;
    if ((fields[0] === 'COMBAT_LOG_VERSION' ? fields[0] : fields[1]) === 'COMBAT_LOG_VERSION') {
      this.#wowVersion = fields.find((value) => /^\d+\.\d+\.\d+$/u.test(value));
    }
    this.#targetDummyDiscovery.consume(fields);
    this.#observeEncounterEnvelope(fields);
    this.#encounterDiscovery.line(fields, line);
  }

  finish(): TargetDummyDiscoveryRoute {
    this.#encounterDiscovery.validateVersion();
    const targetDummyDiscovery = this.#targetDummyDiscovery.finish();

    if (this.#hasUsableEncounter) {
      this.#encounterDiscovery.finish(this.#lastLine || 1);
      return { type: 'encounter', discovery: this.#encounterDiscovery };
    }
    if (targetDummyDiscovery.sessions.length > 0) {
      return {
        type: 'target-dummy-input-required',
        discovery: targetDummyDiscovery,
        diagnostics: this.#encounterDiscovery.diagnostics,
        localActors: [...this.#encounterDiscovery.actors.values()],
        build: {
          gameVersion: 1,
          logVersion: 22,
          ...(this.#wowVersion === undefined ? {} : { wowVersion: this.#wowVersion }),
        },
      };
    }
    return {
      type: 'unsupported-input',
      error: {
        code: 'no-usable-encounter-or-target-dummy-session',
        message:
          'No complete encounter with combatant information or qualifying target-dummy attempt was found. Use an unmodified Retail advanced combat log and keep target-dummy activity in a standalone file.',
        diagnostics: this.#encounterDiscovery.diagnostics,
      },
    };
  }

  #observeEncounterEnvelope(fields: readonly string[]): void {
    const event = fields[0] === 'COMBAT_LOG_VERSION' ? fields[0] : fields[1];
    if (event === 'ENCOUNTER_START') {
      this.#activeEncounter = {
        encounterId: fields[2] ?? '',
        hasCombatantInfo: false,
      };
      return;
    }
    if (event === 'COMBATANT_INFO' && this.#activeEncounter) {
      this.#activeEncounter.hasCombatantInfo = true;
      return;
    }
    if (event === 'ENCOUNTER_END') {
      if (
        this.#activeEncounter?.hasCombatantInfo &&
        this.#activeEncounter.encounterId === (fields[2] ?? '')
      ) {
        this.#hasUsableEncounter = true;
      }
      this.#activeEncounter = undefined;
    }
  }
}

export async function routeLocalCombatLogDiscovery(
  file: File,
  signal?: AbortSignal,
  progress?: (value: number) => void,
): Promise<TargetDummyDiscoveryRoute> {
  const router = new TargetDummyDiscoveryRouter();
  for await (const record of readCombatLogLines(file, signal)) {
    router.consume(decodeCombatLogLine(record.line), record.lineNumber);
    progress?.(file.size ? Math.min(1, record.bytesRead / file.size) : 1);
  }
  const result = router.finish();
  progress?.(1);
  return result;
}
