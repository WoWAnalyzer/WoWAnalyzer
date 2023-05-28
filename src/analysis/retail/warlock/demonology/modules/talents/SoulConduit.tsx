import { formatPercentage } from 'common/format';
import SPELLS from 'common/SPELLS';
import TALENTS from 'common/TALENTS/warlock';
import Analyzer, { Options } from 'parser/core/Analyzer';
import { findMax, binomialPMF } from 'parser/shared/modules/helpers/Probability';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import TalentSpellText from 'parser/ui/TalentSpellText';

import SoulShardTracker from '../resources/SoulShardTracker';

const SHARDS_PER_HOG = 3;
const SC_PROC_CHANCE_BASE = 0.05;

class SoulConduit extends Analyzer {
  static dependencies = {
    soulShardTracker: SoulShardTracker,
  };

  soulShardTracker!: SoulShardTracker;

  SC_PROC_CHANCE =
    SC_PROC_CHANCE_BASE * this.selectedCombatant.getTalentRank(TALENTS.SOUL_CONDUIT_TALENT);

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(TALENTS.SOUL_CONDUIT_TALENT);
  }

  statistic() {
    const generated = this.soulShardTracker.getGeneratedBySpell(SPELLS.SOUL_CONDUIT_SHARD_GEN.id);
    const extraHogs = Math.floor(generated / SHARDS_PER_HOG);
    const totalSpent = this.soulShardTracker.spent;
    // find number of Shards we were MOST LIKELY to get in the fight
    const { max } = findMax(totalSpent, (k, n) => binomialPMF(k, n, this.SC_PROC_CHANCE));
    return (
      <Statistic
        category={STATISTIC_CATEGORY.TALENTS}
        size="flexible"
        tooltip={
          <>
            You gained {generated} Shards from this talent
            {max > 0 ? (
              <>
                , which is <strong>{formatPercentage(generated / max)}%</strong> of Shards you were
                most likely to get in this fight ({max} Shards).
              </>
            ) : (
              ', while you were most likely to not get any Shards.'
            )}
            <br />
            You would get {extraHogs} extra 3 shard Hands of Gul'dan with shards from this talent.
          </>
        }
      >
        <TalentSpellText talent={TALENTS.SOUL_CONDUIT_TALENT}>
          {generated} <small>Shards generated</small>
        </TalentSpellText>
      </Statistic>
    );
  }
}

export default SoulConduit;
