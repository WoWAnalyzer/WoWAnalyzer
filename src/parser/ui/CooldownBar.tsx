import './CooldownBar.scss';
import { formatDuration } from 'common/format';
import { SpellIcon, Tooltip } from 'interface';
import {
  AnyEvent,
  EventType,
  UpdateSpellUsableEvent,
  UpdateSpellUsableType,
} from 'parser/core/Events';
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
  /** Iff true, spell uses will be represented by a minimal white line instead of the spell icon.
   *  Useful for spells on CD shorter than 30s where the icons might be too closely packed to
   *  be usable */
  minimizeIcons?: boolean;
};

/**
 * Displays a bar with icons showing when a cooldown spell was used, and shading showing when the
 * spell was on cooldown vs when it was available.
 *
 * See docs for {@link Props} for explanation of parameters.
 */
export function CooldownBar({
  spellId,
  events,
  info,
  highlightGaps,
  minimizeIcons,
  ...others
}: Props): JSX.Element {
  const ability = info.abilities.find(
    (a) => a.spell === spellId || (Array.isArray(a.spell) && a.spell.includes(spellId)),
  );
  const abilityCdMs = (ability ? ability.cooldown : 0) * 1000;
  const abilityName = ability?.name || 'Unknown Ability';
  let lastAvailable = info.fightStart;
  const endCooldowns: UpdateSpellUsableEvent[] = events.filter(
    (event): event is UpdateSpellUsableEvent =>
      IsUpdateSpellUsable(event) &&
      event.ability.guid === spellId &&
      event.updateType === UpdateSpellUsableType.EndCooldown,
  );
  const useCharges: UpdateSpellUsableEvent[] = events.filter(
    (event): event is UpdateSpellUsableEvent =>
      IsUpdateSpellUsable(event) &&
      event.ability.guid === spellId &&
      event.updateType === UpdateSpellUsableType.UseCharge,
  );
  const hasCharges = useCharges.length > 0;
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
        const end = cd.timestamp > info.fightEnd ? info.fightEnd : cd.timestamp;
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
              endTimestamp={cd.overallStartTimestamp}
              info={info}
              highlightGaps={highlightGaps}
              minimizeIcons={minimizeIcons}
              hasCharges={hasCharges}
              type="available"
              key={ix + '-available'}
            />
            <CooldownBarSegment
              abilityId={spellId}
              abilityName={abilityName}
              abilityCdMs={abilityCdMs}
              startTimestamp={cd.overallStartTimestamp}
              endTimestamp={end}
              info={info}
              highlightGaps={highlightGaps}
              minimizeIcons={minimizeIcons}
              hasCharges={hasCharges}
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
          minimizeIcons={minimizeIcons}
          hasCharges={hasCharges}
          key="end-available"
        />
      )}
      {useCharges.map((cd, ix) => {
        const left = `${((cd.timestamp - info.fightStart) / info.fightDuration) * 100}%`;
        return (
          <div style={{ left }} key={ix + '-usecharge'}>
            {iconOrChip(spellId, minimizeIcons)}
          </div>
        );
      })}
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
  minimizeIcons,
  hasCharges,
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
  minimizeIcons?: boolean;
  hasCharges?: boolean;
}): JSX.Element {
  const left = `${((startTimestamp - info.fightStart) / info.fightDuration) * 100}%`;
  const width = `${((endTimestamp - startTimestamp) / info.fightDuration) * 100}%`;
  const openForFullCooldown =
    highlightGaps && endTimestamp - startTimestamp >= abilityCdMs && !hasCharges;
  const cappedCharges = highlightGaps && hasCharges;

  const startText = <strong>{timestampOrFightTerminus(startTimestamp, info)}</strong>;
  const endText = <strong>{timestampOrFightTerminus(endTimestamp, info)}</strong>;

  const className =
    type === 'onCooldown'
      ? 'cooldown-unavailable'
      : openForFullCooldown || cappedCharges
      ? 'cooldown-available-bad'
      : 'cooldown-available';
  const tooltipContent =
    type === 'onCooldown' ? (
      hasCharges ? (
        <>
          {abilityName} cooling down from {startText} until {endText}
        </>
      ) : (
        <>
          {abilityName} cast {startText} cooldown until {endText}
        </>
      )
    ) : hasCharges ? (
      <>
        {abilityName} capped on charges {startText} to {endText}
      </>
    ) : (
      <>
        {abilityName} available {startText} to {endText}{' '}
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
        {type === 'onCooldown' && iconOrChip(abilityId, minimizeIcons)}
      </div>
    </Tooltip>
  );
}

function iconOrChip(spellId: number, minimizeIcons?: boolean): JSX.Element {
  return minimizeIcons ? (
    <div className="cast-chip" style={{ width: 3, height: '100%' }} />
  ) : (
    <SpellIcon noLink id={spellId} />
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
