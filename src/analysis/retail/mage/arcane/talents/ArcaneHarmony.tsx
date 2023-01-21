import SPELLS from 'common/SPELLS';
import TALENTS from 'common/TALENTS/mage';
import Analyzer, { Options } from 'parser/core/Analyzer';
import { calculateEffectiveDamage } from 'parser/core/EventCalculateLib';
import { SELECTED_PLAYER } from 'parser/core/EventFilter';
import Events, { CastEvent, DamageEvent } from 'parser/core/Events';
import AbilityTracker from 'parser/shared/modules/AbilityTracker';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import ItemDamageDone from 'parser/ui/ItemDamageDone';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';

const DAMAGE_BONUS_PER_STACK = 0.08;

class ArcaneHarmony extends Analyzer {
  static dependencies = {
    abilityTracker: AbilityTracker,
  };
  protected abilityTracker!: AbilityTracker;

  bonusDamage = 0;
  stacks = 0;
  totalStacks = 0;

  constructor(options: Options) {
    super(options);
    this.active = false;
    this.addEventListener(
      Events.cast.by(SELECTED_PLAYER).spell(TALENTS.ARCANE_BARRAGE_TALENT),
      this.onBarrageCast,
    );
    this.addEventListener(
      Events.damage.by(SELECTED_PLAYER).spell(TALENTS.ARCANE_BARRAGE_TALENT),
      this.onBarrageDamage,
    );
  }

  onBarrageCast(event: CastEvent) {
    const buff = this.selectedCombatant.getBuff(SPELLS.ARCANE_HARMONY_BUFF.id);
    if (buff && buff.stacks) {
      this.stacks = buff.stacks;
    }
  }

  onBarrageDamage(event: DamageEvent) {
    if (this.stacks > 0) {
      this.bonusDamage += calculateEffectiveDamage(event, DAMAGE_BONUS_PER_STACK * this.stacks);
      this.totalStacks += this.stacks;
      this.stacks = 0;
    }
  }

  get averageStacks() {
    return (
      this.totalStacks / this.abilityTracker.getAbility(TALENTS.ARCANE_BARRAGE_TALENT.id).casts
    );
  }

  statistic() {
    return (
      <Statistic category={STATISTIC_CATEGORY.ITEMS} size="flexible">
        <BoringSpellValueText spellId={SPELLS.ARCANE_HARMONY_BUFF.id}>
          <ItemDamageDone amount={this.bonusDamage} />
          <br />
          {this.averageStacks.toFixed(2)} <small>Avg. stacks per Barrage</small>
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default ArcaneHarmony;
