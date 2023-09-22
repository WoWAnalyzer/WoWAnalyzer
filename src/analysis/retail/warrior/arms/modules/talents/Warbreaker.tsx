import { formatPercentage, formatThousands } from 'common/format';
import SPELLS from 'common/SPELLS';
import TALENTS from 'common/TALENTS/warrior';
import { SpellLink } from 'interface';
import Analyzer, { SELECTED_PLAYER, Options } from 'parser/core/Analyzer';
import { calculateEffectiveDamage } from 'parser/core/EventCalculateLib';
import Events, { DamageEvent } from 'parser/core/Events';
import Enemies from 'parser/shared/modules/Enemies';
import StatisticListBoxItem from 'parser/ui/StatisticListBoxItem';

/**
 * Smash the ground and shatter the armor of all enemies within 8 yds,
 * dealing [ 150% of Attack Power ] Physical damage and increasing damage
 * you deal to them by 30% for 10 sec.
 */

const WARBREAKER_BONUS_DAMAGES = 0.3;

class Warbreaker extends Analyzer {
  get dps() {
    return (this.totalDamages / this.owner.fightDuration) * 1000;
  }

  static dependencies = {
    enemies: Enemies,
  };

  protected enemies!: Enemies;

  totalDamages = 0;

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(TALENTS.WARBREAKER_TALENT);
    this.addEventListener(Events.damage.by(SELECTED_PLAYER), this._onDamage);
  }

  _onDamage(event: DamageEvent) {
    if (event.targetIsFriendly) {
      return;
    }
    if (event.ability.guid === TALENTS.WARBREAKER_TALENT.id) {
      this.totalDamages += (event.amount || 0) + (event.absorbed || 0);
    }
    const target = this.enemies.getEntity(event);
    if (target !== null && target.hasBuff(SPELLS.COLOSSUS_SMASH_DEBUFF.id, event.timestamp)) {
      this.totalDamages += calculateEffectiveDamage(event, WARBREAKER_BONUS_DAMAGES);
    }
  }

  subStatistic() {
    return (
      <StatisticListBoxItem
        title={
          <>
            <SpellLink spell={TALENTS.WARBREAKER_TALENT} /> bonus damage
          </>
        }
        value={`${formatThousands(this.dps)} DPS`}
        valueTooltip={
          <>
            Your Warbreaker contributed {formatThousands(this.totalDamages)} total damage (
            {formatPercentage(this.owner.getPercentageOfTotalDamageDone(this.totalDamages))} %).
            <br />
            This accounts for the damage dealt by Warbreaker and the 30% increased damage from
            Colossus Smash debuff.
          </>
        }
      />
    );
  }
}

export default Warbreaker;
