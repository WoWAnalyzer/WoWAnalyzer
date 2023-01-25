import { formatNumber } from 'common/format';
import SPELLS from 'common/SPELLS';
import TALENTS from 'common/TALENTS/warrior';
import { SpellLink } from 'interface';
import Analyzer, { SELECTED_PLAYER, Options } from 'parser/core/Analyzer';
import Events, { DamageEvent } from 'parser/core/Events';
import StatisticListBoxItem from 'parser/ui/StatisticListBoxItem';

/**
 * Your attacks have a chance to make your next Execute cost no Rage,
 * be usable on any target regardless of their health, and deal damage as if you spent 40 Rage.
 */

class SuddenDeath extends Analyzer {
  totalProc = 0;
  totalDamages = 0;

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(TALENTS.SUDDEN_DEATH_SPEC_TALENT);
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

  _onExecuteDamage(event: DamageEvent) {
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
            <SpellLink id={TALENTS.SUDDEN_DEATH_SPEC_TALENT.id} /> damage
          </>
        }
        value={formatNumber(this.totalDamages)}
        valueTooltip={`Total Execute damage while Sudden Death was active (${this.totalProc} proc)`}
      />
    );
  }
}

export default SuddenDeath;
