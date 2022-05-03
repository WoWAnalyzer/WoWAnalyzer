import { formatNumber } from 'common/format';
import SPELLS from 'common/SPELLS';
import Analyzer, { SELECTED_PLAYER, Options } from 'parser/core/Analyzer';
import Events, { DamageEvent } from 'parser/core/Events';
// import AbilityTracker from 'parser/shared/modules/AbilityTracker';
// import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import ConduitSpellText from 'parser/ui/ConduitSpellText';
// import ItemDamageDone from 'parser/ui/ItemDamageDone';
// import ItemHealingDone from 'parser/ui/ItemHealingDone';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';

import { TRANSLUCENT_IMAGE_INCREASE } from '../../priestdiscipline/src/constants';
class TranslucentImage extends Analyzer {
  damageReduced = 0;
  damageDuringTranslucentImage = 0;
  conduitRank = 0;
  conduitIncrease = 0;

  constructor(options: Options) {
    super(options);
    this.conduitRank = this.selectedCombatant.conduitRankBySpellID(SPELLS.TRANSLUCENT_IMAGE.id);

    if (!this.conduitRank) {
      this.active = false;
      return;
    }
    this.conduitIncrease = TRANSLUCENT_IMAGE_INCREASE[this.conduitRank];
    this.addEventListener(Events.damage.to(SELECTED_PLAYER), this.onDamageTaken);
  }

  onDamageTaken(event: DamageEvent) {
    if (!this.selectedCombatant.hasBuff(SPELLS.TRANSLUCENT_IMAGE_BUFF.id)) {
      return;
    }
    this.damageDuringTranslucentImage = event.amount + (event.absorbed || 0);
  }

  statistic() {
    console.log(this.conduitIncrease);
    console.log(this.damageDuringTranslucentImage);
    this.damageReduced = this.damageDuringTranslucentImage / (1 - this.conduitIncrease / 100);
    console.log(this.damageReduced);
    return (
      <Statistic
        position={STATISTIC_ORDER.OPTIONAL(14)}
        size="flexible"
        category={STATISTIC_CATEGORY.COVENANTS}
      >
        <>
          <ConduitSpellText spellId={SPELLS.TRANSLUCENT_IMAGE.id} rank={this.conduitRank}>
            {formatNumber(this.damageReduced)} <small> damage reduced </small>
          </ConduitSpellText>
        </>
      </Statistic>
    );
  }
}

export default TranslucentImage;
