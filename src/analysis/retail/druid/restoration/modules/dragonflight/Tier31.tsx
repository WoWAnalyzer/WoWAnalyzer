import Analyzer from 'parser/core/Analyzer';
import { Options } from 'parser/core/Module';
import { TIERS } from 'game/TIERS';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import ItemSetLink from 'interface/ItemSetLink';
import { DRUID_T31_ID } from 'common/ITEMS/dragonflight';
import ItemPercentHealingDone from 'parser/ui/ItemPercentHealingDone';
import AbilityTracker from 'parser/shared/modules/AbilityTracker';
import SPELLS from 'common/SPELLS';
import { TALENTS_DRUID } from 'common/TALENTS';

const deps = {
  abilityTracker: AbilityTracker,
};

export default class Tier31 extends Analyzer.withDependencies(deps) {
  has4pc: boolean;

  constructor(options: Options) {
    super(options);

    // the calculations here only work if player doesn't take Nourish
    // Nourish should never be picked in current state (choice w/ GG), so we'll just disable when Nourish picked
    // instead of wasting the time trying to handle the case
    this.active =
      this.selectedCombatant.has2PieceByTier(TIERS.T31) &&
      !this.selectedCombatant.hasTalent(TALENTS_DRUID.NOURISH_TALENT);
    this.has4pc = this.selectedCombatant.has4PieceByTier(TIERS.T31);
  }

  get total2pcHealing() {
    return this.deps.abilityTracker.getAbility(SPELLS.T31_TREANT_CLEAVE_NOURISH.id)
      .healingEffective;
  }

  get total4pcHealing() {
    return (
      this.deps.abilityTracker.getAbility(SPELLS.T31_CAST_CLEAVE_NOURISH.id).healingEffective +
      this.deps.abilityTracker.getAbility(TALENTS_DRUID.NOURISH_TALENT.id).healingEffective
    );
  }

  statistic() {
    return (
      <Statistic
        size="flexible"
        position={STATISTIC_ORDER.OPTIONAL(0)}
        category={STATISTIC_CATEGORY.ITEMS}
        tooltip={
          this.has4pc ? (
            <>
              2pc healing number includes only the 'Nourish cleaves' from Treant and hardcast
              Nourishes.
              <br />
              4pc healing counts the Clearcast Nourishes AND the cleaves from those Nourishes.
            </>
          ) : undefined
        }
      >
        <div className="pad boring-text">
          <label>
            <ItemSetLink id={DRUID_T31_ID}>
              <>
                Benevolent Embersage's Guidance
                <br />
                (Amirdrassil Tier)
              </>
            </ItemSetLink>
          </label>
          <div className="value">
            2pc: <ItemPercentHealingDone amount={this.total2pcHealing} />
          </div>
          {this.has4pc && (
            <>
              <div className="value">
                4pc: <ItemPercentHealingDone amount={this.total4pcHealing} />
              </div>
            </>
          )}
        </div>
      </Statistic>
    );
  }
}
