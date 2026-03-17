import Analyzer, { Options, SELECTED_PLAYER, SELECTED_PLAYER_PET } from 'parser/core/Analyzer';
import { TALENTS_DRUID } from 'common/TALENTS';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import ItemPercentHealingDone from 'parser/ui/ItemPercentHealingDone';
import ItemPercentDamageDone from 'parser/ui/ItemPercentDamageDone';
import SPELLS from 'common/SPELLS';
import Events, { HealEvent, DamageEvent } from 'parser/core/Events';
import { calculateEffectiveHealing, calculateEffectiveDamage } from 'parser/core/EventCalculateLib';

const GROVES_INSPIRATION_HEALING_INCREASE = 0.09;
const GROVES_INSPIRATION_DAMAGE_INCREASE = 0.1;

/**
 * **Groves Inspiration**
 * Hero Talent - Keeper of the Grove
 *
 * Wrath and Starfire damage increased by 10%.
 * Regrowth, Wild Growth, and Swiftmend healing increased by 9%.
 */
export default class GrovesInspiration extends Analyzer {
  totalHealing = 0;
  totalDamage = 0;

  constructor(options: Options) {
    super(options);

    this.active = this.selectedCombatant.hasTalent(TALENTS_DRUID.GROVES_INSPIRATION_TALENT);

    this.addEventListener(
      Events.heal
        .by(SELECTED_PLAYER)
        .spell([SPELLS.REGROWTH, SPELLS.WILD_GROWTH, SPELLS.SWIFTMEND]),
      this.onHeal,
    );

    this.addEventListener(
      Events.damage.by(SELECTED_PLAYER).spell([SPELLS.WRATH, SPELLS.STARFIRE]),
      this.onDamage,
    );
  }

  onHeal(event: HealEvent) {
    this.totalHealing += calculateEffectiveHealing(event, GROVES_INSPIRATION_HEALING_INCREASE);
  }

  onDamage(event: DamageEvent) {
    this.totalDamage += calculateEffectiveDamage(event, GROVES_INSPIRATION_DAMAGE_INCREASE);
  }

  statistic() {
    return (
      <Statistic
        position={STATISTIC_ORDER.OPTIONAL(2)}
        size="flexible"
        category={STATISTIC_CATEGORY.HERO_TALENTS}
      >
        <BoringSpellValueText spell={TALENTS_DRUID.GROVES_INSPIRATION_TALENT}>
          <ItemPercentHealingDone amount={this.totalHealing} />
          <br />
          <ItemPercentDamageDone amount={this.totalDamage} />
        </BoringSpellValueText>
      </Statistic>
    );
  }
}
