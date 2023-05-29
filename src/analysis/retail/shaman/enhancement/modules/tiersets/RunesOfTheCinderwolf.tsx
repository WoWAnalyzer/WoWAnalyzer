import SPELLS from 'common/SPELLS';
import { TALENTS_SHAMAN } from 'common/TALENTS';
import { formatNumber, formatPercentage } from 'common/format';
import MAGIC_SCHOOLS, { isMatchingDamageType } from 'game/MAGIC_SCHOOLS';
import { TIERS } from 'game/TIERS';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import { calculateEffectiveDamage } from 'parser/core/EventCalculateLib';
import Events, { DamageEvent } from 'parser/core/Events';
import BoringValue from 'parser/ui/BoringValueText';
import ItemDamageDone from 'parser/ui/ItemDamageDone';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';
import Statistic from 'parser/ui/Statistic';

class RunesOfTheCinderwolf extends Analyzer {
  protected extraDamage = 0;

  constructor(options: Options) {
    super(options);

    this.active = this.selectedCombatant.has4PieceByTier(TIERS.T30);
    if (!this.active) {
      return;
    }

    this.addEventListener(Events.damage.by(SELECTED_PLAYER), this.onDamage);
    this.addEventListener(
      Events.damage.by(SELECTED_PLAYER).spell(TALENTS_SHAMAN.CHAIN_LIGHTNING_TALENT),
      this.onChainLightning,
    );
  }

  get extraDamagePercentage() {
    return this.owner.getPercentageOfTotalDamageDone(this.extraDamage);
  }

  get totalExtraDps() {
    return this.extraDamage / (this.owner.fightDuration / 1000);
  }

  onDamage(event: DamageEvent) {
    if (
      this.selectedCombatant.hasBuff(SPELLS.VOLCANIC_STRENGTH_TIER_BUFF.id) &&
      (isMatchingDamageType(event.ability.type, MAGIC_SCHOOLS.ids.PHYSICAL) ||
        isMatchingDamageType(event.ability.type, MAGIC_SCHOOLS.ids.PHYSICAL))
    ) {
      this.extraDamage += calculateEffectiveDamage(event, 0.2);
    }
  }

  onChainLightning(event: DamageEvent) {
    if (this.selectedCombatant.hasBuff(SPELLS.CRACKLING_THUNDER_TIER_BUFF.id)) {
      this.extraDamage += calculateEffectiveDamage(event, 1);
    }
  }

  statistic() {
    return (
      <Statistic
        position={STATISTIC_ORDER.CORE()}
        category={STATISTIC_CATEGORY.ITEMS}
        size="flexible"
        tooltip={
          <>
            {formatNumber(this.totalExtraDps)} dps gained (
            {formatPercentage(this.extraDamagePercentage)} % of total)
          </>
        }
      >
        <BoringValue label="Runes of the Cinderwolf">
          <ItemDamageDone amount={this.extraDamage} />
        </BoringValue>
      </Statistic>
    );
  }
}

export default RunesOfTheCinderwolf;
