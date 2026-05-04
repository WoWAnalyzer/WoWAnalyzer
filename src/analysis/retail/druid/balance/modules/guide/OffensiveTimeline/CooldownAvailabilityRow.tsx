import styled from '@emotion/styled';
import Spell from 'common/SPELLS/Spell';
import { formatDuration } from 'common/format';
import { SpellLink, Tooltip } from 'interface';
import { useAnalyzer, useInfo } from 'interface/guide';
import { UpdateSpellUsableType } from 'parser/core/Events';
import SpellUsable from 'parser/shared/modules/SpellUsable';

export const ALL_CHARGES_COLOR = '#4a90e2';
export const SOME_CHARGES_COLOR = '#3fa34d';
export const NO_CHARGES_COLOR = '#75736d';

const RowContainer = styled.div`
  position: relative;
  height: 18px;
  width: 100%;
`;

const Segment = styled.div<{
  start: number;
  end: number;
  fightDuration: number;
  color: string;
}>`
  position: absolute;
  top: 0;
  height: 100%;
  background-color: ${({ color }) => color};
  width: ${({ start, end, fightDuration }) => ((end - start) / fightDuration) * 100}%;
  left: ${({ start, fightDuration }) => (start / fightDuration) * 100}%;
`;

const CastBox = styled.div<{ at: number; fightDuration: number; activeTime: number }>`
  position: absolute;
  top: -3px;
  height: 24px;
  width: ${({ at, activeTime, fightDuration }) =>
    (Math.min(activeTime, fightDuration - at) / fightDuration) * 100}%;
  border-radius: 3px;
  pointer-events: all;
  background: repeating-linear-gradient(
    135deg,
    rgb(168 168 168),
    rgb(168 168 168) 5px,
    rgb(228 228 228) 5px,
    rgb(228 228 228) 10px
  );
  border-left: 2px solid #fad500;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.4);
  left: ${({ at, fightDuration }) => (at / fightDuration) * 100}%;
`;

interface ChargeSegment {
  start: number;
  end: number;
  charges: number;
  maxCharges: number;
}

interface CooldownAvailabilityRowProps {
  spell: Spell;
  durationMs: number;
}

const getVisibleSubRanges = (
  segStart: number,
  segEnd: number,
  castRanges: Array<{ start: number; end: number }>,
): Array<{ start: number; end: number }> => {
  const sorted = castRanges
    .filter((r) => r.end > segStart && r.start < segEnd)
    .sort((a, b) => a.start - b.start);

  const result: Array<{ start: number; end: number }> = [];
  let cursor = segStart;

  for (const range of sorted) {
    const clampedStart = Math.max(range.start, segStart);
    if (clampedStart > cursor) {
      result.push({ start: cursor, end: clampedStart });
    }
    cursor = Math.max(cursor, Math.min(range.end, segEnd));
  }

  if (cursor < segEnd) {
    result.push({ start: cursor, end: segEnd });
  }

  return result;
};

const segmentColor = (charges: number, maxCharges: number) => {
  if (charges <= 0) {
    return NO_CHARGES_COLOR;
  }
  if (charges >= maxCharges) {
    return ALL_CHARGES_COLOR;
  }
  return SOME_CHARGES_COLOR;
};

const CooldownAvailabilityRow = ({ spell, durationMs }: CooldownAvailabilityRowProps) => {
  const info = useInfo();
  const spellUsable = useAnalyzer(SpellUsable);

  if (!info || !spellUsable) {
    return null;
  }

  const events = spellUsable.history(spell.id).data;

  const segments: ChargeSegment[] = [];
  // The spell starts the fight fully available. Until we see the first event we
  // don't know maxCharges, so default to 1 (it's overridden as soon as an event arrives).
  let lastTimestamp = info.fightStart;
  let lastCharges = events[0]?.maxCharges ?? 1;
  let lastMax = events[0]?.maxCharges ?? 1;

  for (const event of events) {
    if (event.timestamp >= info.fightEnd) {
      break;
    }
    if (event.timestamp > lastTimestamp) {
      segments.push({
        start: lastTimestamp,
        end: event.timestamp,
        charges: lastCharges,
        maxCharges: lastMax,
      });
    }
    lastTimestamp = event.timestamp;
    lastCharges = event.chargesAvailable;
    lastMax = event.maxCharges;
  }
  if (lastTimestamp < info.fightEnd) {
    segments.push({
      start: lastTimestamp,
      end: info.fightEnd,
      charges: lastCharges,
      maxCharges: lastMax,
    });
  }

  const castRanges = events
    .filter(
      (event) =>
        event.timestamp < info.fightEnd &&
        (event.updateType === UpdateSpellUsableType.BeginCooldown ||
          event.updateType === UpdateSpellUsableType.UseCharge),
    )
    .map((event) => ({
      start: event.timestamp - info.fightStart,
      end: Math.min(event.timestamp - info.fightStart + durationMs, info.fightDuration),
    }));

  return (
    <RowContainer>
      {segments.flatMap((seg, idx) => {
        const segStart = seg.start - info.fightStart;
        const segEnd = seg.end - info.fightStart;
        return getVisibleSubRanges(segStart, segEnd, castRanges).map((range, rIdx) => (
          <Tooltip
            key={`seg-${seg.start}-${idx}-${rIdx}`}
            content={
              <>
                {seg.charges <= 0 ? 'On cooldown' : 'Available'}
                {' @ '}
                {formatDuration(range.start)}
                {' - '}
                {formatDuration(range.end)}
                {' ('}
                {seg.charges}/{seg.maxCharges}
                {seg.maxCharges > 1 ? ' charges)' : ' charge)'}
              </>
            }
          >
            <Segment
              start={range.start}
              end={range.end}
              fightDuration={info.fightDuration}
              color={segmentColor(seg.charges, seg.maxCharges)}
            />
          </Tooltip>
        ));
      })}
      {castRanges.map((range) => (
        <Tooltip
          key={`cast-${range.start}`}
          content={
            <>
              <SpellLink spell={spell.id} />
              {' @ '}
              {formatDuration(range.start)}
              {' - '}
              {formatDuration(range.end)}
            </>
          }
        >
          <CastBox at={range.start} fightDuration={info.fightDuration} activeTime={durationMs} />
        </Tooltip>
      ))}
    </RowContainer>
  );
};

export default CooldownAvailabilityRow;
