import TALENTS from 'common/TALENTS/priest';
import Analyzer, { Options } from 'parser/core/Analyzer';
import Statistic from 'parser/ui/Statistic';
import ItemHealingDone from 'parser/ui/ItemHealingDone';
import EchoOfLightMastery from '../../core/EchoOfLightMastery';
import AbilityTracker from '../../core/AbilityTracker';
import SPELLS from 'common/SPELLS';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import TalentSpellText from 'parser/ui/TalentSpellText';
import { SpellLink } from 'interface';

/**
 * Renew instantly heals your target for 10% of its total periodic effect.
 */
class EmpoweredRenew extends Analyzer {
  static dependencies = {
    echoOfLightMastery: EchoOfLightMastery,
    abilityTracker: AbilityTracker,
  };

  protected echoOfLightMastery!: EchoOfLightMastery;
  protected abilityTracker!: AbilityTracker;

  additionalHealing: number = 0;

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(TALENTS.EMPOWERED_RENEW_TALENT);
  }

  get effectiveHealing() {
    return (
      this.abilityTracker.getAbility(SPELLS.EMPOWERED_RENEW_TALENT_HEAL.id).healingEffective +
      this.abilityTracker.getAbility(SPELLS.EMPOWERED_RENEW_TALENT_HEAL.id).healingAbsorbed +
      this.echoOfLightMastery.masteryHealingBySpell[SPELLS.EMPOWERED_RENEW_TALENT_HEAL.id]
        .effectiveHealing
    );
  }

  statistic() {
    return (
      <Statistic
        size="flexible"
        category={STATISTIC_CATEGORY.TALENTS}
        tooltip={
          <>
            This includes the additional healing from{' '}
            <SpellLink id={TALENTS.EMPOWERED_RENEW_TALENT.id} /> proccing{' '}
            <SpellLink id={SPELLS.ECHO_OF_LIGHT_MASTERY.id} />.
          </>
        }
      >
        <TalentSpellText talent={TALENTS.EMPOWERED_RENEW_TALENT}>
          <ItemHealingDone amount={this.effectiveHealing} />
        </TalentSpellText>
      </Statistic>
    );
  }
}

export default EmpoweredRenew;
