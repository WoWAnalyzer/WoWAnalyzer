import './CooldownBar.scss';
import { formatDuration } from 'common/format';
import { SpellIcon, Tooltip } from 'interface';
import {
  AnyEvent,
  EventType,
  UpdateSpellUsableEvent,
  UpdateSpellUsableType,
} from 'parser/core/Events';
import { useInfo, useEvents } from 'interface/guide';
import { Fragment } from 'react';
import { ExecuteRange } from 'parser/shared/modules/helpers/ExecuteHelper';

/** If and where times the spell was available should be highlighted in red
 *  TODO add timed option?
 */
export enum GapHighlight {
  /** Never highlight times the spell was off cooldown in red -
   *  Good for utility spells with no specific cast efficiency requirements */
  None,
  /** Highlight in red segments where spell was off cooldown for its full CD duration,
   *  e.g. player could have fit a full use of the spell without changing their existing casts.
   *  Good for planned CDs like healing / tanking CDs */
  FullCooldown,
  /** All times where the spell was off cooldown are highlighted in red.
   *  Good spells with charges, or strict throughput cooldowns that should be used immediately */
  All,
}

export type CooldownWindow = {
  startTime: number;
  endTime: number;
};

export function fromExecuteRange(range: ExecuteRange): CooldownWindow {
  return {
    startTime: range.startEvent.timestamp,
    endTime: range.endEvent.timestamp,
  };
}

type Props = {
  /** The spellId to show cooldown bars for - this must match the ID of the spell's cast event */
  spellId: number;
  /** Gap highlight mode - see {@link GapHighlight} */
  gapHighlightMode: GapHighlight;
  /** If true, spell uses will be represented by a minimal white line instead of the spell icon.
   *  Useful for spells on CD shorter than 30s where the icons might be too closely packed to
   *  be usable */
  minimizeIcons?: boolean;
  slimLines?: boolean;
  /**
   * Windows where the spell is actually usable. Useful for execute spells or spells that only become active inside of a cooldown.
   *
   * If not specified, defaults to the whole fight.
   */
  activeWindows?: Array<CooldownWindow>;
};

const CooldownBarWindow = ({
  startTime,
  endTime,
  gapHighlightMode,
  minimizeIcons,
  spellId,
  slimLines,
  ...others
}: Omit<Props, 'activeWindows'> & CooldownWindow) => {
  const { abilities, fightStart, fightEnd, fightDuration } = useInfo()!;
  const events = useEvents()!;
  const ability = abilities.find(
    (a) => a.spell === spellId || (Array.isArray(a.spell) && a.spell.includes(spellId)),
  );
  const abilityCdMs = (ability ? ability.cooldown : 0) * 1000;
  const abilityName = ability?.name || 'Unknown Ability';
  const hasCharges = ability && ability.charges > 1;

  const endCooldowns: UpdateSpellUsableEvent[] = events
    .filter((event) => event.timestamp >= startTime)
    .filter(
      (event): event is UpdateSpellUsableEvent =>
        IsUpdateSpellUsable(event) &&
        event.ability.guid === spellId &&
        event.updateType === UpdateSpellUsableType.EndCooldown,
    );
  const useCharges: UpdateSpellUsableEvent[] = events
    .filter((event) => event.timestamp >= startTime && event.timestamp <= endTime)
    .filter(
      (event): event is UpdateSpellUsableEvent =>
        IsUpdateSpellUsable(event) &&
        event.ability.guid === spellId &&
        event.updateType === UpdateSpellUsableType.UseCharge,
    );

  const segmentProps = {
    gapHighlightMode,
    minimizeIcons,
    windowStart: startTime,
    windowEnd: endTime,
    fightStart,
    fightEnd,
    abilityId: spellId,
    abilityCdMs,
    abilityName,
    hasCharges,
    slimLines,
  };

  let lastAvailable = startTime;
  return (
    <div
      className="cooldown-bar-window"
      {...others}
      style={{
        left: `${((startTime - fightStart) / fightDuration) * 100}%`,
        width: `${((endTime - startTime) / fightDuration) * 100}%`,
      }}
    >
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
            className={
              gapHighlightMode === GapHighlight.None
                ? 'cooldown-available'
                : 'cooldown-available-bad'
            }
            style={{ left: '0%', width: '100%' }}
          />
        </Tooltip>
      )}
      {endCooldowns.map((cd, ix) => {
        // end cooldown events can be placed after fight end, so we need to clip the bars
        const end = cd.timestamp > endTime ? endTime : cd.timestamp;
        const currLastAvailable = lastAvailable;
        lastAvailable = end;
        // render the last period of availablility and also this cooldown
        return (
          <Fragment key={ix + '-cd-bar-group'}>
            <CooldownBarSegment
              startTimestamp={currLastAvailable}
              endTimestamp={cd.overallStartTimestamp}
              type="available"
              key={ix + '-available'}
              {...segmentProps}
            />
            <CooldownBarSegment
              startTimestamp={cd.overallStartTimestamp}
              endTimestamp={end}
              type="onCooldown"
              key={ix + '-cooldown'}
              {...segmentProps}
            />
          </Fragment>
        );
      })}
      {endCooldowns.length !== 0 && lastAvailable !== endTime && (
        <CooldownBarSegment
          startTimestamp={lastAvailable}
          endTimestamp={endTime}
          type="available"
          key="end-available"
          {...segmentProps}
        />
      )}
      {useCharges.map((cd, ix) => {
        const left = `${((cd.timestamp - startTime) / (endTime - startTime)) * 100}%`;
        return (
          <div style={{ left }} key={ix + '-usecharge'}>
            {iconOrChip(spellId, minimizeIcons, slimLines)}
          </div>
        );
      })}
    </div>
  );
};

/**
 * Displays a bar with icons showing when a cooldown spell was used, and shading showing when the
 * spell was on cooldown vs when it was available.
 *
 * See docs for {@link Props} for explanation of parameters.
 */
export function CooldownBar({ activeWindows, ...others }: Props): JSX.Element {
  const info = useInfo()!;

  const windows = activeWindows ?? [{ startTime: info.fightStart, endTime: info.fightEnd }];

  return (
    <div className="cooldown-bar">
      {windows.map((win) => (
        <CooldownBarWindow key={`${win.startTime}-${win.endTime}`} {...others} {...win} />
      ))}
    </div>
  );
}

function CooldownBarSegment({
  abilityId,
  abilityName,
  abilityCdMs,
  startTimestamp,
  endTimestamp,
  windowStart,
  windowEnd,
  fightStart,
  fightEnd,
  type,
  gapHighlightMode,
  minimizeIcons,
  slimLines,
  hasCharges,
}: {
  abilityId: number;
  abilityName: string;
  abilityCdMs: number;
  startTimestamp: number;
  endTimestamp: number;
  // used for tooltip formatting
  fightStart: number;
  fightEnd: number;
  // used for position calculation
  windowStart: number;
  windowEnd: number;
  type: 'onCooldown' | 'available';
  gapHighlightMode: GapHighlight;
  minimizeIcons?: boolean;
  slimLines?: boolean;
  hasCharges?: boolean;
}): JSX.Element {
  const fightDuration = windowEnd - windowStart;
  const left = `${((startTimestamp - windowStart) / fightDuration) * 100}%`;
  const width = `${((endTimestamp - startTimestamp) / fightDuration) * 100}%`;

  const openForFullCooldown =
    gapHighlightMode !== GapHighlight.None && endTimestamp - startTimestamp >= abilityCdMs;
  const redHighlight = gapHighlightMode === GapHighlight.All || openForFullCooldown;

  const startText = (
    <strong>{timestampOrFightTerminus(startTimestamp, fightStart, fightEnd)}</strong>
  );
  const endText = <strong>{timestampOrFightTerminus(endTimestamp, fightStart, fightEnd)}</strong>;

  const className =
    type === 'onCooldown'
      ? 'cooldown-unavailable'
      : redHighlight
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
        {type === 'onCooldown' && iconOrChip(abilityId, minimizeIcons, slimLines)}
      </div>
    </Tooltip>
  );
}

function iconOrChip(spellId: number, minimizeIcons?: boolean, slimLines?: boolean): JSX.Element {
  const w = slimLines ? 1 : 3;
  return minimizeIcons ? (
    <div className="cast-chip" style={{ width: w, height: '100%' }} />
  ) : (
    <SpellIcon noLink spell={spellId} />
  );
}

function timestampOrFightTerminus(timestamp: number, fightStart: number, fightEnd: number): string {
  if (timestamp === fightStart) {
    return 'fight start';
  } else if (timestamp === fightEnd) {
    return 'fight end';
  } else if (timestamp < fightStart) {
    return 'pre-pull';
  } else {
    return formatDuration(timestamp - fightStart);
  }
}

function IsUpdateSpellUsable(event: AnyEvent): event is UpdateSpellUsableEvent {
  return event.type === EventType.UpdateSpellUsable;
}
