import { formatNumber } from 'common/format';
import SPELLS from 'common/SPELLS';
import Analyzer, { SELECTED_PLAYER, Options } from 'parser/core/Analyzer';
import conduitScaling from 'parser/core/conduitScaling';
import Events, { DamageEvent } from 'parser/core/Events';
import ConduitSpellText from 'parser/ui/ConduitSpellText';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';

const TRANSLUCENT_IMAGE_RANK_ONE = 6;

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
    this.conduitIncrease = conduitScaling(TRANSLUCENT_IMAGE_RANK_ONE, this.conduitRank);
    this.addEventListener(Events.damage.to(SELECTED_PLAYER), this.onDamageTaken);
  }

  onDamageTaken(event: DamageEvent) {
    if (!this.selectedCombatant.hasBuff(SPELLS.TRANSLUCENT_IMAGE_BUFF.id)) {
      return;
    }
    this.damageDuringTranslucentImage += event.amount + (event.absorbed || 0);
  }

  statistic() {
    const fightDuration = this.owner.fightDuration;
    this.damageReduced =
      ((this.damageDuringTranslucentImage / (1 - this.conduitIncrease / 100)) *
        this.conduitIncrease) /
      100;

    return (
      <Statistic
        position={STATISTIC_ORDER.OPTIONAL(14)}
        size="flexible"
        category={STATISTIC_CATEGORY.COVENANTS}
      >
        <>
          <ConduitSpellText spellId={SPELLS.TRANSLUCENT_IMAGE.id} rank={this.conduitRank}>
            {formatNumber(this.damageReduced)} <small> damage reduced </small> <br />
            {formatNumber((this.damageReduced / fightDuration) * 1000)} DRPS <br />
          </ConduitSpellText>
        </>
      </Statistic>
    );
  }
}

export default TranslucentImage;
