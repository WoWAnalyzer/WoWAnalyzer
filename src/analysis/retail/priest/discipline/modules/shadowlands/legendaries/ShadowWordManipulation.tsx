import AtonementAnalyzer, {
  AtonementAnalyzerEvent,
} from 'analysis/retail/priest/discipline/modules/core/AtonementAnalyzer';
import SPELLS from 'common/SPELLS';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, {
  ApplyBuffStackEvent,
  RemoveBuffEvent,
  DamageEvent,
  HealEvent,
} from 'parser/core/Events';
import StatTracker from 'parser/shared/modules/StatTracker';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import ItemDamageDone from 'parser/ui/ItemDamageDone';
import ItemHealingDone from 'parser/ui/ItemHealingDone';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';

const nonCritHeals = [
  SPELLS.MINDGAMES_HEAL.id,
  SPELLS.MINDGAMES_ABSORB.id,
  SPELLS.TOKEN_OF_APPRECIATION.id,
];

class ShadowWordManipulation extends Analyzer {
  protected statTracker!: StatTracker;

  static dependencies = {
    statTracker: StatTracker,
  };

  healing = 0;
  damage = 0;
  swmBuffActive = false;
  stacks = 0;
  totalCritPercentage = 0;

  constructor(options: Options) {
    super(options);

    this.active = this.selectedCombatant.hasLegendary(SPELLS.SHADOW_WORD_MANIPULATION);
    if (!this.active) {
      return;
    }

    this.addEventListener(
      Events.applybuffstack.spell(SPELLS.SHADOW_WORD_MANIPULATION_BUFF).by(SELECTED_PLAYER),
      this.swmBuffed,
    );

    this.addEventListener(
      Events.removebuff.spell(SPELLS.SHADOW_WORD_MANIPULATION_BUFF).by(SELECTED_PLAYER),
      this.swmRemoved,
    );

    this.addEventListener(AtonementAnalyzer.atonementEventFilter, this.handleAtone);
    this.addEventListener(Events.damage.by(SELECTED_PLAYER), this.onDamage);
    this.addEventListener(Events.heal.by(SELECTED_PLAYER), this.onHeal);
  }
  swmBuffed(event: ApplyBuffStackEvent) {
    this.swmBuffActive = true;
    this.stacks = event.stack;
  }

  swmRemoved(event: RemoveBuffEvent) {
    this.swmBuffActive = false;
    this.stacks = 0;
  }

  handleAtone(event: AtonementAnalyzerEvent) {
    if (!('absorb' in event.healEvent) || !this.swmBuffActive) {
      // ignoring spirit shell
      return;
    }
    const bonusCrit = this.stacks * 0.05;
    const effectiveHealing = event.healEvent.amount + (event.healEvent.absorbed || 0);
    const totalHealing = effectiveHealing + (event.healEvent.overheal || 0); // raw heal
    const swmHeal =
      totalHealing -
      (totalHealing / (1 + this.statTracker.currentCritPercentage + bonusCrit)) *
        (this.statTracker.currentCritPercentage + 1);
    const effectiveSwmHeal = swmHeal - (event.healEvent.overheal || 0);
    if (effectiveSwmHeal < 0) {
      return;
    }
    this.healing += effectiveSwmHeal;
  }

  onHeal(event: HealEvent) {
    if (
      !this.swmBuffActive ||
      event.ability.guid === SPELLS.ATONEMENT_HEAL_CRIT.id ||
      event.ability.guid === SPELLS.ATONEMENT_HEAL_NON_CRIT.id ||
      nonCritHeals.includes(event.ability.guid)
    ) {
      return;
    }

    const bonusCrit = this.stacks * 0.05;
    const effectiveHealing = event.amount + (event.absorbed || 0);
    const totalHealing = effectiveHealing + (event.overheal || 0);
    const swmHeal =
      totalHealing -
      (totalHealing / (1 + this.statTracker.currentCritPercentage + bonusCrit)) *
        (this.statTracker.currentCritPercentage + 1);
    const effectiveSwmHeal = swmHeal - (event.overheal || 0);
    if (effectiveSwmHeal < 0) {
      return;
    }
    this.healing += effectiveSwmHeal;
  }

  onDamage(event: DamageEvent) {
    if (!this.swmBuffActive) {
      return;
    }
    const bonusCrit = this.stacks * 0.05;
    const damage = event.amount;
    const swmDamage =
      event.amount -
      (damage / (1 + this.statTracker.currentCritPercentage + bonusCrit)) *
        (this.statTracker.currentCritPercentage + 1);
    this.damage += swmDamage;
  }

  statistic() {
    return (
      <Statistic
        position={STATISTIC_ORDER.OPTIONAL(13)}
        size="flexible"
        category={STATISTIC_CATEGORY.ITEMS}
      >
        <>
          <BoringSpellValueText spellId={SPELLS.SHADOW_WORD_MANIPULATION.id}>
            <ItemHealingDone amount={this.healing} /> <br />
            <ItemDamageDone amount={this.damage} />
          </BoringSpellValueText>
        </>
      </Statistic>
    );
  }
}

export default ShadowWordManipulation;
