import { formatThousands } from 'common/format';
import SPELLS from 'common/SPELLS';
import { SpellLink } from 'interface';
import Analyzer, { SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events from 'parser/core/Events';
import AbilityTracker from 'parser/shared/modules/AbilityTracker';
import StatisticListBoxItem from 'parser/ui/StatisticListBoxItem';

/**
 * Instantly attack the target, causing [ 39.31% of Attack Power ] damage
 * and healing you for 20% of your maximum health.
 *
 * Killing an enemy that yields experience or honor resets the cooldown of Impending Victory.
 */

class ImpendingVictory extends Analyzer {
  static dependencies = {
    abilityTracker: AbilityTracker,
  };

  totalHeal = 0;

  constructor(...args) {
    super(...args);
    this.active = this.selectedCombatant.hasTalent(SPELLS.IMPENDING_VICTORY_TALENT);
    this.addEventListener(
      Events.heal.by(SELECTED_PLAYER).spell(SPELLS.IMPENDING_VICTORY_TALENT_HEAL),
      this._onImpendingVictoryHeal,
    );
  }

  _onImpendingVictoryHeal(event) {
    this.totalHeal += event.amount;
  }

  subStatistic() {
    const impendingVictory = this.abilityTracker.getAbility(SPELLS.IMPENDING_VICTORY_TALENT.id);
    const total = impendingVictory.damageEffective || 0;
    const avg = this.totalHeal / (impendingVictory.casts || 1);
    return (
      <StatisticListBoxItem
        title={
          <>
            Average <SpellLink id={SPELLS.IMPENDING_VICTORY_TALENT.id} /> heal
          </>
        }
        value={formatThousands(avg)}
        valueTooltip={
          <>
            Total Impending Victory heal: {formatThousands(this.totalHeal)} <br />
            Total Impending Victory damages: {formatThousands(total)}
          </>
        }
      />
    );
  }
}

export default ImpendingVictory;
