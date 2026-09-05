import cssComponent from 'interface/utils/css-component';
import styles from './OffensiveTimeline.module.scss';
import SPELLS from 'common/SPELLS';
import { SpellIcon, SpellLink } from 'interface';
import { useInfo } from 'interface/guide';
import { useCallback, useMemo, useState, type JSX } from 'react';
import AutoSizer from 'react-virtualized-auto-sizer';
import { SignalListener } from 'react-vega';
import { cdSpell } from 'analysis/retail/druid/balance/constants';
import { CooldownSpellsDuration } from './CooldownSpellsDuration';
import { CHART_DATA_PLOT_LEFT_OFFSET, DamageDoneChart } from './DamageDoneChart';
import CooldownAvailabilityRow, {
  ALL_CHARGES_COLOR,
  NO_CHARGES_COLOR,
  SOME_CHARGES_COLOR,
} from './CooldownAvailabilityRow';
import BuffDisplay from './BuffDisplay';
import { TALENTS_DRUID } from 'common/TALENTS';
import { GuideDataWrapper } from 'interface/guide/components';
import { RoundedPanel } from 'interface/guide/components/GuideDivs';
import { getEclipseAndMainSpellBuffWindows } from 'analysis/retail/druid/balance/modules/guide/OffensiveTimeline/Helper';

const ICON_SIZE = 26;

const BarsContainer = cssComponent('div', styles.BarsContainer, ['offset'] as const);

const RowsContainer = cssComponent('div', styles.RowsContainer, ['offset'] as const);

const Row = cssComponent('div', styles.Row, ['iconSize'] as const);

const RowIcon = cssComponent('div', styles.RowIcon, ['iconSize'] as const);

export default function OffensiveTimeline(): JSX.Element | null {
  const info = useInfo();
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

    return getEclipseAndMainSpellBuffWindows(info.combatant, info.fightStart, info.fightEnd);
  }, [info]);

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

  const cooldownSpellsDuration = new CooldownSpellsDuration(info.combatant);

  return (
    <RoundedPanel>
      <AutoSizer disableHeight>
        {({ width }) => (
          <div style={{ width }}>
            <GuideDataWrapper bare title={`Eclipse timeline`}>
              <div>These timelines showcase your Eclipses and cooldown usage.</div>
              <div>
                You have several short cooldowns:
                {info.combatant.hasTalent(TALENTS_DRUID.FORCE_OF_NATURE_TALENT) && (
                  <span>
                    {' '}
                    <SpellLink spell={TALENTS_DRUID.FORCE_OF_NATURE_TALENT} />
                  </span>
                )}
                {info.combatant.hasTalent(TALENTS_DRUID.FURY_OF_ELUNE_TALENT) && (
                  <span>
                    {' '}
                    <SpellLink spell={TALENTS_DRUID.FURY_OF_ELUNE_TALENT} />
                  </span>
                )}
                {info.combatant.hasTalent(TALENTS_DRUID.CONVOKE_THE_SPIRITS_TALENT) && (
                  <span>
                    {' '}
                    <SpellLink spell={TALENTS_DRUID.CONVOKE_THE_SPIRITS_TALENT} />
                  </span>
                )}
                . They must be aligned with <SpellLink spell={TALENTS_DRUID.ECLIPSE_TALENT} /> and{' '}
                <SpellLink spell={cdSpell(info.combatant)} />.
              </div>
              <div>Use your cooldowns based on this priority:</div>
              <ul style={{ margin: '5px 0 5px 0' }}>
                <li>
                  <strong>Priority 1:</strong> Avoid capping! Never let either{' '}
                  <SpellLink spell={TALENTS_DRUID.ECLIPSE_TALENT} /> or{' '}
                  <SpellLink spell={cdSpell(info.combatant)} /> sit fully charged (in red in the
                  timeline).
                </li>
                <li>
                  <strong>Priority 2:</strong> Use <SpellLink spell={cdSpell(info.combatant)} />{' '}
                  when your short cooldowns are available.
                </li>
                <li>
                  <strong>Priority 3:</strong> If <SpellLink spell={cdSpell(info.combatant)} /> is
                  unavailable and your short cooldowns are available, use them with a standard{' '}
                  <SpellLink spell={TALENTS_DRUID.ECLIPSE_TALENT} /> instead.
                </li>
              </ul>
              <div style={{ marginBottom: '20px', marginTop: '10px', fontStyle: 'italic' }}>
                <strong>Note:</strong> It is perfectly fine to delay your cooldowns for a few
                seconds to play around encounter mechanics — such as holding them during heavy
                movement or saving them for upcoming high-priority focus like adds spawning.
              </div>
              <DamageDoneChart buffWindows={buffWindows} width={width} onHover={onHover} />
              <BarsContainer offset={CHART_DATA_PLOT_LEFT_OFFSET}>
                <BuffDisplay
                  buffs={buffWindows}
                  fightDuration={info.fightDuration}
                  hoverStartTime={hoverStartTime}
                />
              </BarsContainer>
            </GuideDataWrapper>
            <div style={{ height: '10px' }} />
            <GuideDataWrapper bare title={`Cooldowns`}>
              <RowsContainer offset={CHART_DATA_PLOT_LEFT_OFFSET}>
                {cooldownSpells
                  .map((spell) => ({ spell, durationMs: cooldownSpellsDuration.get(spell.id) }))
                  .filter(({ durationMs }) => durationMs !== undefined)
                  .map(({ spell, durationMs }) => (
                    <Row key={spell.id} iconSize={ICON_SIZE}>
                      <RowIcon iconSize={ICON_SIZE}>
                        <SpellIcon spell={spell.id} />
                      </RowIcon>
                      <CooldownAvailabilityRow spell={spell} durationMs={durationMs!} />
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
                  <small>On cooldown</small>
                </div>
              </div>
            </GuideDataWrapper>
          </div>
        )}
      </AutoSizer>
    </RoundedPanel>
  );
}
