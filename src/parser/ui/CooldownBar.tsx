import './CooldownBar.scss';
import { formatDuration } from 'common/format';
import { SpellIcon, Tooltip } from 'interface';
import { AnyEvent, EventType, UpdateSpellUsableEvent } from 'parser/core/Events';
import { Info } from 'parser/core/metric';

type Props = {
  /** The spellId to show cooldown bars for - this must match the ID of the spell's cast event */
  spellId: number;
  /** All events (should be available in functional react component's props) */
  events: AnyEvent[];
  /** The fight info (should be available in functional react component's props) */
  info: Info;
  /** Iff true, sections where the spell was available for the full duration of its
   * cooldown will be highlighted in red */
  highlightGaps?: boolean;
};

function CooldownBar({ spellId, events, info, highlightGaps, ...others }: Props): JSX.Element {
  const ability = info.abilities.find(
    (a) => a.spell === spellId || (Array.isArray(a.spell) && a.spell.includes(spellId)),
  );
  const abilityCdMs = (ability ? ability.cooldown : 0) * 1000;
  const abilityName = ability ? ability.name : 'Unknown Ability';
  let lastAvailable = info.fightStart;
  const endCooldowns: UpdateSpellUsableEvent[] = events.filter(
    (event) =>
      IsUpdateSpellUsable(event) &&
      event.ability.guid === spellId &&
      event.trigger === EventType.EndCooldown,
  ) as UpdateSpellUsableEvent[];
  return (
    <div className="cooldown-bar" {...others}>
      {endCooldowns.length === 0 && (
        <Tooltip key="available" content={`You never used ${abilityName}!`}>
          <div
            className={highlightGaps ? 'cooldown-available-bad' : 'cooldown-available'}
            style={{ left: '0%', width: '100%' }}
          />
        </Tooltip>
      )}
      {endCooldowns.map((cd, ix) => {
        // EndCooldown updates happen even after fight end, so we clip it here
        const end = cd.end === undefined || cd.end > info.fightEnd ? info.fightEnd : cd.end;
        const currLastAvailable = lastAvailable;

        const openForFullCooldown = cd.start - lastAvailable >= abilityCdMs;
        const openLeft = `${((lastAvailable - info.fightStart) / info.fightDuration) * 100}%`;
        const openWidth = `${((cd.start - lastAvailable) / info.fightDuration) * 100}%`;

        const cdLeft = `${((cd.start - info.fightStart) / info.fightDuration) * 100}%`;
        const cdWidth = `${((end - cd.start) / info.fightDuration) * 100}%`;

        lastAvailable = end;
        return (
          <>
            <Tooltip
              key={ix + '-available'}
              content={
                <>
                  {abilityName} was available from{' '}
                  <strong>{formatDuration(currLastAvailable - info.fightStart)}</strong> to{' '}
                  <strong>{formatDuration(cd.start - info.fightStart)}</strong>{' '}
                  {highlightGaps && openForFullCooldown
                    ? ' - could have fit a whole extra use here!'
                    : ''}
                </>
              }
            >
              <div
                className={
                  highlightGaps && openForFullCooldown
                    ? 'cooldown-available-bad'
                    : 'cooldown-available'
                }
                style={{ left: openLeft, width: openWidth }}
              />
            </Tooltip>
            <Tooltip
              key={ix + '-unavailable'}
              content={
                <>
                  {abilityName} was cast at{' '}
                  <strong>{formatDuration(cd.start - info.fightStart)}</strong> and was cooling down
                  until{' '}
                  {end === info.fightEnd ? (
                    ` the fight ended`
                  ) : (
                    <>
                      <strong>{formatDuration(end - info.fightStart)}</strong>
                    </>
                  )}
                </>
              }
            >
              <div className="cooldown-unavailable" style={{ left: cdLeft, width: cdWidth }}>
                <SpellIcon noLink id={cd.ability.guid} />
              </div>
            </Tooltip>
          </>
        );
      })}
    </div>
  );
}

function IsUpdateSpellUsable(event: AnyEvent): event is UpdateSpellUsableEvent {
  return event.type === EventType.UpdateSpellUsable;
}

export default CooldownBar;
