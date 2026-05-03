import styled from '@emotion/styled';
import SPELLS from 'common/SPELLS';
import { SpellIcon } from 'interface';
import { useEvents, useInfo } from 'interface/guide';
import { useCallback, useMemo, useState, type JSX } from 'react';
import AutoSizer from 'react-virtualized-auto-sizer';
import { SignalListener } from 'react-vega';
import { cdSpell } from 'analysis/retail/druid/balance/constants';
import { CHART_DATA_PLOT_LEFT_OFFSET, DamageDoneChart } from './DamageDoneChart';
import CooldownAvailabilityRow from './CooldownAvailabilityRow';
import BuffDisplay from './BuffDisplay';
import { extractBuffWindows } from './buffWindows';

const ICON_SIZE = 24;

const CD_COLOR = '#26d4c8';
const SOLAR_COLOR = '#e58a3a';
const LUNAR_COLOR = '#7ab2ff';

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

export default function Timeline(): JSX.Element | null {
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

  const cooldownSpell = info ? cdSpell(info.combatant) : null;
  const cooldownSpells = cooldownSpell ? [cooldownSpell, SPELLS.SOLAR_ECLIPSE] : [];

  const buffWindows = useMemo(() => {
    if (!info || !cooldownSpell) {
      return [];
    }
    return extractBuffWindows(
      events,
      [
        { spellId: cooldownSpell.id, color: CD_COLOR },
        { spellId: SPELLS.ECLIPSE_SOLAR.id, color: SOLAR_COLOR },
        { spellId: SPELLS.ECLIPSE_LUNAR.id, color: LUNAR_COLOR },
      ],
      info.combatant.id,
      info.fightStart,
      info.fightEnd,
    );
  }, [events, info, cooldownSpell]);

  if (!info || !cooldownSpell) {
    return null;
  }

  return (
    <AutoSizer disableHeight>
      {({ width }) => (
        <div style={{ width }}>
          <DamageDoneChart buffWindows={buffWindows} width={width} onHover={onHover} />
          <BarsContainer>
            <BuffDisplay
              buffs={buffWindows}
              fightDuration={info.fightDuration}
              hoverStartTime={hoverStartTime}
            />
          </BarsContainer>
          <RowsContainer>
            {cooldownSpells.map((spell) => (
              <Row key={spell.id}>
                <RowIcon>
                  <SpellIcon spell={spell.id} />
                </RowIcon>
                <CooldownAvailabilityRow spell={spell} />
              </Row>
            ))}
          </RowsContainer>
        </div>
      )}
    </AutoSizer>
  );
}
