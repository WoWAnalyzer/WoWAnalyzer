import type { LocalActor } from '../LocalCombatLogParser';
import type {
  PreparedTargetDummyInput,
  TargetDummyPreparationInput,
} from '../localCombatLogProtocol';
import { buildCombatantInfoEvent } from './combatant-info/builder';
import { INSTALLED_TALENT_SNAPSHOTS } from './combatant-info/data/installed';
import { decodeTalentExport } from './combatant-info/talents';
import type { TargetDummyBuildBinding } from './combatant-info/validator';
import type { TargetDummyActorDiscoveryResult } from './contracts';
import { parseSimcAddonProfile } from './simc/parser';
import type { SimcProfileFailure, SimcResult } from './simc/contracts';

function malformedSelection(message: string): SimcResult<never> {
  return {
    ok: false,
    error: {
      code: 'SIMC_PROFILE_MALFORMED',
      message,
      recoverable: true,
      suggestedAction: 'Choose a player and attempt from the current discovery results.',
    },
  };
}

export function prepareTargetDummyInput(
  discovery: TargetDummyActorDiscoveryResult,
  localActors: readonly LocalActor[],
  build: TargetDummyBuildBinding,
  input: TargetDummyPreparationInput,
): SimcResult<PreparedTargetDummyInput> {
  const player = discovery.players.find((candidate) => candidate.guid === input.playerGuid);
  const session = discovery.sessions.find((candidate) => candidate.id === input.sessionId);
  const localActor = localActors.find((actor) => actor.guid === input.playerGuid);
  if (!player || !session || session.playerGuid !== player.guid || !localActor) {
    return malformedSelection(
      'The selected target-dummy player or attempt is no longer available.',
    );
  }

  const profile = parseSimcAddonProfile(input.simcProfile);
  if (!profile.ok) {
    return profile;
  }
  const talents = decodeTalentExport(profile.value.talentExport, INSTALLED_TALENT_SNAPSHOTS, {
    wowVersion: profile.value.provenance.wowVersion,
  });
  if (!talents.ok) {
    return talents;
  }
  const combatantInfo = buildCombatantInfoEvent({
    profile: profile.value,
    talents: talents.value,
    player: { name: player.name ?? localActor.name, sourceId: localActor.id },
    build,
    timestamp: session.fightStart,
    factionChoice: input.factionChoice,
  });
  if (!combatantInfo.ok) {
    return combatantInfo;
  }
  return {
    ok: true,
    value: {
      playerGuid: player.guid,
      session,
      combatantInfo: combatantInfo.value,
    },
  };
}

export function targetDummyPreparationError(error: unknown): SimcProfileFailure {
  return {
    code: 'SIMC_PROFILE_MALFORMED',
    message: error instanceof Error ? error.message : 'Unable to prepare the target-dummy input.',
    recoverable: true,
    suggestedAction: 'Review the selected attempt and paste the complete matching /simc output.',
  };
}
