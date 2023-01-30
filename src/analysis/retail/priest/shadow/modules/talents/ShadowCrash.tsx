import AbilityTracker from 'analysis/retail/priest/shadow/modules/core/AbilityTracker';
import { formatNumber } from 'common/format';
import SPELLS from 'common/SPELLS';
import TALENTS from 'common/TALENTS/priest';
import Insanity from 'interface/icons/Insanity';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { DamageEvent, ResourceChangeEvent } from 'parser/core/Events';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import ItemDamageDone from 'parser/ui/ItemDamageDone';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';

// Example Log: /report/zgBQ3kr6aAv19MXq/22-Normal+Zul+-+Kill+(2:26)/3-Selur
class ShadowCrash extends Analyzer {
  static dependencies = {
    abilityTracker: AbilityTracker,
  };

  damage = 0;
  insanityGained = 0;
  totalTargetsHit = 0;
  protected abilityTracker!: AbilityTracker;

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(TALENTS.SHADOW_CRASH_TALENT);
    this.addEventListener(
      Events.damage.by(SELECTED_PLAYER).spell(SPELLS.SHADOW_CRASH_TALENT_DAMAGE),
      this.onDamage,
    );
    this.addEventListener(
      Events.resourcechange.by(SELECTED_PLAYER).spell(TALENTS.SHADOW_CRASH_TALENT),
      this.onEnergize,
    );
  }

  get averageTargetsHit() {
    return (
      this.totalTargetsHit / this.abilityTracker.getAbility(TALENTS.SHADOW_CRASH_TALENT.id).casts
    );
  }

  onDamage(event: DamageEvent) {
    this.totalTargetsHit += 1;
    this.damage += event.amount + (event.absorbed || 0);
  }

  onEnergize(event: ResourceChangeEvent) {
    this.insanityGained += event.resourceChange;
  }

  statistic() {
    return (
      <Statistic
        category={STATISTIC_CATEGORY.TALENTS}
        size="flexible"
        tooltip={`Average targets hit: ${formatNumber(this.averageTargetsHit)}`}
      >
        <BoringSpellValueText spellId={TALENTS.SHADOW_CRASH_TALENT.id}>
          <>
            <ItemDamageDone amount={this.damage} />
            <br />
            <Insanity /> {formatNumber(this.insanityGained)} <small>Insanity generated</small>
          </>
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default ShadowCrash;
