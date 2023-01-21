import { formatThousands } from 'common/format';
import TALENTS from 'common/TALENTS/warrior';
import { SpellLink } from 'interface';
import Analyzer, { Options } from 'parser/core/Analyzer';
import AbilityTracker from 'parser/shared/modules/AbilityTracker';
import StatisticListBoxItem from 'parser/ui/StatisticListBoxItem';

/**
 * Strikes all enemies in front of you with a sweeping attack for [ 45% of Attack Power ] Physical damage.
 * Hitting 3 or more targets inflicts Deep Wounds.
 */

class Cleave extends Analyzer {
  static dependencies = {
    abilityTracker: AbilityTracker,
  };

  protected abilityTracker!: AbilityTracker;

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(TALENTS.CLEAVE_TALENT);
  }

  subStatistic() {
    const Cleave = this.abilityTracker.getAbility(TALENTS.CLEAVE_TALENT.id);
    const total = Cleave.damageEffective || 0;
    const avg = total / (Cleave.casts || 1);
    return (
      <StatisticListBoxItem
        title={
          <>
            Average <SpellLink id={TALENTS.CLEAVE_TALENT.id} /> damage
          </>
        }
        value={formatThousands(avg)}
        valueTooltip={`Total Cleave damage: ${formatThousands(total)}`}
      />
    );
  }
}

export default Cleave;
