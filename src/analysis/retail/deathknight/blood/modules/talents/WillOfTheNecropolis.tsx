import { formatNumber } from 'common/format';
import TALENTS from 'common/TALENTS/deathknight';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { AbsorbedEvent, DamageEvent, HealEvent } from 'parser/core/Events';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import ItemHealingDone from 'parser/ui/ItemHealingDone';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';

const MINIMUM_ABSORB_THRESHOLD = 0.05;

class WillOfTheNecropolis extends Analyzer {
  totalWotnAbsorbed = 0;
  currentWotnAbsorbed = 0;
  activated = 0;
  spellDamageId = 0;
  goodAbsorbCount = 0;
  nextEvent = false;
  lastMaxHP = 0;

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(TALENTS.WILL_OF_THE_NECROPOLIS_TALENT);

    if (!this.active) {
      return;
    }

    this.addEventListener(
      Events.absorbed.by(SELECTED_PLAYER).spell(TALENTS.WILL_OF_THE_NECROPOLIS_TALENT),
      this.onAbsorbed,
    );
    this.addEventListener(Events.heal.to(SELECTED_PLAYER), this.onHealReceived);
    this.addEventListener(Events.damage.to(SELECTED_PLAYER), this.onDamageTaken);
  }

  onAbsorbed(event: AbsorbedEvent) {
    this.totalWotnAbsorbed += event.amount;
    this.currentWotnAbsorbed = event.amount;
    this.activated += 1;
    this.spellDamageId = event.extraAbility.guid;
    this.nextEvent = true;
  }

  onHealReceived(event: HealEvent) {
    this.lastMaxHP = event.maxHitPoints || this.lastMaxHP;
  }

  onDamageTaken(event: DamageEvent) {
    const spellId = event.ability.guid;
    if (spellId !== this.spellDamageId || this.nextEvent === false) {
      return;
    }
    this.nextEvent = false;
    if (!event.maxHitPoints && !this.lastMaxHP) {
      return;
    }
    this.lastMaxHP = event.maxHitPoints || this.lastMaxHP;
    const absorbToHealthPercent = this.currentWotnAbsorbed / this.lastMaxHP;
    if (absorbToHealthPercent > MINIMUM_ABSORB_THRESHOLD) {
      this.goodAbsorbCount += 1;
    }
  }

  statistic() {
    return (
      <Statistic
        position={STATISTIC_ORDER.OPTIONAL(2)}
        category={STATISTIC_CATEGORY.TALENTS}
        size="flexible"
        tooltip={
          <>
            <strong>Total Damage Absorbed: </strong> {formatNumber(this.totalWotnAbsorbed)} <br />
            <strong>Activated: </strong> {this.activated}
            <br />
            <strong>Absorbed 5% Max Health or more count: </strong> {this.goodAbsorbCount}
          </>
        }
      >
        <BoringSpellValueText spell={TALENTS.WILL_OF_THE_NECROPOLIS_TALENT}>
          <ItemHealingDone amount={this.totalWotnAbsorbed} />
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default WillOfTheNecropolis;
