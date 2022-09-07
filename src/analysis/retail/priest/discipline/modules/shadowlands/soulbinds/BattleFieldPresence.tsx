import AtonementAnalyzer, {
  AtonementAnalyzerEvent,
} from 'analysis/retail/priest/discipline/modules/core/AtonementAnalyzer';
import SPELLS from 'common/SPELLS';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import { calculateEffectiveDamage, calculateEffectiveHealing } from 'parser/core/EventCalculateLib';
import Events, { HealEvent, DamageEvent } from 'parser/core/Events';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import ItemDamageDone from 'parser/ui/ItemDamageDone';
import ItemHealingDone from 'parser/ui/ItemHealingDone';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';

class BattlefieldPresence extends Analyzer {
  healing = 0;
  damage = 0;
  constructor(options: Options) {
    super(options);

    this.active = this.selectedCombatant.hasSoulbindTrait(SPELLS.BATTLEFIELD_PRESENCE_TRAIT.id);
    if (!this.active) {
      return;
    }

    this.addEventListener(AtonementAnalyzer.atonementEventFilter, this.handleAtone);
    this.addEventListener(Events.heal.by(SELECTED_PLAYER), this.onHeal);
    this.addEventListener(Events.damage.by(SELECTED_PLAYER), this.onDamage);
  }

  handleAtone(event: AtonementAnalyzerEvent) {
    if (
      !('absorb' in event.healEvent) ||
      !this.selectedCombatant.hasBuff(SPELLS.BATTLEFIELD_PRESENCE.id)
    ) {
      // ignoring spirit shell
      return;
    }
    const percentageIncrease =
      this.selectedCombatant.getBuffStacks(SPELLS.BATTLEFIELD_PRESENCE.id) / 100;
    this.healing += calculateEffectiveHealing(event.healEvent, percentageIncrease);
  }

  onHeal(event: HealEvent) {
    if (
      event.ability.guid === SPELLS.ATONEMENT_HEAL_CRIT.id ||
      event.ability.guid === SPELLS.ATONEMENT_HEAL_NON_CRIT.id ||
      !this.selectedCombatant.hasBuff(SPELLS.BATTLEFIELD_PRESENCE.id)
    ) {
      return;
    }
    const percentageIncrease =
      this.selectedCombatant.getBuffStacks(SPELLS.BATTLEFIELD_PRESENCE.id) / 100;
    this.healing += calculateEffectiveHealing(event, percentageIncrease);
  }

  onDamage(event: DamageEvent) {
    if (!this.selectedCombatant.hasBuff(SPELLS.BATTLEFIELD_PRESENCE.id)) {
      return;
    }
    const percentageIncrease =
      this.selectedCombatant.getBuffStacks(SPELLS.BATTLEFIELD_PRESENCE.id) / 100;
    this.damage += calculateEffectiveDamage(event, percentageIncrease);
  }

  statistic() {
    return (
      <Statistic
        position={STATISTIC_ORDER.OPTIONAL(13)}
        size="flexible"
        category={STATISTIC_CATEGORY.COVENANTS}
      >
        <>
          <BoringSpellValueText spellId={SPELLS.BATTLEFIELD_PRESENCE.id}>
            <ItemHealingDone amount={this.healing} /> <br />
            <ItemDamageDone amount={this.damage} />
          </BoringSpellValueText>
        </>
      </Statistic>
    );
  }
}

export default BattlefieldPresence;
