import SPELLS from 'common/SPELLS';
import TALENTS from 'common/TALENTS/hunter';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { DamageEvent } from 'parser/core/Events';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import ItemDamageDone from 'parser/ui/ItemDamageDone';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';

class BlackArrow extends Analyzer {
  damage = 0;
  readonly activeBlackArrowTalent;

  constructor(options: Options) {
    super(options);

    if (this.selectedCombatant.hasTalent(TALENTS.BLACK_ARROW_BEAST_MASTERY_TALENT)) {
      this.activeBlackArrowTalent = TALENTS.BLACK_ARROW_BEAST_MASTERY_TALENT;
      this.active = true;
    } else if (this.selectedCombatant.hasTalent(TALENTS.BLACK_ARROW_MARKSMANSHIP_TALENT)) {
      this.activeBlackArrowTalent = TALENTS.BLACK_ARROW_MARKSMANSHIP_TALENT;
      this.active = true;
    } else {
      this.active = false;
      return;
    }

    this.addEventListener(
      Events.damage
        .by(SELECTED_PLAYER)
        .spell([
          SPELLS.BLACK_ARROW_DAMAGE,
          SPELLS.BLACK_ARROW_DAMAGE_2,
          SPELLS.BLACK_ARROW_DAMAGE_3,
        ]),
      this.onBlackArrowDamage,
    );
  }

  onBlackArrowDamage(event: DamageEvent) {
    this.damage += event.amount + (event.absorbed || 0);
  }

  statistic() {
    return (
      <Statistic
        position={STATISTIC_ORDER.CORE()}
        size="flexible"
        category={STATISTIC_CATEGORY.HERO_TALENTS}
      >
        <BoringSpellValueText spell={this.activeBlackArrowTalent!}>
          <ItemDamageDone amount={this.damage} />
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default BlackArrow;
