import styled from '@emotion/styled';
import { formatDuration } from 'common/format';
import SpellLink from 'interface/SpellLink';
import Tooltip from 'interface/Tooltip';
import { BuffWindow } from './buffWindows';

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

const BuffDisplay = ({ buffs, fightDuration, hoverStartTime }: Props) => {
  // Group windows by spellId in first-seen order so each distinct buff gets its own row
  // and overlapping windows from different buffs don't visually stack.
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
