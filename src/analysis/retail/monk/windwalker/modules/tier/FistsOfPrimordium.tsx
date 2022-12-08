import { formatNumber, formatPercentage } from 'common/format';
import SPELLS from 'common/SPELLS';
import { SpellLink } from 'interface';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import { calculateEffectiveDamage } from 'parser/core/EventCalculateLib';
import Events, { DamageEvent } from 'parser/core/Events';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import ItemDamageDone from 'parser/ui/ItemDamageDone';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';
import { TIERS } from 'game/TIERS';

/** _Increases Fists of Fury damage by 40%_ */
const FOF_INCREASE = 0.4;

/** Monk Tier 28 "Garb of the Grand Upwelling" 2-Set Bonus */
class FistsOfPrimordium extends Analyzer {
  totalDamage = 0;

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.has2PieceByTier(TIERS.T28);
    if (!this.active) {
      return;
    }
    this.addEventListener(
      Events.damage.by(SELECTED_PLAYER).spell(SPELLS.FISTS_OF_FURY_DAMAGE),
      this.onFistsDamage,
    );
  }

  onFistsDamage(event: DamageEvent) {
    this.totalDamage += calculateEffectiveDamage(event, FOF_INCREASE);
  }

  statistic() {
    return (
      <Statistic
        position={STATISTIC_ORDER.OPTIONAL(1)}
        size="flexible"
        category={STATISTIC_CATEGORY.ITEMS}
        tooltip={
          <>
            The {formatPercentage(FOF_INCREASE, 0)}% increase to{' '}
            <SpellLink id={SPELLS.FISTS_OF_FURY_CAST.id} /> from the 2-set bonus,{' '}
            <SpellLink id={SPELLS.FISTS_OF_PRIMORDIUM.id} />, was worth{' '}
            {formatNumber(this.totalDamage)} raw damage.
          </>
        }
      >
        <BoringSpellValueText spellId={SPELLS.FISTS_OF_PRIMORDIUM.id}>
          <ItemDamageDone amount={this.totalDamage} />
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default FistsOfPrimordium;
