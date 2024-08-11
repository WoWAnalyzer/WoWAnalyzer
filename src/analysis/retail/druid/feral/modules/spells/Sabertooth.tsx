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
import { FB_SPELLS, getBiteCps, SABERTOOTH_BOOSTED } from 'analysis/retail/druid/feral/constants';
import Enemies from 'parser/shared/modules/Enemies';

const FEROCIOUS_BITE_BOOST = 0.15;
const DOT_BOOST_PER_CP = 0.03;

const deps = {
  enemies: Enemies,
};

/**
 * **Sabertooth**
 * Spec Talent
 *
 * Ferocious Bite deals 15% increased damage. For each Combo Point spent, Ferocious Bite's primary
 * target takes 3% increased damage from your Cat Form bleed and other periodic abilities for 4 sec.
 */
class Sabertooth extends Analyzer.withDependencies(deps) {
  /** Damage due to the increase to Ferocious Bite */
  fbBoostDamage = 0;
  /** Damage due to the buff increase to Rip */
  dotBoostDamage = 0;

  /** Current boost from Sabertooth due to last FB */
  currentSbtStrength = 0;

  constructor(options: Options) {
    super(options);

    this.active = this.selectedCombatant.hasTalent(TALENTS_DRUID.SABERTOOTH_TALENT);
    this.addEventListener(Events.damage.by(SELECTED_PLAYER).spell(FB_SPELLS), this.onFbDamage);
    this.addEventListener(
      Events.damage.by(SELECTED_PLAYER).spell(SABERTOOTH_BOOSTED),
      this.onDotDamage,
    );
  }

  onFbDamage(event: DamageEvent) {
    this.fbBoostDamage += calculateEffectiveDamage(event, FEROCIOUS_BITE_BOOST);
    this.currentSbtStrength = getBiteCps(event) * DOT_BOOST_PER_CP;
  }

  onDotDamage(event: DamageEvent) {
    const target = this.deps.enemies.getEntity(event);
    if (target !== null && target.hasBuff(SPELLS.SABERTOOTH.id)) {
      this.dotBoostDamage += calculateEffectiveDamage(event, this.currentSbtStrength);
    }
  }

  get totalDamage() {
    return this.fbBoostDamage + this.dotBoostDamage;
  }

  statistic() {
    return (
      <Statistic
        position={STATISTIC_ORDER.OPTIONAL(3)} // number based on talent row
        size="flexible"
        category={STATISTIC_CATEGORY.TALENTS}
        tooltip={
          <>
            Breakdown by source:
            <ul>
              <li>
                <SpellLink spell={SPELLS.FEROCIOUS_BITE} />:{' '}
                <strong>{this.owner.formatItemDamageDone(this.fbBoostDamage)}</strong>
              </li>
              <li>
                DoTs: <strong>{this.owner.formatItemDamageDone(this.dotBoostDamage)}</strong>
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
