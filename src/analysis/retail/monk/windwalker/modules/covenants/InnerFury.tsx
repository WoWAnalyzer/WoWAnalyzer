import { formatNumber, formatPercentage } from 'common/format';
import SPELLS from 'common/SPELLS';
import Analyzer, { Options, SELECTED_PLAYER, SELECTED_PLAYER_PET } from 'parser/core/Analyzer';
import conduitScaling from 'parser/core/conduitScaling';
import { calculateEffectiveDamage } from 'parser/core/EventCalculateLib';
import Events, { DamageEvent } from 'parser/core/Events';
import ItemDamageDone from 'parser/ui/ItemDamageDone';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';

class InnerFury extends Analyzer {
  IF_MOD = 0;
  totalDamage = 0;
  /**
   * Increase damage and healing by fists of fury by x%
   */
  constructor(options: Options) {
    super(options);
    const conduitRank = 0;
    if (!conduitRank) {
      this.active = false;
      return;
    }

    this.IF_MOD = conduitScaling(0.04, conduitRank);

    this.addEventListener(
      Events.damage.by(SELECTED_PLAYER | SELECTED_PLAYER_PET).spell(SPELLS.FISTS_OF_FURY_DAMAGE),
      this.onFOFDamage,
    );
  }
  onFOFDamage(event: DamageEvent) {
    this.totalDamage += calculateEffectiveDamage(event, this.IF_MOD);
  }
  statistic() {
    return (
      <Statistic
        position={STATISTIC_ORDER.OPTIONAL(13)}
        size="flexible"
        category={STATISTIC_CATEGORY.COVENANTS}
        tooltip={
          <>
            The {formatPercentage(this.IF_MOD)}% increase from Inner Fury was worth ~
            {formatNumber(this.totalDamage)} raw Damage.
          </>
        }
      >
        <BoringSpellValueText spellId={SPELLS.INNER_FURY.id}>
          <ItemDamageDone amount={this.totalDamage} />
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default InnerFury;
