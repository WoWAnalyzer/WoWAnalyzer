import SPELLS from 'common/SPELLS';
import TALENTS from 'common/TALENTS/mage';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import { calculateEffectiveDamage } from 'parser/core/EventCalculateLib';
import Events, { CastEvent, DamageEvent } from 'parser/core/Events';
import AbilityTracker from 'parser/shared/modules/AbilityTracker';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import { formatNumber } from 'common/format';

const DAMAGE_BONUS_PER_STACK = 0.05;

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
    this.active = this.selectedCombatant.hasTalent(TALENTS.ARCANE_HARMONY_TALENT);
    this.addEventListener(
      Events.cast.by(SELECTED_PLAYER).spell(SPELLS.ARCANE_BARRAGE),
      this.onBarrageCast,
    );
    this.addEventListener(
      Events.damage.by(SELECTED_PLAYER).spell(SPELLS.ARCANE_BARRAGE),
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
    return this.totalStacks / this.abilityTracker.getAbility(SPELLS.ARCANE_BARRAGE.id).casts;
  }

  get dpsIncrease() {
    const fight = this.owner.fight;
    const totalFightTime = fight.end_time - fight.start_time;

    return (this.bonusDamage / totalFightTime) * 1000;
  }

  statistic() {
    return (
      <Statistic
        category={STATISTIC_CATEGORY.TALENTS}
        size="flexible"
        tooltip="Arcane Harmony makes Arcane Barrage do extra damage with more stacks. Try to hold Arcane Barrage until you reach 20 stacks of Arcane Harmony. You can spam Arcane Missiles to build stacks during Hero/Bloodlust/Timewarp while standing in your Rune of Power before starting the Radiant Spark Ramp."
      >
        <BoringSpellValueText spell={SPELLS.ARCANE_HARMONY_BUFF}>
          {formatNumber(this.bonusDamage)} <small>Bonus Damage</small>
          <br />
          {formatNumber(this.dpsIncrease)} <small>DPS</small>
          <br />
          {formatNumber(this.averageStacks)} <small>Avg. stacks per Barrage</small>
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default ArcaneHarmony;
