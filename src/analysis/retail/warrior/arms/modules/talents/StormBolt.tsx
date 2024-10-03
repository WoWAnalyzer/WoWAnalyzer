import { formatNumber, formatThousands } from 'common/format';
import SPELLS from 'common/SPELLS';
import TALENTS from 'common/TALENTS/warrior';
import { SpellLink } from 'interface';
import Analyzer, { SELECTED_PLAYER, Options } from 'parser/core/Analyzer';
import Events from 'parser/core/Events';
import AbilityTracker from 'parser/shared/modules/AbilityTracker';
import StatisticListBoxItem from 'parser/ui/StatisticListBoxItem';

/**
 * Hurls your weapon at an enemy, causing [ 16.38% of Attack Power ] Physical damage and stunning for 4 sec.
 */

class StormBolt extends Analyzer {
  static dependencies = {
    abilityTracker: AbilityTracker,
  };

  protected abilityTracker!: AbilityTracker;

  stun = 0;

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(TALENTS.STORM_BOLT_TALENT);
    this.addEventListener(
      Events.applydebuff.by(SELECTED_PLAYER).spell(SPELLS.STORM_BOLT_TALENT_DEBUFF),
      this._onStun,
    );
  }

  _onStun() {
    this.stun += 1;
  }

  subStatistic() {
    const stormBolt = this.abilityTracker.getAbility(TALENTS.STORM_BOLT_TALENT.id);
    const total = stormBolt.damageVal.effective;
    return (
      <StatisticListBoxItem
        title={
          <>
            <SpellLink spell={TALENTS.STORM_BOLT_TALENT} /> Stun
          </>
        }
        value={formatNumber(this.stun)}
        valueTooltip={`Total Storm Bolt damage: ${formatThousands(total)}`}
      />
    );
  }
}

export default StormBolt;
