import styled from '@emotion/styled';
import Spell from 'common/SPELLS/Spell';
import { SpellIcon } from 'interface';
import { useEvents, useInfo } from 'interface/guide';
import { useMemo, type JSX } from 'react';
import AutoSizer from 'react-virtualized-auto-sizer';
import { CHART_LEFT_PADDING, CHART_RIGHT_PADDING, DamageDoneChart } from './DamageDoneChart';
import CooldownAvailabilityRow from './CooldownAvailabilityRow';
import { BuffSpec, extractBuffWindows } from './buffWindows';

interface CooldownSpec {
  spell: Spell;
}

interface Props {
  cooldowns: CooldownSpec[];
  buffs: BuffSpec[];
  yScale?: number;
}

const ICON_SIZE = 24;
const ICON_GAP = 8;

const RowsContainer = styled.div`
  margin-top: 4px;
`;

const Row = styled.div`
  position: relative;
  margin-top: 2px;
  padding-left: ${CHART_LEFT_PADDING}px;
  padding-right: ${CHART_RIGHT_PADDING}px;
`;

const RowIcon = styled.div`
  position: absolute;
  left: ${CHART_LEFT_PADDING - ICON_SIZE - ICON_GAP}px;
  top: 0;
  width: ${ICON_SIZE}px;
  height: ${ICON_SIZE}px;
`;

export default function Timeline({ cooldowns, buffs, yScale }: Props): JSX.Element | null {
  const info = useInfo();
  const events = useEvents();

  const buffWindows = useMemo(() => {
    if (!info) {
      return [];
    }
    return extractBuffWindows(events, buffs, info.combatant.id, info.fightStart, info.fightEnd);
  }, [events, buffs, info]);

  if (!info) {
    return null;
  }

  return (
    <AutoSizer disableHeight>
      {({ width }) => (
        <div style={{ width }}>
          <DamageDoneChart buffWindows={buffWindows} yScale={yScale} width={width} />
          <RowsContainer>
            {cooldowns.map((cd) => (
              <Row key={cd.spell.id}>
                <RowIcon>
                  <SpellIcon spell={cd.spell.id} />
                </RowIcon>
                <CooldownAvailabilityRow spell={cd.spell} />
              </Row>
            ))}
          </RowsContainer>
        </div>
      )}
    </AutoSizer>
  );
}
