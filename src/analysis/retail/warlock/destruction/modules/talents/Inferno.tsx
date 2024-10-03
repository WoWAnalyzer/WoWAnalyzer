import { formatThousands } from 'common/format';
import SPELLS from 'common/SPELLS';
import TALENTS from 'common/TALENTS/warlock';
import Analyzer, { Options } from 'parser/core/Analyzer';
import AbilityTracker from 'parser/shared/modules/AbilityTracker';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';

import RainOfFire from '../features/RainOfFire';
import SoulShardTracker from '../soulshards/SoulShardTracker';

const FRAGMENTS_PER_CHAOS_BOLT = 20;
const FRAGMENTS_PER_RAIN_OF_FIRE = 30;

/*
    Inferno (Tier 60 Destruction talent):
      Rain of Fire damage has a 20% chance to generate a Soul Shard Fragment.
 */
class Inferno extends Analyzer {
  get averageRainOfFireDamage() {
    // Rain of Fire has different spellId for cast and damage but AbilityTracker picks up both of them
    const rofDamage = this.abilityTracker.getAbility(SPELLS.RAIN_OF_FIRE_DAMAGE.id);
    const rofCast = this.abilityTracker.getAbility(SPELLS.RAIN_OF_FIRE_CAST.id);
    return rofDamage.damageVal.effective / rofCast.casts || 0;
  }

  get averageChaosBoltDamage() {
    const chaosBolt = this.abilityTracker.getAbility(SPELLS.CHAOS_BOLT.id);
    return chaosBolt.damageVal.effective / chaosBolt.casts || 0;
  }

  static dependencies = {
    rainOfFire: RainOfFire,
    soulShardTracker: SoulShardTracker,
    abilityTracker: AbilityTracker,
  };

  protected rainOfFire!: RainOfFire;
  protected soulShardTracker!: SoulShardTracker;
  protected abilityTracker!: AbilityTracker;

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(TALENTS.INFERNO_TALENT);
  }

  statistic() {
    // ESTIMATED fragments from Rain of Fire, see comments in SoulShardTracker._getRandomFragmentDistribution()
    const fragments = this.soulShardTracker.getGeneratedBySpell(SPELLS.RAIN_OF_FIRE_DAMAGE.id);
    const estimatedRofDamage =
      Math.floor(fragments / FRAGMENTS_PER_RAIN_OF_FIRE) * this.averageRainOfFireDamage;
    const estimatedChaosBoltDamage =
      Math.floor(fragments / FRAGMENTS_PER_CHAOS_BOLT) * this.averageChaosBoltDamage;
    return (
      <Statistic
        category={STATISTIC_CATEGORY.TALENTS}
        size="small"
        tooltip={
          <>
            While majority of sources of Soul Shard Fragments are certain, chance based sources
            (Inferno and Immolate crits) make tracking the fragments 100% correctly impossible
            (Fragment generation is NOT in logs).
            <br />
            <br />
            If you used all these bonus fragments on Chaos Bolts, they would do{' '}
            {formatThousands(estimatedChaosBoltDamage)} damage (
            {this.owner.formatItemDamageDone(estimatedChaosBoltDamage)}).
            <br />
            If you used them on Rain of Fires, they would do {formatThousands(
              estimatedRofDamage,
            )}{' '}
            damage ({this.owner.formatItemDamageDone(estimatedRofDamage)}){' '}
            <strong>
              assuming an average of {this.rainOfFire.averageTargetsHit.toFixed(2)} targets
            </strong>
            .<br />
            Both of these estimates are based on average damage of respective spells during the
            fight.
          </>
        }
      >
        <BoringSpellValueText spell={TALENTS.INFERNO_TALENT}>
          {fragments}{' '}
          <small>
            <strong>estimated</strong> bonus Fragments
          </small>
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default Inferno;
