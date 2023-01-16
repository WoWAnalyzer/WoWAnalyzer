import { formatThousands } from 'common/format';
import SPELLS from 'common/SPELLS';
import TALENTS from 'common/TALENTS/warrior';
import { SpellLink } from 'interface';
import Analyzer, { Options } from 'parser/core/Analyzer';
import AbilityTracker from 'parser/shared/modules/AbilityTracker';
import StatisticListBoxItem from 'parser/ui/StatisticListBoxItem';

/**
 * Restores 6% health every 1 sec when you have not taken damage for 5 sec.
 */

class SecondWind extends Analyzer {
  static dependencies = {
    abilityTracker: AbilityTracker,
  };

  protected abilityTracker!: AbilityTracker;

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(TALENTS.SECOND_WIND_TALENT);
  }

  subStatistic() {
    const secondWind = this.abilityTracker.getAbility(SPELLS.SECOND_WIND_TALENT_HEAL.id);
    const heal = secondWind.healingEffective || 0;
    return (
      <StatisticListBoxItem
        title={
          <>
            <SpellLink id={TALENTS.SECOND_WIND_TALENT.id} /> health restored
          </>
        }
        value={formatThousands(heal)}
      />
    );
  }
}

export default SecondWind;
