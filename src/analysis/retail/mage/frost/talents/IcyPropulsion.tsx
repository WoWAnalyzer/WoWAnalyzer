import { formatNumber } from 'common/format';
import SPELLS from 'common/SPELLS';
import TALENTS from 'common/TALENTS/mage';
import HIT_TYPES from 'game/HIT_TYPES';
import UptimeIcon from 'interface/icons/Uptime';
import Analyzer, { Options } from 'parser/core/Analyzer';
import { SELECTED_PLAYER } from 'parser/core/EventFilter';
import Events, { DamageEvent } from 'parser/core/Events';
import AbilityTracker from 'parser/shared/modules/AbilityTracker';
import SpellUsable from 'parser/shared/modules/SpellUsable';
import ConduitSpellText from 'parser/ui/ConduitSpellText';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';

const COOLDOWN_REDUCTION_MS = [
  0,
  750,
  830,
  900,
  980,
  1005,
  1130,
  1200,
  1280,
  1350,
  1430,
  1500,
  1580,
  1650,
  1730,
  1800,
];

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
    this.active = this.selectedCombatant.hasConduitBySpellID(SPELLS.ICY_PROPULSION.id);
    this.conduitRank = this.selectedCombatant.conduitRankBySpellID(SPELLS.ICY_PROPULSION.id);
    this.addEventListener(Events.damage.by(SELECTED_PLAYER), this.onDamage);
  }

  onDamage(event: DamageEvent) {
    if (
      !this.selectedCombatant.hasBuff(TALENTS.ICY_VEINS_TALENT.id) ||
      event.hitType !== HIT_TYPES.CRIT ||
      !this.spellUsable.isOnCooldown(TALENTS.ICY_VEINS_TALENT.id)
    ) {
      return;
    }

    this.cooldownReduction += this.spellUsable.reduceCooldown(
      TALENTS.ICY_VEINS_TALENT.id,
      COOLDOWN_REDUCTION_MS[this.conduitRank],
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
        category={STATISTIC_CATEGORY.COVENANTS}
        size="flexible"
        tooltip={
          <>
            Icy Propulsion reduced the cooldown on Icy Veins by a total of {this.reductionSeconds} (
            {this.reductionPerIcyVeins} Per Icy Veins on average).
          </>
        }
      >
        <ConduitSpellText spellId={SPELLS.ICY_PROPULSION.id} rank={this.conduitRank}>
          <UptimeIcon /> {`${formatNumber(this.reductionSeconds)}s`} <small>Icy Veins CDR</small>
        </ConduitSpellText>
      </Statistic>
    );
  }
}

export default IcyPropulsion;
