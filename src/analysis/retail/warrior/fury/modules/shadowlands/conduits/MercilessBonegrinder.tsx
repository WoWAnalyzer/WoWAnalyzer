import SPELLS from 'common/SPELLS';
import Analyzer, { Options } from 'parser/core/Analyzer';
import { calculateEffectiveDamage } from 'parser/core/EventCalculateLib';
import { SELECTED_PLAYER } from 'parser/core/EventFilter';
import Events, { DamageEvent } from 'parser/core/Events';
import Enemies from 'parser/shared/modules/Enemies';
import ConduitSpellText from 'parser/ui/ConduitSpellText';
import ItemDamageDone from 'parser/ui/ItemDamageDone';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';

const DAMAGE_BONUS = [0, 1.0, 1.1, 1.2, 1.3, 1.4, 1.5, 1.6, 1.7, 1.8, 1.9, 2.0, 2.1, 2.2, 2.3, 2.4];

class MercilessBonegrinder extends Analyzer {
  static dependencies = {
    enemies: Enemies,
  };
  protected enemies!: Enemies;

  conduitRank = 0;
  bonusDamage = 0;

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasConduitBySpellID(SPELLS.MERCILESS_BONEGRINDER.id);
    this.conduitRank = this.selectedCombatant.conduitRankBySpellID(SPELLS.MERCILESS_BONEGRINDER.id);
    this.addEventListener(
      Events.damage
        .by(SELECTED_PLAYER)
        .spell([
          SPELLS.WHIRLWIND_FURY_DAMAGE_MH,
          SPELLS.WHIRLWIND_FURY_DAMAGE_OH,
          SPELLS.WHIRLWIND_FURY_DAMAGE_OTHER_MH,
          SPELLS.WHIRLWIND_FURY_DAMAGE_OTHER_OH,
        ]),
      this.onDamage,
    );
  }

  onDamage(event: DamageEvent) {
    const enemy = this.enemies.getEntity(event);
    if (
      enemy &&
      this.selectedCombatant.hasBuff(SPELLS.MERCILESS_BONEGRINDER_BUFF.id, event.timestamp)
    ) {
      this.bonusDamage += calculateEffectiveDamage(event, DAMAGE_BONUS[this.conduitRank]);
    }
  }

  statistic() {
    return (
      <Statistic category={STATISTIC_CATEGORY.ITEMS} size="flexible">
        <ConduitSpellText spellId={SPELLS.MERCILESS_BONEGRINDER.id} rank={this.conduitRank}>
          <ItemDamageDone amount={this.bonusDamage} />
        </ConduitSpellText>
      </Statistic>
    );
  }
}

export default MercilessBonegrinder;
