import { SHINING_RADIANCE_INCREASE } from 'analysis/retail/priest/discipline/constants';
import SPELLS from 'common/SPELLS';
import Analyzer, { SELECTED_PLAYER } from 'parser/core/Analyzer';
import { calculateEffectiveHealing } from 'parser/core/EventCalculateLib';
import Events, { HealEvent } from 'parser/core/Events';
import { Options } from 'parser/core/Module';
import ConduitSpellText from 'parser/ui/ConduitSpellText';
import ItemHealingDone from 'parser/ui/ItemHealingDone';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';

class ShiningRadiance extends Analyzer {
  conduitRank: number = 0;
  conduitIncrease: number = 0;
  bonusRadianceHealing: number = 0;

  constructor(options: Options) {
    super(options);

    this.conduitRank = this.selectedCombatant.conduitRankBySpellID(SPELLS.SHINING_RADIANCE.id);
    if (!this.conduitRank) {
      this.active = false;
      return;
    }
    this.conduitIncrease = SHINING_RADIANCE_INCREASE[this.conduitRank];

    this.addEventListener(
      Events.heal.by(SELECTED_PLAYER).spell(SPELLS.POWER_WORD_RADIANCE),
      this.onRadianceHeal,
    );
  }

  onRadianceHeal(event: HealEvent) {
    this.bonusRadianceHealing += calculateEffectiveHealing(event, this.conduitIncrease);
  }

  statistic() {
    return (
      <Statistic
        position={STATISTIC_ORDER.OPTIONAL(13)}
        size="flexible"
        category={STATISTIC_CATEGORY.COVENANTS}
      >
        <ConduitSpellText spellId={SPELLS.SHINING_RADIANCE.id} rank={this.conduitRank}>
          <>
            <ItemHealingDone amount={this.bonusRadianceHealing} />
          </>
        </ConduitSpellText>
      </Statistic>
    );
  }
}

export default ShiningRadiance;
