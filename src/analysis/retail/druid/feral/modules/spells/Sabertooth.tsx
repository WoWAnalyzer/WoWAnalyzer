import Analyzer, { SELECTED_PLAYER } from 'parser/core/Analyzer';
import { Options } from 'parser/core/Module';
import { TALENTS_DRUID } from 'common/TALENTS';
import SPELLS from 'common/SPELLS';
import Events, { DamageEvent } from 'parser/core/Events';
import { calculateEffectiveDamage } from 'parser/core/EventCalculateLib';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import ItemPercentDamageDone from 'parser/ui/ItemPercentDamageDone';
import { SpellLink } from 'interface';
import { formatPercentage } from 'common/format';
import { getBiteCps } from 'analysis/retail/druid/feral/constants';

const FEROCIOUS_BITE_BOOST = 0.15;
const RIP_BOOST_PER_CP = 0.05;

// TODO is there a Tear Open Wounds interaction with this talent? Check with theorycrafters
/**
 * **Sabertooth**
 * Spec Talent
 *
 * Ferocious Bite deals 15% increased damage and increases all damage dealt by Rip by 5% per
 * Combo Point spent for 4 sec.
 */
class Sabertooth extends Analyzer {
  /** Damage due to the increase to Ferocious Bite */
  fbBoostDamage = 0;
  /** Damage due to the increase to Rampant Ferocity (same as bite boost because it's a percent of bite damage) */
  rfBoostDamage = 0;
  /** Damage due to the buff increase to Rip */
  ripBoostDamage = 0;

  /** Total ticks of Rip */
  totalRipTicks = 0;
  /** Ticks of Rip that were boosted by Sabertooth */
  boostedRipTicks = 0;

  /** Current boost from Sabertooth due to last FB */
  currentSbtStrength = 0;

  constructor(options: Options) {
    super(options);

    this.active = this.selectedCombatant.hasTalent(TALENTS_DRUID.SABERTOOTH_TALENT);
    this.addEventListener(
      Events.damage.by(SELECTED_PLAYER).spell(SPELLS.FEROCIOUS_BITE),
      this.onFbDamage,
    );
    this.addEventListener(
      Events.damage.by(SELECTED_PLAYER).spell(SPELLS.RAMPANT_FEROCITY),
      this.onRfDamage,
    );
    this.addEventListener(Events.damage.by(SELECTED_PLAYER).spell(SPELLS.RIP), this.onRipDamage);
  }

  onFbDamage(event: DamageEvent) {
    this.fbBoostDamage += calculateEffectiveDamage(event, FEROCIOUS_BITE_BOOST);
    this.currentSbtStrength = getBiteCps(event) * RIP_BOOST_PER_CP;
  }

  onRfDamage(event: DamageEvent) {
    this.rfBoostDamage += calculateEffectiveDamage(event, FEROCIOUS_BITE_BOOST);
  }

  onRipDamage(event: DamageEvent) {
    this.totalRipTicks += 1;
    if (this.selectedCombatant.hasBuff(SPELLS.SABERTOOTH.id)) {
      this.boostedRipTicks += 1;
      this.ripBoostDamage += calculateEffectiveDamage(event, this.currentSbtStrength);
    }
  }

  get totalDamage() {
    return this.fbBoostDamage + this.ripBoostDamage;
  }

  get percentBoostedRipTicks() {
    return this.totalRipTicks === 0 ? 0 : this.boostedRipTicks / this.totalRipTicks;
  }

  statistic() {
    const hasRf = this.selectedCombatant.hasTalent(TALENTS_DRUID.RAMPANT_FEROCITY_TALENT);
    return (
      <Statistic
        position={STATISTIC_ORDER.OPTIONAL(3)} // number based on talent row
        size="flexible"
        category={STATISTIC_CATEGORY.TALENTS}
        tooltip={
          <>
            Percent boosted <SpellLink spell={SPELLS.RIP} /> ticks:{' '}
            <strong>{formatPercentage(this.percentBoostedRipTicks, 1)}%</strong>
            <br />
            Breakdown by source:
            <ul>
              <li>
                <SpellLink spell={SPELLS.FEROCIOUS_BITE} />:{' '}
                <strong>{this.owner.formatItemDamageDone(this.fbBoostDamage)}</strong>
              </li>
              {hasRf && (
                <li>
                  <SpellLink spell={TALENTS_DRUID.RAMPANT_FEROCITY_TALENT} />:{' '}
                  <strong>{this.owner.formatItemDamageDone(this.rfBoostDamage)}</strong>
                </li>
              )}
              <li>
                <SpellLink spell={SPELLS.RIP} />:{' '}
                <strong>{this.owner.formatItemDamageDone(this.ripBoostDamage)}</strong>
              </li>
            </ul>
          </>
        }
      >
        <BoringSpellValueText spell={TALENTS_DRUID.SABERTOOTH_TALENT}>
          <ItemPercentDamageDone amount={this.totalDamage} />
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default Sabertooth;
