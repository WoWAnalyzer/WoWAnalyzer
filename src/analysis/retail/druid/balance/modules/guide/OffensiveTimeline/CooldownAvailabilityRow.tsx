import styled from '@emotion/styled';
import Spell from 'common/SPELLS/Spell';
import { formatDuration } from 'common/format';
import { SpellLink, Tooltip } from 'interface';
import { useAnalyzer, useInfo } from 'interface/guide';
import { UpdateSpellUsableType } from 'parser/core/Events';
import SpellUsable from 'parser/shared/modules/SpellUsable';

const ALL_CHARGES_COLOR = '#4a90e2';
const SOME_CHARGES_COLOR = '#3fa34d';
const NO_CHARGES_COLOR = '#75736d';

const RowContainer = styled.div`
  position: relative;
  height: 16px;
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
  height: 22px;
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

  const castTimestamps = events
    .filter(
      (event) =>
        event.timestamp < info.fightEnd &&
        (event.updateType === UpdateSpellUsableType.BeginCooldown ||
          event.updateType === UpdateSpellUsableType.UseCharge),
    )
    .map((event) => event.timestamp);

  return (
    <RowContainer>
      {segments.map((seg, idx) => (
        <Tooltip
          key={`${seg.start}-${idx}`}
          content={
            <>
              <SpellLink spell={spell.id} />
              {' @ '}
              {formatDuration(seg.start - info.fightStart)}
              {' - '}
              {formatDuration(seg.end - info.fightStart)}
              {' ('}
              {seg.charges}/{seg.maxCharges}
              {' charges)'}
            </>
          }
        >
          <Segment
            start={seg.start - info.fightStart}
            end={seg.end - info.fightStart}
            fightDuration={info.fightDuration}
            color={segmentColor(seg.charges, seg.maxCharges)}
          />
        </Tooltip>
      ))}
      {castTimestamps.map((timestamp) => (
        <CastBox
          key={`cast-${timestamp}`}
          at={timestamp - info.fightStart}
          fightDuration={info.fightDuration}
          activeTime={durationMs}
        />
      ))}
    </RowContainer>
  );
};

export default CooldownAvailabilityRow;
