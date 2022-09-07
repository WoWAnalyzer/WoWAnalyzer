import { STRENGTH_OF_THE_PACK_DAMAGE_MODIFIER } from 'analysis/retail/hunter/survival/constants';
import SPELLS from 'common/SPELLS';
import Analyzer, { Options, SELECTED_PLAYER, SELECTED_PLAYER_PET } from 'parser/core/Analyzer';
import { calculateEffectiveDamage } from 'parser/core/EventCalculateLib';
import Events, { DamageEvent } from 'parser/core/Events';
import ConduitSpellText from 'parser/ui/ConduitSpellText';
import ItemDamageDone from 'parser/ui/ItemDamageDone';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';

/**
 * When Kill Command's cooldown is reset, gain 3.0% increased damage for until cancelled.
 *
 * Example log
 *
 */
class StrengthOfThePack extends Analyzer {
  conduitRank: number = 0;
  addedDamage: number = 0;

  constructor(options: Options) {
    super(options);

    this.conduitRank = this.selectedCombatant.conduitRankBySpellID(
      SPELLS.STRENGTH_OF_THE_PACK_CONDUIT.id,
    );

    if (!this.conduitRank) {
      this.active = false;
      return;
    }

    this.addEventListener(
      Events.damage.by(SELECTED_PLAYER | SELECTED_PLAYER_PET),
      this.onGenericDamage,
    );
  }

  onGenericDamage(event: DamageEvent) {
    if (!this.selectedCombatant.hasBuff(SPELLS.STRENGTH_OF_THE_PACK_BUFF.id)) {
      return;
    }
    this.addedDamage += calculateEffectiveDamage(
      event,
      STRENGTH_OF_THE_PACK_DAMAGE_MODIFIER[this.conduitRank],
    );
  }

  statistic() {
    return (
      <Statistic
        position={STATISTIC_ORDER.OPTIONAL(13)}
        size="flexible"
        category={STATISTIC_CATEGORY.COVENANTS}
      >
        <ConduitSpellText spellId={SPELLS.STRENGTH_OF_THE_PACK_CONDUIT.id} rank={this.conduitRank}>
          <>
            <ItemDamageDone amount={this.addedDamage} />
          </>
        </ConduitSpellText>
      </Statistic>
    );
  }
}

export default StrengthOfThePack;
