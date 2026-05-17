import styled from '@emotion/styled';
import { formatDuration } from 'common/format';
import SPELLS from 'common/SPELLS';
import SpellLink from 'interface/SpellLink';
import Tooltip from 'interface/Tooltip';
import { BuffWindow } from 'analysis/retail/druid/balance/modules/guide/OffensiveTimeline/TimeWindows';

const BuffRows = styled.div`
  margin-top: 4px;
`;

const BuffRow = styled.div`
  position: relative;
  height: 10px;

  & + & {
    margin-top: 2px;
  }
`;

const BuffBar = styled.div<{
  start: number;
  end: number;
  fightDuration: number;
  color: string;
}>`
  position: absolute;
  top: 0;
  height: 100%;
  border-radius: 3px;
  background-color: ${({ color }) => color};
  opacity: 90%;

  width: ${({ start, end, fightDuration }) => ((end - start) / fightDuration) * 100}%;
  left: ${({ start, fightDuration }) => (start / fightDuration) * 100}%;
`;

interface Props {
  buffs: BuffWindow[];
  fightDuration: number;
  hoverStartTime: number | null;
}

const BUFF_ROW_ORDER = [SPELLS.ECLIPSE_SOLAR.id, SPELLS.ECLIPSE_LUNAR.id];
const buffRowOrder = (spellId: number) => {
  const idx = BUFF_ROW_ORDER.indexOf(spellId);
  return idx === -1 ? BUFF_ROW_ORDER.length : idx;
};

const BuffDisplay = ({ buffs, fightDuration, hoverStartTime }: Props) => {
  const groups: { spellId: number; windows: BuffWindow[] }[] = [];
  const indexBySpellId = new Map<number, number>();
  for (const buff of buffs) {
    let idx = indexBySpellId.get(buff.spellId);
    if (idx === undefined) {
      idx = groups.length;
      indexBySpellId.set(buff.spellId, idx);
      groups.push({ spellId: buff.spellId, windows: [] });
    }
    groups[idx].windows.push(buff);
  }
  groups.sort((a, b) => buffRowOrder(a.spellId) - buffRowOrder(b.spellId));

  return (
    <BuffRows>
      {groups.map((group) => (
        <BuffRow key={group.spellId}>
          {group.windows.map((buff) => {
            const externalHover = hoverStartTime === buff.startTime;
            return (
              <Tooltip
                key={`${buff.spellId}-${buff.startTime}`}
                hoverable
                content={
                  <>
                    <SpellLink spell={buff.spellId} /> @ {formatDuration(buff.startTime)} -{' '}
                    {formatDuration(buff.endTime)}
                  </>
                }
                isOpen={externalHover || undefined}
              >
                <BuffBar
                  start={buff.startTime}
                  end={buff.endTime}
                  fightDuration={fightDuration}
                  color={buff.color}
                />
              </Tooltip>
            );
          })}
        </BuffRow>
      ))}
    </BuffRows>
  );
};

export default BuffDisplay;
