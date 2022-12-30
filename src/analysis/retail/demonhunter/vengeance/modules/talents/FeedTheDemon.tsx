import { formatNumber, formatPercentage } from 'common/format';
import SPELLS from 'common/SPELLS/demonhunter';
import { TALENTS_DEMON_HUNTER } from 'common/TALENTS/demonhunter';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { HealEvent } from 'parser/core/Events';
import AbilityTracker from 'parser/shared/modules/AbilityTracker';
import SpellUsable from 'parser/shared/modules/SpellUsable';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';
import TalentSpellText from 'parser/ui/TalentSpellText';

const COOLDOWN_REDUCTION_MS = 500;

//WCL https://www.warcraftlogs.com/reports/ZVJr2MPNx3RCvX6B/#fight=6&source=184
class FeedTheDemon extends Analyzer {
  static dependencies = {
    abilityTracker: AbilityTracker,
    spellUsable: SpellUsable,
  };
  casts = 0;
  totalCooldownReductionWasted = 0;
  totalCooldownReduction = 0;
  protected abilityTracker!: AbilityTracker;
  protected spellUsable!: SpellUsable;

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(TALENTS_DEMON_HUNTER.FEED_THE_DEMON_TALENT);
    this.addEventListener(
      Events.heal.by(SELECTED_PLAYER).spell(SPELLS.CONSUME_SOUL_VDH),
      this.onHeal,
    );
  }

  get FTDReduction() {
    return this.totalCooldownReduction;
  }

  get FTDReductionWasted() {
    return this.totalCooldownReductionWasted;
  }

  get reduction() {
    return this.FTDReduction / 1000;
  }

  get wastedReduction() {
    return this.FTDReductionWasted / 1000;
  }

  get averageReduction() {
    const casts = this.abilityTracker.getAbility(SPELLS.DEMON_SPIKES.id).casts;
    return this.reduction / casts || 0;
  }

  get wastedPercent() {
    return this.wastedReduction / (this.wastedReduction + this.reduction);
  }

  onHeal(_: HealEvent) {
    if (!this.spellUsable.isOnCooldown(SPELLS.DEMON_SPIKES.id)) {
      this.totalCooldownReductionWasted += COOLDOWN_REDUCTION_MS;
    } else {
      const effectiveReduction = this.spellUsable.reduceCooldown(
        SPELLS.DEMON_SPIKES.id,
        COOLDOWN_REDUCTION_MS,
      );
      this.totalCooldownReduction += effectiveReduction;
      this.totalCooldownReductionWasted += COOLDOWN_REDUCTION_MS - effectiveReduction;
    }
  }

  statistic() {
    return (
      <Statistic
        position={STATISTIC_ORDER.CORE(6)}
        category={STATISTIC_CATEGORY.TALENTS}
        size="flexible"
        tooltip={
          <>
            {formatNumber(this.reduction)} sec total effective reduction.
            <br />
            {formatNumber(this.wastedReduction)} sec ({formatPercentage(this.wastedPercent)}%)
            wasted reduction.
          </>
        }
      >
        <TalentSpellText talent={TALENTS_DEMON_HUNTER.FEED_THE_DEMON_TALENT}>
          {formatNumber(this.averageReduction)} sec average reduction
        </TalentSpellText>
      </Statistic>
    );
  }
}

export default FeedTheDemon;
