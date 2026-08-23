import { FormEvent, useMemo, useState } from 'react';
import { formatDuration } from 'common/format';
import type {
  TargetDummyInputRequest,
  TargetDummyPreparationInput,
} from 'local/localCombatLogProtocol';
import styles from './TargetDummyImportInput.module.scss';

interface Props {
  request: TargetDummyInputRequest;
  disabled: boolean;
  onSubmit: (input: TargetDummyPreparationInput) => void;
  onStartOver?: () => void;
}

const actorName = (request: TargetDummyInputRequest, guid: string) =>
  request.discovery.actors.find((actor) => actor.guid === guid)?.name ?? guid;

const initialPlayerGuid = (request: TargetDummyInputRequest) =>
  request.discovery.proposedRecorderGuid ??
  (request.discovery.players.length === 1 ? request.discovery.players[0].guid : '');

const formatAttemptTime = (timestamp: number) =>
  new Date(timestamp).toLocaleTimeString(undefined, {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });

export default function TargetDummyImportInput({
  request,
  disabled,
  onSubmit,
  onStartOver,
}: Props) {
  const [playerGuid, setPlayerGuid] = useState(() => initialPlayerGuid(request));
  const [sessionId, setSessionId] = useState('');
  const [simcProfile, setSimcProfile] = useState('');
  const [factionChoice, setFactionChoice] = useState<1 | 2 | undefined>();
  const sessions = useMemo(
    () => request.discovery.sessions.filter((session) => session.playerGuid === playerGuid),
    [playerGuid, request.discovery.sessions],
  );
  const selectedPlayer = request.discovery.players.find((player) => player.guid === playerGuid);
  const needsCharacterChoice =
    request.discovery.players.length > 1 && !request.discovery.proposedRecorderGuid;
  const needsFaction = request.validationError?.code === 'SIMC_FACTION_CHOICE_REQUIRED';

  const changePlayer = (guid: string) => {
    setPlayerGuid(guid);
    setSessionId('');
  };

  const submit = (event: FormEvent) => {
    event.preventDefault();
    if (!playerGuid || !sessionId || !simcProfile.trim() || (needsFaction && !factionChoice))
      return;
    onSubmit({ playerGuid, sessionId, simcProfile, factionChoice });
  };

  return (
    <form onSubmit={submit} className={styles.Form} aria-label="Prepare target-dummy import">
      <div className={styles.Intro} role="status">
        <strong>Target-dummy activity found</strong>
        <span>
          Choose the character and attempt, then add that character's current SimulationCraft
          profile.
        </span>
      </div>

      <div className={styles.Field}>
        <label className={styles.FieldLabel} htmlFor="target-dummy-player">
          Character
        </label>
        {needsCharacterChoice ? (
          <select
            id="target-dummy-player"
            className="form-control"
            value={playerGuid}
            onChange={(event) => changePlayer(event.target.value)}
            disabled={disabled}
            required
          >
            <option value="">Choose a character</option>
            {request.discovery.players.map((player) => (
              <option key={player.guid} value={player.guid}>
                {player.name ?? player.guid}
              </option>
            ))}
          </select>
        ) : (
          <div id="target-dummy-player" className={styles.ReadonlyValue}>
            {selectedPlayer?.name ?? selectedPlayer?.guid}
          </div>
        )}
      </div>

      <fieldset disabled={disabled || !playerGuid} className={styles.Attempts}>
        <legend className={styles.FieldLabel}>Attempt</legend>
        <div className={styles.AttemptList}>
          {sessions.map((session) => {
            const targets = session.targetGuids.map((guid) => actorName(request, guid));
            const targetLabel =
              targets.length === 1 ? targets[0] : `${targets[0]} and ${targets.length - 1} more`;
            return (
              <label
                key={session.id}
                className={`${styles.Attempt} ${sessionId === session.id ? styles.SelectedAttempt : ''}`}
              >
                <input
                  type="radio"
                  name="target-dummy-session"
                  value={session.id}
                  checked={sessionId === session.id}
                  onChange={(event) => setSessionId(event.target.value)}
                  required
                />
                <span className={styles.AttemptDetails}>
                  <strong>{selectedPlayer?.name ?? selectedPlayer?.guid}</strong>
                  <span>
                    {formatAttemptTime(session.activityStart)} ·{' '}
                    {formatDuration(session.durationMs)}
                  </span>
                  <span>{targetLabel}</span>
                </span>
                <span className={styles.Confidence}>{session.confidence}</span>
              </label>
            );
          })}
        </div>
      </fieldset>

      <div className={styles.Field}>
        <label className={styles.FieldLabel} htmlFor="target-dummy-simc">
          SimulationCraft addon export
        </label>
        <span className={styles.FieldHelp}>
          In World of Warcraft, run <code>/simc</code> on the selected character and paste the full
          output.
        </span>
        <textarea
          id="target-dummy-simc"
          className={`${styles.ProfileInput} form-control`}
          rows={8}
          value={simcProfile}
          onChange={(event) => setSimcProfile(event.target.value)}
          placeholder="Paste the complete /simc output here…"
          disabled={disabled}
          required
        />
      </div>

      {request.validationError && (
        <div className="alert alert-danger" role="alert">
          <strong>{request.validationError.message}</strong>{' '}
          {request.validationError.suggestedAction}
        </div>
      )}

      {needsFaction && (
        <div className={styles.Field}>
          <label className={styles.FieldLabel} htmlFor="target-dummy-faction">
            Faction
          </label>
          <select
            id="target-dummy-faction"
            className="form-control"
            value={factionChoice ?? ''}
            onChange={(event) => setFactionChoice(Number(event.target.value) as 1 | 2)}
            disabled={disabled}
            required
          >
            <option value="">Choose a faction</option>
            <option value="1">Alliance</option>
            <option value="2">Horde</option>
          </select>
        </div>
      )}

      <p className={styles.FinePrint}>
        Identity, specialization, talents, and equipment come from this profile. Live ratings and
        pull-time auras are unavailable and will use explicit defaults.
      </p>
      <details className={styles.TechnicalDetails}>
        <summary>Technical discovery details</summary>
        <p>
          <small>
            Scanned {request.discovery.recordsScanned} records and retained{' '}
            {request.discovery.retainedState.actorCount} actors and{' '}
            {request.discovery.retainedState.candidateWindowCount} attempt windows without retaining
            raw lines or normalized events.
          </small>
        </p>
        <ul>
          {request.discovery.players.map((player) => (
            <li key={player.guid}>
              {player.name ?? 'Unnamed player'} — {player.guid}; activity score{' '}
              {player.activityScore}
            </li>
          ))}
          {request.diagnostics.map((diagnostic, index) => (
            <li key={`${diagnostic.line}:${index}`}>{diagnostic.message}</li>
          ))}
        </ul>
      </details>
      <div className={styles.Actions}>
        <button className="btn btn-primary" type="submit" disabled={disabled}>
          {disabled ? 'Validating…' : 'Import selected attempt'}
        </button>
        {onStartOver && (
          <button className="btn btn-link" type="button" disabled={disabled} onClick={onStartOver}>
            Start over
          </button>
        )}
      </div>
    </form>
  );
}
