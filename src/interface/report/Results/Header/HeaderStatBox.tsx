import { formatNumber } from 'common/format';
import ROLES from 'game/ROLES';
import { ByRole, Role } from 'interface/guide/foundation/ByRole';
import { DamageIcon } from 'interface/icons';
import { useCombatLogParser } from 'interface/report/CombatLogParserContext';
import DamageDone from 'parser/shared/modules/throughput/DamageDone';
import HealingDone from 'parser/shared/modules/throughput/HealingDone';
import { JSX } from 'react';
import styles from './HeaderStatBox.module.scss';

/** @internal */
export const StatBoxContainer = `.${styles.statBoxContainer}`;

export default function HeaderStatBox(): JSX.Element | null {
  return (
    <ByRole>
      <div className={styles.statBoxContainer}>
        <Role.Healer>
          <HealingStat />
        </Role.Healer>
        <DamageStat />
        <Role roles={[ROLES.TANK, ROLES.DPS.MELEE, ROLES.DPS.RANGED]}>
          <BossDamageStat />
        </Role>
      </div>
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
    <dl className={styles.statBoxStat}>
      <dt>
        <img src="/img/healing.png" /> HPS
      </dt>
      <dd>{formatNumber(combatLogParser.getModule(HealingDone).total.effective / duration)}</dd>
    </dl>
  );
}

function DamageStat() {
  const { combatLogParser } = useCombatLogParser();
  if (!combatLogParser) {
    return null;
  }

  const duration = combatLogParser.fightDuration / 1000;

  return (
    <dl className={styles.statBoxStat}>
      <dt>
        <DamageIcon /> DPS
      </dt>
      <dd>{formatNumber(combatLogParser.getModule(DamageDone).total.effective / duration)}</dd>
    </dl>
  );
}

function BossDamageStat() {
  const { combatLogParser } = useCombatLogParser();
  if (!combatLogParser) {
    return null;
  }

  const duration = combatLogParser.fightDuration / 1000;

  return (
    <dl className={styles.statBoxStat}>
      <dt>
        <DamageIcon /> Boss DPS
      </dt>
      <dd>{formatNumber(combatLogParser.getModule(DamageDone).totalBoss.effective / duration)}</dd>
    </dl>
  );
}
