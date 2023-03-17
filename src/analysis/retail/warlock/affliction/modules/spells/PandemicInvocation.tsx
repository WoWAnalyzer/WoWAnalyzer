import { formatPercentage, formatNumber } from 'common/format';
import TALENTS from 'common/TALENTS/warlock';
import SPELLS from 'common/SPELLS/warlock';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events from 'parser/core/Events';
import AbilityTracker from 'parser/shared/modules/AbilityTracker';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';

import SoulShardTracker from '../resources/SoulShardTracker';
import { TooltipElement } from 'interface';
import TalentSpellText from 'parser/ui/TalentSpellText';

const PANDEMIC_INVOCATION_DOTS = [
  SPELLS.AGONY,
  SPELLS.CORRUPTION_DEBUFF,
  TALENTS.SIPHON_LIFE_TALENT,
  TALENTS.UNSTABLE_AFFLICTION_TALENT,
];

class PandemicInvocation extends Analyzer {
  static dependencies = {
    soulShardTracker: SoulShardTracker,
    abilityTracker: AbilityTracker,
  };

  protected soulShardTracker!: SoulShardTracker;
  protected abilityTracker!: AbilityTracker;

  refreshes: number = 0;

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(TALENTS.PANDEMIC_INVOCATION_TALENT);
    this.addEventListener(
      Events.refreshdebuff.by(SELECTED_PLAYER).spell(PANDEMIC_INVOCATION_DOTS),
      this.onRefreshDot,
    );
  }

  onRefreshDot() {
    this.refreshes += 1;
  }

  statistic() {
    const shardsGained = this.soulShardTracker.getGeneratedBySpell(
      SPELLS.PANDEMIC_INVOCATION_SHARD_GEN.id,
    );
    // this might be a bit off if it didn't actually manage to hit as something died,
    // but it is simpler than tracking buff apply/refresh timestamps
    const hits = this.abilityTracker.getAbility(SPELLS.PANDEMIC_INVOCATION_HIT.id).damageHits;
    const pandemicRefreshPercent = hits / this.refreshes;
    return (
      <Statistic
        category={STATISTIC_CATEGORY.TALENTS}
        size="flexible"
        tooltip={
          <>
            The % PI refreshes metric only counts DoT refreshes without corresponding PI hits as
            "misses", it does not include reapplications of a dropped DoT. If your DoT uptime wasn't
            close to 100% then you missed out on even more PI hits. If you know mechanics/range
            won't interfere with refreshing a DoT inside the PI window, hold off on refreshing it
            until then, especially on single target.
          </>
        }
      >
        <TalentSpellText talent={TALENTS.PANDEMIC_INVOCATION_TALENT}>
          {formatNumber(shardsGained)} <small>Soul Shards generated</small>
          <br />
          {formatPercentage(pandemicRefreshPercent)} %{' '}
          <TooltipElement content={`${hits} hits for ${this.refreshes} refreshes`}>
            <small>DoT refreshes triggered PI</small>
          </TooltipElement>
        </TalentSpellText>
      </Statistic>
    );
  }
}

export default PandemicInvocation;
