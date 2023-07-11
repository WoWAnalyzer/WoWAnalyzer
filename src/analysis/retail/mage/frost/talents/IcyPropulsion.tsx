import { formatNumber } from 'common/format';
import TALENTS from 'common/TALENTS/mage';
import HIT_TYPES from 'game/HIT_TYPES';
import UptimeIcon from 'interface/icons/Uptime';
import Analyzer, { Options } from 'parser/core/Analyzer';
import { SELECTED_PLAYER } from 'parser/core/EventFilter';
import Events, { DamageEvent } from 'parser/core/Events';
import AbilityTracker from 'parser/shared/modules/AbilityTracker';
import SpellUsable from 'parser/shared/modules/SpellUsable';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import { PLACEHOLDER_TALENT } from 'common/TALENTS/types';

const COOLDOWN_REDUCTION_MS = 1000;

class IcyPropulsion extends Analyzer {
  static dependencies = {
    spellUsable: SpellUsable,
    abilityTracker: AbilityTracker,
  };
  protected spellUsable!: SpellUsable;
  protected abilityTracker!: AbilityTracker;

  conduitRank = 0;
  cooldownReduction = 0;

  constructor(options: Options) {
    super(options);
    this.active = false;
    this.addEventListener(Events.damage.by(SELECTED_PLAYER), this.onDamage);
  }

  onDamage(event: DamageEvent) {
    if (
      event.hitType !== HIT_TYPES.CRIT ||
      !this.spellUsable.isOnCooldown(TALENTS.ICY_VEINS_TALENT.id)
    ) {
      return;
    }

    this.cooldownReduction += this.spellUsable.reduceCooldown(
      TALENTS.ICY_VEINS_TALENT.id,
      COOLDOWN_REDUCTION_MS,
    );
  }

  get reductionSeconds() {
    return this.cooldownReduction / 1000;
  }

  get reductionPerIcyVeins() {
    return (
      this.reductionSeconds / this.abilityTracker.getAbility(TALENTS.ICY_VEINS_TALENT.id).casts
    );
  }

  statistic() {
    return (
      <Statistic
        category={STATISTIC_CATEGORY.TALENTS}
        size="flexible"
        tooltip={
          <>
            Icy Propulsion reduced the cooldown on Icy Veins by a total of {this.reductionSeconds} (
            {this.reductionPerIcyVeins} Per Icy Veins on average).
          </>
        }
      >
        <BoringSpellValueText spell={PLACEHOLDER_TALENT}>
          <UptimeIcon /> {`${formatNumber(this.reductionSeconds)}s`} <small>Icy Veins CDR</small>
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default IcyPropulsion;
