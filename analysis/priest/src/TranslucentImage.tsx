// import { formatNumber } from 'common/format';
import SPELLS from 'common/SPELLS';
import Analyzer, { SELECTED_PLAYER, Options } from 'parser/core/Analyzer';
import Events, { DamageEvent } from 'parser/core/Events';
// import AbilityTracker from 'parser/shared/modules/AbilityTracker';
// import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import ConduitSpellText from 'parser/ui/ConduitSpellText';
import ItemDamageDone from 'parser/ui/ItemDamageDone';
import ItemHealingDone from 'parser/ui/ItemHealingDone';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';

import { TRANSLUCENT_IMAGE_INCREASE } from '../../priestdiscipline/src/constants';
class TranslucentImage extends Analyzer {
  damageReduced = 0;
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
    console.log(event);
  }

  statistic() {
    return (
      <Statistic
        position={STATISTIC_ORDER.OPTIONAL(13)}
        size="flexible"
        category={STATISTIC_CATEGORY.COVENANTS}
      >
        <>
          <ConduitSpellText spellId={SPELLS.TRANSLUCENT_IMAGE.id} rank={2}>
            <ItemHealingDone amount={1} /> <br />
            <ItemHealingDone amount={1} /> <br />
            <ItemDamageDone amount={1} />
          </ConduitSpellText>
        </>
      </Statistic>
    );
  }
}

export default TranslucentImage;
