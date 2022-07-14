import './CooldownBar.scss';
import { SpellIcon } from 'interface';
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
  let lastAvailable = info.fightStart;
  const endCooldowns: UpdateSpellUsableEvent[] = events.filter(
    (event) =>
      IsUpdateSpellUsable(event) &&
      event.ability.guid === spellId &&
      event.trigger === EventType.EndCooldown,
  ) as UpdateSpellUsableEvent[];
  return (
    <div className="cooldown-bar" {...others}>
      {endCooldowns.length === 0 && highlightGaps && (
        <div
          className="cooldown-available-bad"
          key="available"
          style={{ left: '0%', width: '100%' }}
        />
      )}
      {endCooldowns.map((cd, ix) => {
        // EndCooldown updates happen even after fight end, so we clip it here
        const end = cd.end === undefined || cd.end > info.fightEnd ? info.fightEnd : cd.end;

        const openForFullCooldown = cd.start - lastAvailable >= abilityCdMs;
        const openLeft = `${((lastAvailable - info.fightStart) / info.fightDuration) * 100}%`;
        const openWidth = `${((cd.start - lastAvailable) / info.fightDuration) * 100}%`;

        const cdLeft = `${((cd.start - info.fightStart) / info.fightDuration) * 100}%`;
        const cdWidth = `${((end - cd.start) / info.fightDuration) * 100}%`;

        lastAvailable = end;
        return (
          <>
            <div
              className={
                highlightGaps && openForFullCooldown
                  ? 'cooldown-available-bad'
                  : 'cooldown-available'
              }
              key={ix + '-available'}
              style={{ left: openLeft, width: openWidth }}
            />
            <div
              className="cooldown-unavailable"
              key={ix + '-unavailable'}
              style={{ left: cdLeft, width: cdWidth }}
            >
              <SpellIcon noLink id={cd.ability.guid} />
            </div>
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
