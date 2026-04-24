import SPELLS from 'common/SPELLS';
import TALENTS from 'common/TALENTS/hunter';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { DamageEvent } from 'parser/core/Events';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import ItemDamageDone from 'parser/ui/ItemDamageDone';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';

/**
 * While in combat, every 30 sec your next Kill Command summons the aid of a Beast.
 */

class HowlOfThePackLeaderHog extends Analyzer {
  damage = 0;
  activeDireBeasts: string[] = [];

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(TALENTS.HOWL_OF_THE_PACK_LEADER_TALENT);
    this.addEventListener(
      Events.damage
        .by(SELECTED_PLAYER)
        .spell([SPELLS.PL_HOGSTRIDER_DAMAGE_1, SPELLS.PL_HOGSTRIDER_DAMAGE_2]),
      this.onCast,
    );
  }

  onCast(event: DamageEvent) {
    this.damage += (event.amount || 0) + (event.absorbed || 0);
  }

  statistic() {
    return (
      <Statistic
        position={STATISTIC_ORDER.OPTIONAL(13)}
        size="flexible"
        category={STATISTIC_CATEGORY.HERO_TALENTS}
      >
        <BoringSpellValueText spell={SPELLS.PL_HOGSTRIDER_DAMAGE_1}>
          <ItemDamageDone amount={this.damage} />
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default HowlOfThePackLeaderHog;
