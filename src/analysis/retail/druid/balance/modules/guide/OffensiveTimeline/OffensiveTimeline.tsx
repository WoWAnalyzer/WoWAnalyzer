import styled from '@emotion/styled';
import SPELLS from 'common/SPELLS';
import { SpellIcon } from 'interface';
import { useEvents, useInfo } from 'interface/guide';
import { useCallback, useMemo, useState, type JSX } from 'react';
import AutoSizer from 'react-virtualized-auto-sizer';
import { SignalListener } from 'react-vega';
import { cdDuration, cdSpell } from 'analysis/retail/druid/balance/constants';
import { CHART_DATA_PLOT_LEFT_OFFSET, DamageDoneChart } from './DamageDoneChart';
import CooldownAvailabilityRow, {
  ALL_CHARGES_COLOR,
  NO_CHARGES_COLOR,
  SOME_CHARGES_COLOR,
} from './CooldownAvailabilityRow';
import BuffDisplay from './BuffDisplay';
import { extractBuffWindows } from './buffWindows';
import { TALENTS_DRUID } from 'common/TALENTS';
import { GuideDataWrapper } from 'interface/guide/components';
import { RoundedPanel } from 'interface/guide/components/GuideDivs';

const ICON_SIZE = 26;

const BarsContainer = styled.div`
  margin-left: ${CHART_DATA_PLOT_LEFT_OFFSET}px;
`;

const RowsContainer = styled.div`
  margin-top: 4px;
  margin-left: ${CHART_DATA_PLOT_LEFT_OFFSET}px;
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

const Row = styled.div`
  position: relative;
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

export default function OffensiveTimeline(): JSX.Element | null {
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

    return extractBuffWindows(events, info.combatant, info.fightStart, info.fightEnd);
  }, [events, info]);

  if (!info) {
    return null;
  }

  const mainSpell = cdSpell(info.combatant);
  const cooldownSpells = [mainSpell, SPELLS.SOLAR_ECLIPSE, TALENTS_DRUID.FORCE_OF_NATURE_TALENT];

  if (info.combatant.hasTalent(TALENTS_DRUID.CONVOKE_THE_SPIRITS_TALENT)) {
    cooldownSpells.push(SPELLS.CONVOKE_SPIRITS);
  }

  if (info.combatant.hasTalent(TALENTS_DRUID.FURY_OF_ELUNE_TALENT)) {
    cooldownSpells.push(TALENTS_DRUID.FURY_OF_ELUNE_TALENT);
  }

  const cooldownSpellsDuration: Record<number, number> = {
    [mainSpell.id]: cdDuration(info.combatant),
    [SPELLS.SOLAR_ECLIPSE.id]: 15000,
    [TALENTS_DRUID.FORCE_OF_NATURE_TALENT.id]: 10000,
    [SPELLS.CONVOKE_SPIRITS.id]: 4000,
    [TALENTS_DRUID.FURY_OF_ELUNE_TALENT.id]: 8000,
  };

  return (
    <RoundedPanel>
      <AutoSizer disableHeight>
        {({ width }) => (
          <div style={{ width }}>
            <GuideDataWrapper bare title={`Eclipse timeline`}>
              <DamageDoneChart buffWindows={buffWindows} width={width} onHover={onHover} />
              <BarsContainer>
                <BuffDisplay
                  buffs={buffWindows}
                  fightDuration={info.fightDuration}
                  hoverStartTime={hoverStartTime}
                />
              </BarsContainer>
            </GuideDataWrapper>
            <div style={{ height: '10px' }} />
            <GuideDataWrapper bare title={`Cooldown availability`}>
              <RowsContainer>
                {cooldownSpells.map((spell) => (
                  <Row key={spell.id}>
                    <RowIcon>
                      <SpellIcon spell={spell.id} />
                    </RowIcon>
                    <CooldownAvailabilityRow
                      spell={spell}
                      durationMs={cooldownSpellsDuration[spell.id]}
                    />
                  </Row>
                ))}
              </RowsContainer>
              <div style={{ marginTop: '20px', display: 'flex', flexDirection: 'column' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <div
                    style={{
                      height: '12px',
                      width: '12px',
                      flexShrink: 0,
                      backgroundColor: ALL_CHARGES_COLOR,
                    }}
                  />{' '}
                  <small>All charges available</small>
                </div>
                <div
                  style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '-3px' }}
                >
                  <div
                    style={{
                      height: '12px',
                      width: '12px',
                      flexShrink: 0,
                      backgroundColor: SOME_CHARGES_COLOR,
                    }}
                  />{' '}
                  <small>Some charges available</small>
                </div>
                <div
                  style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '-3px' }}
                >
                  <div
                    style={{
                      height: '12px',
                      width: '12px',
                      flexShrink: 0,
                      backgroundColor: NO_CHARGES_COLOR,
                    }}
                  />{' '}
                  <small>Not available</small>
                </div>
              </div>
            </GuideDataWrapper>
          </div>
        )}
      </AutoSizer>
    </RoundedPanel>
  );
}
