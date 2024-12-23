import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { DamageEvent, HealEvent } from 'parser/core/Events';
import ItemHealingDone from 'parser/ui/ItemHealingDone';
import ItemDamageDone from 'parser/ui/ItemDamageDone';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';
import { TALENTS_EVOKER } from 'common/TALENTS';
import TalentSpellText from 'parser/ui/TalentSpellText';
import SPELLS from 'common/SPELLS';
import SPECS from 'game/SPECS';

class Reverberations extends Analyzer {
  dotDamage = 0;
  hotHealing = 0;

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(TALENTS_EVOKER.REVERBERATIONS_TALENT);
    this.addEventListener(
      Events.heal.by(SELECTED_PLAYER).spell(SPELLS.SPIRITBLOOM_HOT),
      this.onSbHotHeal,
    );
    this.addEventListener(
      Events.damage.by(SELECTED_PLAYER).spell(SPELLS.UPHEAVAL_DOT),
      this.onUhDotDamage,
    );
  }

  onSbHotHeal(event: HealEvent) {
    this.hotHealing += event.amount;
  }

  onUhDotDamage(event: DamageEvent) {
    this.dotDamage += event.amount;
  }

  statistic() {
    const returnedItemDone =
      this.selectedCombatant.spec === SPECS.PRESERVATION_EVOKER ? (
        <ItemHealingDone amount={this.hotHealing} />
      ) : (
        <ItemDamageDone amount={this.dotDamage} />
      );
    return (
      <Statistic
        position={STATISTIC_ORDER.CORE(5)}
        size="flexible"
        category={STATISTIC_CATEGORY.HERO_TALENTS}
      >
        <TalentSpellText talent={TALENTS_EVOKER.REVERBERATIONS_TALENT}>
          <div>{returnedItemDone}</div>
        </TalentSpellText>
      </Statistic>
    );
  }
}

export default Reverberations;
