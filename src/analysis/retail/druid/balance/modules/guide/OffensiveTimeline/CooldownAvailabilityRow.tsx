import styled from '@emotion/styled';
import Spell from 'common/SPELLS/Spell';
import { formatDuration } from 'common/format';
import { SpellLink, Tooltip } from 'interface';
import { BadColor, GoodColor, OkColor, useAnalyzer, useInfo } from 'interface/guide';
import SpellUsable from 'parser/shared/modules/SpellUsable';
import { TimeWindow } from 'analysis/retail/druid/balance/modules/guide/OffensiveTimeline/TimeWindows';
import {
  computeAbilityActiveTimeWindows,
  computeChargingTimeWindows,
} from 'analysis/retail/druid/balance/modules/guide/OffensiveTimeline/Helper';

export const ALL_CHARGES_COLOR = BadColor;
export const SOME_CHARGES_COLOR = OkColor;
export const NO_CHARGES_COLOR = GoodColor;

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

interface CooldownAvailabilityRowProps {
  spell: Spell;
  durationMs: number;
}

// Segments are rendered beneath "Ability active" overlay boxes, so only the uncovered portions need to be drawn.
// This returns the sub-ranges ("gaps") of [windowStart, windowEnd] not covered by any overlay.
const getUncoveredSubRanges = (
  chargingTimeWindowStart: number,
  chargingTimeWindowEnd: number,
  abilityActiveTimeWindows: TimeWindow[],
): Array<{ start: number; end: number }> => {
  const sortedAbilityActiveTimeWindows = abilityActiveTimeWindows
    .filter((w) => w.startTime < chargingTimeWindowEnd && w.endTime > chargingTimeWindowStart)
    .sort((a, b) => a.startTime - b.startTime);

  const gaps: Array<{ start: number; end: number }> = [];
  let cursor = chargingTimeWindowStart;

  for (const abilityActiveTimeWindow of sortedAbilityActiveTimeWindows) {
    if (cursor < abilityActiveTimeWindow.startTime) {
      gaps.push({ start: cursor, end: abilityActiveTimeWindow.startTime });
    }
    cursor = Math.max(cursor, Math.min(abilityActiveTimeWindow.endTime, chargingTimeWindowEnd));
  }

  if (cursor < chargingTimeWindowEnd) {
    gaps.push({ start: cursor, end: chargingTimeWindowEnd });
  }

  return gaps;
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

  const updateSpellUsableEvents = spellUsable.history(spell.id).data;
  const chargingTimeWindows = computeChargingTimeWindows(
    updateSpellUsableEvents,
    info.fightStart,
    info.fightEnd,
  );
  const abilityActiveTimeWindows = computeAbilityActiveTimeWindows(
    updateSpellUsableEvents,
    info.fightStart,
    info.fightEnd,
    info.fightDuration,
    durationMs,
  );

  return (
    <RowContainer>
      {chargingTimeWindows.flatMap((chargingTimeWindow, idx) => {
        const chargingTimeWindowStart = chargingTimeWindow.startTime - info.fightStart;
        const chargingTimeWindowEnd = chargingTimeWindow.endTime - info.fightStart;
        return getUncoveredSubRanges(
          chargingTimeWindowStart,
          chargingTimeWindowEnd,
          abilityActiveTimeWindows,
        ).map((range, rIdx) => (
          <Tooltip
            key={`seg-${chargingTimeWindow.startTime}-${idx}-${rIdx}`}
            content={
              <>
                {chargingTimeWindow.charges <= 0 ? 'On cooldown' : 'Available'}
                {' @ '}
                {formatDuration(range.start)}
                {' - '}
                {formatDuration(range.end)}
                {' ('}
                {chargingTimeWindow.charges}/{chargingTimeWindow.maxCharges}
                {chargingTimeWindow.maxCharges > 1 ? ' charges)' : ' charge)'}
              </>
            }
          >
            <Segment
              start={range.start}
              end={range.end}
              fightDuration={info.fightDuration}
              color={segmentColor(chargingTimeWindow.charges, chargingTimeWindow.maxCharges)}
            />
          </Tooltip>
        ));
      })}
      {abilityActiveTimeWindows.map((range) => (
        <Tooltip
          key={`cast-${range.startTime}`}
          content={
            <>
              <SpellLink spell={spell.id} />
              {' @ '}
              {formatDuration(range.startTime)}
              {' - '}
              {formatDuration(range.endTime)}
            </>
          }
        >
          <CastBox
            at={range.startTime}
            fightDuration={info.fightDuration}
            activeTime={durationMs}
          />
        </Tooltip>
      ))}
    </RowContainer>
  );
};

export default CooldownAvailabilityRow;
