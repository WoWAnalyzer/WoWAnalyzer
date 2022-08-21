import { Trans } from '@lingui/macro';
import { formatNumber } from 'common/format';
import SPELLS from 'common/SPELLS';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { AbsorbedEvent, DamageEvent } from 'parser/core/Events';
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

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(SPELLS.WILL_OF_THE_NECROPOLIS_TALENT.id);

    if (!this.active) {
      return;
    }

    this.addEventListener(
      Events.absorbed.by(SELECTED_PLAYER).spell(SPELLS.WILL_OF_THE_NECROPOLIS_TALENT),
      this.onAbsorbed,
    );
    this.addEventListener(Events.damage.to(SELECTED_PLAYER), this.onDamageTaken);
  }

  onAbsorbed(event: AbsorbedEvent) {
    this.totalWotnAbsorbed += event.amount;
    this.currentWotnAbsorbed = event.amount;
    this.activated += 1;
    this.spellDamageId = event.extraAbility.guid;
    this.nextEvent = true;
  }

  onDamageTaken(event: DamageEvent) {
    const spellId = event.ability.guid;
    if (spellId !== this.spellDamageId || this.nextEvent === false) {
      return;
    }
    this.nextEvent = false;
    if (!event.maxHitPoints) {
      return;
    }
    const playerHealth = event.maxHitPoints;
    const absorbToHealthPercent = this.currentWotnAbsorbed / playerHealth;
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
          <Trans id="deathknight.blood.willOfTheNecropolis.statistic.tooltip">
            <strong>Total Damage Absorbed: </strong> {formatNumber(this.totalWotnAbsorbed)} <br />
            <strong>Activated: </strong> {this.activated}
            <br />
            <strong>Absorbed 5% Max Health or more count: </strong> {this.goodAbsorbCount}
          </Trans>
        }
      >
        <BoringSpellValueText spellId={SPELLS.WILL_OF_THE_NECROPOLIS_TALENT.id}>
          <ItemHealingDone amount={this.totalWotnAbsorbed} />
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default WillOfTheNecropolis;
