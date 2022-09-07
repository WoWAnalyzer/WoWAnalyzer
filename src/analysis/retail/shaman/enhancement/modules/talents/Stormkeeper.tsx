import { formatNumber, formatPercentage } from 'common/format';
import SPELLS from 'common/SPELLS';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { DamageEvent } from 'parser/core/Events';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import ItemDamageDone from 'parser/ui/ItemDamageDone';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';

const AFFECTED_SPELLS = [
  SPELLS.LIGHTNING_BOLT_OVERLOAD,
  SPELLS.LIGHTNING_BOLT,
  SPELLS.CHAIN_LIGHTNING_OVERLOAD,
  SPELLS.CHAIN_LIGHTNING,
];

/**
 * Charge yourself with lightning, causing your next 2 Lightning Bolts
 * or Chain Lightnings to deal 150% more damage and be instant cast.
 *
 * Example Log:
 *
 */
class Stormkeeper extends Analyzer {
  protected damageDoneByBuffedCasts: number = 0;

  constructor(options: Options) {
    super(options);

    this.active = this.selectedCombatant.hasTalent(SPELLS.STORMKEEPER_TALENT_ENHANCEMENT.id);

    AFFECTED_SPELLS.forEach((affectedSpell) => {
      this.addEventListener(
        Events.damage.by(SELECTED_PLAYER).spell(affectedSpell),
        this.onSpellDamage,
      );
    });
  }

  get damagePercent() {
    return this.owner.getPercentageOfTotalDamageDone(this.damageDoneByBuffedCasts);
  }

  get damagePerSecond() {
    return this.damageDoneByBuffedCasts / (this.owner.fightDuration / 1000);
  }

  onSpellDamage(event: DamageEvent) {
    if (!this.selectedCombatant.hasBuff(SPELLS.STORMKEEPER_TALENT_ENHANCEMENT.id)) {
      return;
    }

    this.damageDoneByBuffedCasts += event.amount;
  }

  statistic() {
    return (
      <Statistic
        position={STATISTIC_ORDER.OPTIONAL()}
        category={STATISTIC_CATEGORY.TALENTS}
        size="flexible"
        tooltip={`Buffed casts contributed ${formatNumber(
          this.damageDoneByBuffedCasts,
        )} damage (${formatPercentage(this.damagePercent)}% of your damage)`}
      >
        <BoringSpellValueText spellId={SPELLS.STORMKEEPER_TALENT_ENHANCEMENT.id}>
          <>
            <ItemDamageDone amount={this.damageDoneByBuffedCasts} />
            <br />
          </>
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default Stormkeeper;
