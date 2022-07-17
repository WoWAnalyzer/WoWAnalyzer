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

/**
 *
 * @param spellId
 * @param events
 * @param info
 * @param highlightGaps
 * @param others
 * @constructor
 */
export function CooldownBar({
  spellId,
  events,
  info,
  highlightGaps,
  ...others
}: Props): JSX.Element {
  const ability = info.abilities.find(
    (a) => a.spell === spellId || (Array.isArray(a.spell) && a.spell.includes(spellId)),
  );
  const abilityCdMs = (ability ? ability.cooldown : 0) * 1000;
  const abilityName = ability ? ability.name : 'Unknown Ability';
  let lastAvailable = info.fightStart;
  const endCooldowns: UpdateSpellUsableEvent[] = events.filter(
    (event): event is UpdateSpellUsableEvent =>
      IsUpdateSpellUsable(event) &&
      event.ability.guid === spellId &&
      event.trigger === EventType.EndCooldown,
  );
  return (
    <div className="cooldown-bar" {...others}>
      {endCooldowns.length === 0 && (
        <Tooltip
          key="available"
          content={
            <>
              <strong>You never used {abilityName}!</strong>
            </>
          }
        >
          <div
            className={highlightGaps ? 'cooldown-available-bad' : 'cooldown-available'}
            style={{ left: '0%', width: '100%' }}
          />
        </Tooltip>
      )}
      {endCooldowns.map((cd, ix) => {
        // end cooldown events can be placed after fight end, so we need to clip the bars
        const end = cd.end === undefined || cd.end > info.fightEnd ? info.fightEnd : cd.end;
        const currLastAvailable = lastAvailable;
        lastAvailable = end;
        // render the last period of availablility and also this cooldown
        return (
          <>
            <CooldownBarSegment
              abilityId={spellId}
              abilityName={abilityName}
              abilityCdMs={abilityCdMs}
              startTimestamp={currLastAvailable}
              endTimestamp={cd.start}
              info={info}
              highlightGaps={highlightGaps}
              type="available"
              key={ix + '-available'}
            />
            <CooldownBarSegment
              abilityId={spellId}
              abilityName={abilityName}
              abilityCdMs={abilityCdMs}
              startTimestamp={cd.start}
              endTimestamp={end}
              info={info}
              highlightGaps={highlightGaps}
              type="onCooldown"
              key={ix + '-cooldown'}
            />
          </>
        );
      })}
      {endCooldowns.length !== 0 && lastAvailable !== info.fightEnd && (
        <CooldownBarSegment
          abilityId={spellId}
          abilityName={abilityName}
          abilityCdMs={abilityCdMs}
          startTimestamp={lastAvailable}
          endTimestamp={info.fightEnd}
          type="available"
          info={info}
          highlightGaps={highlightGaps}
          key="end-available"
        />
      )}
    </div>
  );
}

function CooldownBarSegment({
  abilityId,
  abilityName,
  abilityCdMs,
  startTimestamp,
  endTimestamp,
  type,
  info,
  highlightGaps,
  ...others
}: {
  abilityId: number;
  abilityName: string;
  abilityCdMs: number;
  startTimestamp: number;
  endTimestamp: number;
  type: 'onCooldown' | 'available';
  info: Info;
  highlightGaps?: boolean;
}): JSX.Element {
  const left = `${((startTimestamp - info.fightStart) / info.fightDuration) * 100}%`;
  const width = `${((endTimestamp - startTimestamp) / info.fightDuration) * 100}%`;
  const openForFullCooldown = highlightGaps && endTimestamp - startTimestamp >= abilityCdMs;

  const className =
    type === 'onCooldown'
      ? 'cooldown-unavailable'
      : openForFullCooldown
      ? 'cooldown-available-bad'
      : 'cooldown-available';
  const tooltipContent =
    type === 'onCooldown' ? (
      <>
        {abilityName} cast <strong>{timestampOrFightTerminus(startTimestamp, info)}</strong>{' '}
        cooldown until <strong>{timestampOrFightTerminus(endTimestamp, info)}</strong>
      </>
    ) : (
      <>
        {abilityName} available <strong>{timestampOrFightTerminus(startTimestamp, info)}</strong> to{' '}
        <strong>{timestampOrFightTerminus(endTimestamp, info)}</strong>{' '}
        {openForFullCooldown ? (
          <>
            <i> - could have fit a whole extra use here!</i>
          </>
        ) : (
          ''
        )}
      </>
    );

  return (
    <Tooltip content={tooltipContent}>
      <div className={className} style={{ left, width }}>
        {type === 'onCooldown' && <SpellIcon noLink id={abilityId} />}
      </div>
    </Tooltip>
  );
}

function timestampOrFightTerminus(timestamp: number, info: Info): string {
  if (timestamp === info.fightStart) {
    return 'fight start';
  } else if (timestamp === info.fightEnd) {
    return 'fight end';
  } else {
    return formatDuration(timestamp - info.fightStart);
  }
}

function IsUpdateSpellUsable(event: AnyEvent): event is UpdateSpellUsableEvent {
  return event.type === EventType.UpdateSpellUsable;
}
