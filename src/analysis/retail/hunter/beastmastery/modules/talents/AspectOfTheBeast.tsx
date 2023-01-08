import {
  AOTB_ABILITIES_NOT_AFFECTED,
  AOTB_MULTIPLIER,
} from 'analysis/retail/hunter/beastmastery/constants';
import TALENTS from 'common/TALENTS/hunter';
import Analyzer, { Options, SELECTED_PLAYER_PET } from 'parser/core/Analyzer';
import { calculateEffectiveDamage } from 'parser/core/EventCalculateLib';
import { calculateEffectiveHealing } from 'parser/core/EventCalculateLib';
import Events, { DamageEvent, HealEvent } from 'parser/core/Events';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import ItemDamageDone from 'parser/ui/ItemDamageDone';
import ItemHealingDone from 'parser/ui/ItemHealingDone';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';

/**
 * Increases the damage of your pet's abilities by 30%.
 * Increases the effectiveness of your pet's Predator's Thirst, Endurance Training, and Pathfinding passives by 50%.
 *
 * Example log:
 * https://www.warcraftlogs.com/reports/a4KVj37kTNbyxG1Y#fight=10&type=summary&source=8
 */
class AspectOfTheBeast extends Analyzer {
  damage = 0;
  healing = 0;

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(TALENTS.ASPECT_OF_THE_BEAST_TALENT);
    this.addEventListener(Events.damage.by(SELECTED_PLAYER_PET), this.onPetDamage);
    this.addEventListener(Events.heal.by(SELECTED_PLAYER_PET), this.onPetHeal);
  }

  onPetDamage(event: DamageEvent) {
    const spellId = event.ability.guid;
    if (AOTB_ABILITIES_NOT_AFFECTED.includes(spellId)) {
      return;
    }
    this.damage += calculateEffectiveDamage(event, AOTB_MULTIPLIER);
  }

  onPetHeal(event: HealEvent) {
    this.healing += calculateEffectiveHealing(event, AOTB_MULTIPLIER);
  }

  statistic() {
    return (
      <Statistic
        position={STATISTIC_ORDER.OPTIONAL(13)}
        size="flexible"
        category={STATISTIC_CATEGORY.TALENTS}
      >
        <BoringSpellValueText spellId={TALENTS.ASPECT_OF_THE_BEAST_TALENT.id}>
          <>
            <ItemDamageDone amount={this.damage} />
            <br />
            <ItemHealingDone amount={this.healing} />
          </>
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default AspectOfTheBeast;
