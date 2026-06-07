import cssComponent from "interface/utils/css-component";
import styles from "./HeaderStatBox.module.scss";
import { formatNumber } from 'common/format';
import ROLES from 'game/ROLES';
import { ByRole, Role } from 'interface/guide/foundation/ByRole';
import { DamageIcon } from 'interface/icons';
import { useCombatLogParser } from 'interface/report/CombatLogParserContext';
import DamageDone from 'parser/shared/modules/throughput/DamageDone';
import HealingDone from 'parser/shared/modules/throughput/HealingDone';
import { colors, level0, level1 } from 'interface/design-system';
import { JSX } from 'react';

/** @internal */
export const StatBoxContainer = cssComponent("div", styles.StatBoxContainer, [] as const);

const StatBoxStat = cssComponent("dl", styles.StatBoxStat, [] as const);

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
