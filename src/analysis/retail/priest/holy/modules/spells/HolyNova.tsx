import SPELLS from 'common/SPELLS';
import TALENTS from 'common/TALENTS/priest';
import { SpellLink } from 'interface';
import Analyzer from 'parser/core/Analyzer';
import { ThresholdStyle, When } from 'parser/core/ParseResults';
import AbilityTracker from 'parser/shared/modules/AbilityTracker';

class HolyNova extends Analyzer {
  static dependencies = {
    abilityTracker: AbilityTracker,
  };

  protected abilityTracker!: AbilityTracker;

  get casts() {
    return this.abilityTracker.getAbility(TALENTS.HOLY_NOVA_TALENT.id).casts;
  }

  get healingHits() {
    return this.abilityTracker.getAbility(SPELLS.HOLY_NOVA_HEAL.id).healingHits;
  }

  get effectiveHealing() {
    return this.abilityTracker.getAbilityHealing(SPELLS.HOLY_NOVA_HEAL.id);
  }

  get overHealing() {
    return this.abilityTracker.getAbility(SPELLS.HOLY_NOVA_HEAL.id).healingVal.overheal;
  }

  get overhealPercent() {
    return this.overHealing / (this.effectiveHealing + this.overHealing);
  }

  get damageHits() {
    return this.abilityTracker.getAbility(TALENTS.HOLY_NOVA_TALENT.id).damageHits;
  }

  get damageDone() {
    return this.abilityTracker.getAbilityDamage(TALENTS.HOLY_NOVA_TALENT.id);
  }

  get averageFriendlyTargetsHit() {
    if (this.casts > 0) {
      return this.healingHits / this.casts;
    }
    return 0;
  }

  get averageHealingPerCast() {
    if (this.casts > 0) {
      return this.effectiveHealing / this.casts;
    }
    return 0;
  }

  get averageEnemyTargetsHit() {
    if (this.casts > 0) {
      return this.damageHits / this.casts;
    }
    return 0;
  }

  get averageDamagePerCast() {
    if (this.casts > 0) {
      return this.damageDone / this.casts;
    }
    return 0;
  }

  get holyNovaThreshold() {
    return {
      actual: this.averageFriendlyTargetsHit > 0 ? this.averageFriendlyTargetsHit : 10,
      isLessThan: {
        minor: 10,
        average: 5,
        major: 2,
      },
      style: ThresholdStyle.NUMBER,
    };
  }

  suggestions(when: When) {
    when(this.holyNovaThreshold).addSuggestion((suggest, actual, recommended) =>
      suggest(
        <>
          You should only cast <SpellLink spell={TALENTS.HOLY_NOVA_TALENT} /> when you will hit 5 or
          more targets.
        </>,
      )
        .icon(TALENTS.HOLY_NOVA_TALENT.icon)
        .actual(<>You hit an average of {actual} targets when you cast Holy Nova.</>)
        .recommended(`An average of ${recommended} or more healing hits per cast is recommended.`),
    );
  }
}

export default HolyNova;
