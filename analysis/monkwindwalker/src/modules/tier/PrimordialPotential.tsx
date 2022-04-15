import { formatNumber, formatPercentage } from 'common/format';
import { MONK_TIER_ID } from 'common/ITEMS/shadowlands';
import SPELLS from 'common/SPELLS';
import { SpellLink } from 'interface';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import calculateEffectiveDamage from 'parser/core/calculateEffectiveDamage';
import Events, { DamageEvent } from 'parser/core/Events';
import AbilityTracker from 'parser/shared/modules/AbilityTracker';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import ItemDamageDone from 'parser/ui/ItemDamageDone';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';

import { DAMAGE_AFFECTED_BY_PRIMORDIAL_POWER } from '../../constants';

/** _After 10 offensive abilities, your next 3 offensive abilities deal an additional 22% damage._ */
const PP_MOD = 0.22;

/** Monk Tier 28 "Garb of the Grand Upwelling" 4-Set Bonus for Windwalker */
class PrimordialPotential extends Analyzer {
  static dependencies = {
    abilityTracker: AbilityTracker,
  };
  protected abilityTracker!: AbilityTracker;

  totalDamage = 0;

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.has4Piece(MONK_TIER_ID);
    if (!this.active) {
      return;
    }

    this.addEventListener(
      Events.damage.by(SELECTED_PLAYER).spell(DAMAGE_AFFECTED_BY_PRIMORDIAL_POWER),
      this.onDamage,
    );
  }

  onDamage(event: DamageEvent) {
    if (!this.selectedCombatant.hasBuff(SPELLS.PRIMORDIAL_POWER_BUFF.id)) {
      return;
    }

    this.totalDamage += calculateEffectiveDamage(event, PP_MOD);
  }

  statistic() {
    return (
      <Statistic
        position={STATISTIC_ORDER.OPTIONAL(2)}
        size="flexible"
        category={STATISTIC_CATEGORY.ITEMS}
        tooltip={
          <>
            The {formatPercentage(PP_MOD, 0)}% increase from the 4-set bonus,{' '}
            <SpellLink id={SPELLS.PRIMORDIAL_POTENTIAL.id} />, was worth{' '}
            {formatNumber(this.totalDamage)} raw damage.
          </>
        }
      >
        <BoringSpellValueText spellId={SPELLS.PRIMORDIAL_POTENTIAL.id}>
          <ItemDamageDone amount={this.totalDamage} />
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default PrimordialPotential;
