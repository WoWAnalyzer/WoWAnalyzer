import { formatThousands } from 'common/format';
import TALENTS from 'common/TALENTS/warrior';
import { SpellLink } from 'interface';
import Analyzer, { Options } from 'parser/core/Analyzer';
import AbilityTracker from 'parser/shared/modules/AbilityTracker';
import StatisticListBoxItem from 'parser/ui/StatisticListBoxItem';

/**
 * Bash an enemy's skull, dealing [ 84% of Attack Power ] Physical damage.
 */

class Skullsplitter extends Analyzer {
  static dependencies = {
    abilityTracker: AbilityTracker,
  };

  protected abilityTracker!: AbilityTracker;

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(TALENTS.SKULLSPLITTER_TALENT);
  }

  subStatistic() {
    const Skullsplitter = this.abilityTracker.getAbility(TALENTS.SKULLSPLITTER_TALENT.id);
    const total = Skullsplitter.damageEffective || 0;
    const avg = total / (Skullsplitter.casts || 1);
    return (
      <StatisticListBoxItem
        title={
          <>
            Average <SpellLink id={TALENTS.SKULLSPLITTER_TALENT.id} /> damage
          </>
        }
        value={formatThousands(avg)}
        valueTooltip={`Total Skullsplitter damage: ${formatThousands(total)}`}
      />
    );
  }
}

export default Skullsplitter;
