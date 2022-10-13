import SPELLS from 'common/SPELLS';
import { TALENTS_MONK } from 'common/TALENTS';
import { SpellIcon } from 'interface';
import Analyzer from 'parser/core/Analyzer';
import AbilityTracker from 'parser/shared/modules/AbilityTracker';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import StatisticBox, { STATISTIC_ORDER } from 'parser/ui/StatisticBox';

/* Add in Statistic box to show Vivfy to Enveloping Mist Cast ratio.
 * TODO:
 * Add in suggestion thresholds and checklist item on ratio. Need additional log data to implement.
 */

class CastRatio extends Analyzer {
  static dependencies = {
    abilityTracker: AbilityTracker,
  };

  protected abilityTracker!: AbilityTracker;

  statistic() {
    const getAbility = (spellId: number) => this.abilityTracker.getAbility(spellId);

    const evmCasts = getAbility(TALENTS_MONK.ENVELOPING_MIST_TALENT.id).casts || 0;
    const vivCasts = getAbility(SPELLS.VIVIFY.id).casts || 0;

    return (
      <StatisticBox
        position={STATISTIC_ORDER.OPTIONAL(0)}
        category={STATISTIC_CATEGORY.THEORYCRAFT}
        icon={
          <>
            <SpellIcon id={TALENTS_MONK.ENVELOPING_MIST_TALENT.id} /> :{' '}
            <SpellIcon id={SPELLS.VIVIFY.id} />{' '}
          </>
        }
        value={`${evmCasts} : ${vivCasts}`}
        label="Enveloping Mist to Vivify Casts"
      />
    );
  }
}

export default CastRatio;
