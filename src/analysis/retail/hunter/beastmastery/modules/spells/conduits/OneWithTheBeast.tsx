import { ONE_WITH_THE_BEAST_DAMAGE_INCREASE } from 'analysis/retail/hunter/beastmastery/constants';
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
 * Bestial Wrath increases all damage you and your pet deal by X%.
 *
 * Example log
 *
 * TODO: Verify how this applies to Bestial Wrath (Multiplicate or Additive)
 */
class OneWithTheBeast extends Analyzer {
  conduitRank: number = 0;
  addedDamage: number = 0;

  constructor(options: Options) {
    super(options);
    this.conduitRank = this.selectedCombatant.conduitRankBySpellID(
      SPELLS.ONE_WITH_THE_BEAST_CONDUIT.id,
    );
    if (!this.conduitRank) {
      this.active = false;
      return;
    }

    this.addEventListener(Events.damage.by(SELECTED_PLAYER), this.onGenericDamage);
    this.addEventListener(Events.damage.by(SELECTED_PLAYER_PET), this.onGenericDamage);
  }

  onGenericDamage(event: DamageEvent) {
    if (!this.selectedCombatant.hasBuff(SPELLS.BESTIAL_WRATH.id)) {
      return;
    }
    this.addedDamage += calculateEffectiveDamage(
      event,
      ONE_WITH_THE_BEAST_DAMAGE_INCREASE[this.conduitRank],
    );
  }

  statistic() {
    return (
      <Statistic
        position={STATISTIC_ORDER.OPTIONAL(13)}
        size="flexible"
        category={STATISTIC_CATEGORY.COVENANTS}
      >
        <ConduitSpellText spellId={SPELLS.ONE_WITH_THE_BEAST_CONDUIT.id} rank={this.conduitRank}>
          <>
            <ItemDamageDone amount={this.addedDamage} />
          </>
        </ConduitSpellText>
      </Statistic>
    );
  }
}

export default OneWithTheBeast;
