import { formatPercentage, formatThousands } from 'common/format';
import SPELLS from 'common/SPELLS';
import TALENTS from 'common/TALENTS/warlock';
import Analyzer, { Options } from 'parser/core/Analyzer';
import AbilityTracker from 'parser/shared/modules/AbilityTracker';
import { findMax, binomialPMF } from 'parser/shared/modules/helpers/Probability';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import TalentSpellText from 'parser/ui/TalentSpellText';

import SoulShardTracker from '../soulshards/SoulShardTracker';

const FRAGMENTS_PER_SHARD = 10;
const SC_PROC_CHANCE_BASE = 0.05;

class SoulConduit extends Analyzer {
  get averageChaosBoltDamage() {
    return this.abilityTracker.getAbilityDamagePerCast(SPELLS.CHAOS_BOLT.id);
  }

  static dependencies = {
    soulShardTracker: SoulShardTracker,
    abilityTracker: AbilityTracker,
  };

  protected soulShardTracker!: SoulShardTracker;
  protected abilityTracker!: AbilityTracker;

  SC_PROC_CHANCE =
    SC_PROC_CHANCE_BASE * this.selectedCombatant.getTalentRank(TALENTS.SOUL_CONDUIT_TALENT);

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(TALENTS.SOUL_CONDUIT_TALENT);
  }

  statistic() {
    const generatedShards =
      this.soulShardTracker.getGeneratedBySpell(SPELLS.SOUL_CONDUIT_SHARD_GEN.id) /
      FRAGMENTS_PER_SHARD;
    const estimatedDamage = Math.floor(generatedShards / 2) * this.averageChaosBoltDamage; // Chaos Bolt costs 2 shards to cast
    const totalSpent = this.soulShardTracker.spent / FRAGMENTS_PER_SHARD; // Destruction Soul Shard Tracker tracks fragments (10 fragments per shard)
    // find number of Shards we were MOST LIKELY to get in the fight
    const { max } = findMax(totalSpent, (k, n) => binomialPMF(k, n, this.SC_PROC_CHANCE));
    return (
      <Statistic
        category={STATISTIC_CATEGORY.TALENTS}
        size="small"
        tooltip={
          <>
            You gained {generatedShards} Shards from this talent,{' '}
            {max > 0 ? (
              <>
                which is <strong>{formatPercentage(generatedShards / max)}%</strong> of Shards you
                were most likely to get in this fight ({max} Shards)
              </>
            ) : (
              ', while you were most likely to not get any Shards'
            )}
            .<br />
            Estimated damage: {formatThousands(estimatedDamage)} (
            {this.owner.formatItemDamageDone(estimatedDamage)}).
            <br />
            <br />
            This result is estimated by multiplying average Chaos Bolt damage by potential casts you
            would get from these bonus Shards.
          </>
        }
      >
        <TalentSpellText talent={TALENTS.SOUL_CONDUIT_TALENT}>
          {generatedShards} <small>generated Shards</small>
        </TalentSpellText>
      </Statistic>
    );
  }
}

export default SoulConduit;
