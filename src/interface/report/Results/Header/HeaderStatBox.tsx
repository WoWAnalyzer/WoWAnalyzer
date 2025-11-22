import styled from '@emotion/styled';
import { formatNumber } from 'common/format';
import ROLES from 'game/ROLES';
import { ByRole, Role } from 'interface/guide/foundation/ByRole';
import { DamageIcon } from 'interface/icons';
import { useCombatLogParser } from 'interface/report/CombatLogParserContext';
import DamageDone from 'parser/shared/modules/throughput/DamageDone';
import HealingDone from 'parser/shared/modules/throughput/HealingDone';
import { level1, colors, level0 } from 'interface/design-system';

/** @internal */
export const StatBoxContainer = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: center;
  justify-self: end;

  text-align: center;
  font-size: 1.5rem;

  border: 1px solid ${level1.border};
  background: ${level0.background};
  box-shadow: inset 1px 3px ${level1.shadow};
  border-radius: 0.5rem;
  padding: 0.5rem 1rem;
  margin-bottom: 0.5rem;
  margin-right: -0.5rem;

  & > * {
    border-right: 1px solid ${level1.border};
  }

  & > *:first-child {
    padding-left: 0;
  }

  & > *:last-child {
    border-right: none;
    padding-right: 0;
  }
`;

const StatBoxStat = styled.dl`
  & > dt {
    font-weight: normal;
    color: ${colors.unfocusedText};
    font-size: 75%;

    display: flex;
    gap: 0.5rem;
    align-items: baseline;
    align-content: baseline;
    justify-content: center;
  }
  & img {
    max-height: 0.75em;
  }

  min-width: 5em;

  padding: 0 1rem;
  margin: 0;
`;

export default function HeaderStatBox(): JSX.Element | null {
  return (
    <ByRole>
      <StatBoxContainer>
        <Role.Healer>
          <HealingStat />
        </Role.Healer>
        <DamageStat />
        <Role roles={[ROLES.TANK, ROLES.DPS.MELEE, ROLES.DPS.RANGED]}>
          <BossDamageStat />
        </Role>
      </StatBoxContainer>
    </ByRole>
  );
}

function HealingStat() {
  const { combatLogParser } = useCombatLogParser();
  if (!combatLogParser) {
    return null;
  }

  const duration = combatLogParser.fightDuration / 1000;

  return (
    <StatBoxStat>
      <dt>
        <img src="/img/healing.png" /> HPS
      </dt>
      <dd>{formatNumber(combatLogParser.getModule(HealingDone).total.effective / duration)}</dd>
    </StatBoxStat>
  );
}

function DamageStat() {
  const { combatLogParser } = useCombatLogParser();
  if (!combatLogParser) {
    return null;
  }

  const duration = combatLogParser.fightDuration / 1000;

  return (
    <StatBoxStat>
      <dt>
        <DamageIcon /> DPS
      </dt>
      <dd>{formatNumber(combatLogParser.getModule(DamageDone).total.effective / duration)}</dd>
    </StatBoxStat>
  );
}

function BossDamageStat() {
  const { combatLogParser } = useCombatLogParser();
  if (!combatLogParser) {
    return null;
  }

  const duration = combatLogParser.fightDuration / 1000;

  return (
    <StatBoxStat>
      <dt>
        <DamageIcon /> Boss DPS
      </dt>
      <dd>{formatNumber(combatLogParser.getModule(DamageDone).totalBoss.effective / duration)}</dd>
    </StatBoxStat>
  );
}
