import { formatPercentage, formatThousands } from 'common/format';
import SPELLS from 'common/SPELLS';
import TALENTS from 'common/TALENTS/warlock';
import Analyzer, { SELECTED_PLAYER, Options } from 'parser/core/Analyzer';
import Events, { DamageEvent } from 'parser/core/Events';
import { findMax, binomialPMF } from 'parser/shared/modules/helpers/Probability';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import TalentSpellText from 'parser/ui/TalentSpellText';

import SoulShardTracker from '../resources/SoulShardTracker';

const SC_PROC_CHANCE_BASE = 0.05;

class SoulConduit extends Analyzer {
  static dependencies = {
    soulShardTracker: SoulShardTracker,
  };

  protected soulShardTracker!: SoulShardTracker;

  SC_PROC_CHANCE: number =
    SC_PROC_CHANCE_BASE * this.selectedCombatant.getTalentRank(TALENTS.SOUL_CONDUIT_TALENT);

  _totalCasts = 0;
  _totalMRdamage = 0;

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(TALENTS.SOUL_CONDUIT_TALENT);
    this.addEventListener(
      Events.damage.by(SELECTED_PLAYER).spell(SPELLS.MALEFIC_RAPTURE),
      this.onMaleficRaptureDamage,
    );
  }

  onMaleficRaptureDamage(event: DamageEvent) {
    this._totalCasts += 1;
    this._totalMRdamage += event.amount + (event.absorbed || 0);
  }

  statistic() {
    const avgDamage = this._totalMRdamage / Math.max(this._totalCasts, 1);
    const shardsGained = this.soulShardTracker.getGeneratedBySpell(
      SPELLS.SOUL_CONDUIT_SHARD_GEN.id,
    );
    const estimatedMRDamage = shardsGained * avgDamage;
    const totalSpent = this.soulShardTracker.spent;
    // find number of Shards we were MOST LIKELY to get in the fight
    const { max } = findMax(totalSpent, (k, n) => binomialPMF(k, n, this.SC_PROC_CHANCE));
    return (
      <Statistic
        category={STATISTIC_CATEGORY.TALENTS}
        size="flexible"
        tooltip={
          <>
            You gained {shardsGained} Shards from this talent,{' '}
            {max > 0 ? (
              <>
                which is <strong>{formatPercentage(shardsGained / max)}%</strong> of Shards you were
                most likely to get in this fight ({max} Shards).
              </>
            ) : (
              'while you were most likely to not get any Shards.'
            )}
            <br />
            Estimated damage: {formatThousands(estimatedMRDamage)} (
            {this.owner.formatItemDamageDone(estimatedMRDamage)})<br />
            <br />
            This result is estimated by multiplying number of Soul Shards gained from this talent by
            the average Malefic Rapture damage for the whole fight.
          </>
        }
      >
        <TalentSpellText talent={TALENTS.SOUL_CONDUIT_TALENT}>
          {shardsGained} <small>Soul Shards generated</small>
        </TalentSpellText>
      </Statistic>
    );
  }
}

export default SoulConduit;
