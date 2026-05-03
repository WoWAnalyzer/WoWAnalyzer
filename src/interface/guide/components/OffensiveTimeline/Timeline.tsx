import styled from '@emotion/styled';
import Spell from 'common/SPELLS/Spell';
import { SpellIcon } from 'interface';
import { useEvents, useInfo } from 'interface/guide';
import { useCallback, useMemo, useState, type JSX } from 'react';
import AutoSizer from 'react-virtualized-auto-sizer';
import { SignalListener } from 'react-vega';
import { CHART_DATA_PLOT_LEFT_OFFSET, DamageDoneChart } from './DamageDoneChart';
import CooldownAvailabilityRow from './CooldownAvailabilityRow';
import BuffDisplay from './BuffDisplay';
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

const BarsContainer = styled.div`
  margin-left: ${CHART_DATA_PLOT_LEFT_OFFSET}px;
`;

const RowsContainer = styled.div`
  margin-top: 4px;
  margin-left: ${CHART_DATA_PLOT_LEFT_OFFSET}px;
`;

const Row = styled.div`
  position: relative;
  margin-top: 2px;
  min-height: ${ICON_SIZE}px;
  display: flex;
  align-items: center;
`;

const RowIcon = styled.div`
  position: absolute;
  left: -${ICON_SIZE}px;
  top: 0;
  width: ${ICON_SIZE}px;
  height: ${ICON_SIZE}px;
  z-index: 1;

  img.icon.game {
    width: 100%;
    height: 100%;
    margin: 0;
    display: block;
    border: 1px solid #75736d;
    border-radius: 0;
    box-shadow: 0 0 3px #000;
  }
`;

export default function Timeline({ cooldowns, buffs, yScale }: Props): JSX.Element | null {
  const info = useInfo();
  const events = useEvents();
  const [hoverStartTime, setHoverStartTime] = useState<number | null>(null);

  const onHover = useCallback((_event: string, item: { startTime: number[] }) => {
    if (item.startTime === undefined) {
      setHoverStartTime(null);
    } else {
      setHoverStartTime(item.startTime[0]);
    }
  }, []) as SignalListener;

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
          <DamageDoneChart
            buffWindows={buffWindows}
            yScale={yScale}
            width={width}
            onHover={onHover}
          />
          <BarsContainer>
            <BuffDisplay
              buffs={buffWindows}
              fightDuration={info.fightDuration}
              hoverStartTime={hoverStartTime}
            />
          </BarsContainer>
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
