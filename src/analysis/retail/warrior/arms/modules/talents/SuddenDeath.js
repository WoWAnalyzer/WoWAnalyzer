import { formatNumber } from 'common/format';
import SPELLS from 'common/SPELLS';
import { SpellLink } from 'interface';
import Analyzer, { SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events from 'parser/core/Events';
import StatisticListBoxItem from 'parser/ui/StatisticListBoxItem';

/**
 * Your attacks have a chance to make your next Execute cost no Rage,
 * be usable on any target regardless of their health, and deal damage as if you spent 40 Rage.
 */

class SuddenDeath extends Analyzer {
  totalProc = 0;
  totalDamages = 0;

  constructor(...args) {
    super(...args);
    this.active = this.selectedCombatant.hasTalent(SPELLS.SUDDEN_DEATH_TALENT_ARMS);
    this.addEventListener(
      Events.damage.by(SELECTED_PLAYER).spell(SPELLS.EXECUTE_DAMAGE),
      this._onExecuteDamage,
    );
    this.addEventListener(
      Events.applybuff.by(SELECTED_PLAYER).spell(SPELLS.SUDDEN_DEATH_ARMS_TALENT_BUFF),
      this._countSuddenDeathProc,
    );
    this.addEventListener(
      Events.refreshbuff.by(SELECTED_PLAYER).spell(SPELLS.SUDDEN_DEATH_ARMS_TALENT_BUFF),
      this._countSuddenDeathProc,
    );
  }

  _onExecuteDamage(event) {
    if (!this.selectedCombatant.hasBuff(SPELLS.SUDDEN_DEATH_ARMS_TALENT_BUFF.id)) {
      return;
    }
    this.totalDamages += event.amount + (event.absorbed || 0);
  }

  _countSuddenDeathProc() {
    this.totalProc += 1;
  }

  subStatistic() {
    return (
      <StatisticListBoxItem
        title={
          <>
            <SpellLink id={SPELLS.EXECUTE_DAMAGE.id} /> with{' '}
            <SpellLink id={SPELLS.SUDDEN_DEATH_TALENT_ARMS.id} /> damage
          </>
        }
        value={formatNumber(this.totalDamages)}
        valueTooltip={`Total Execute damage while Sudden Death was active (${this.totalProc} proc)`}
      />
    );
  }
}

export default SuddenDeath;
