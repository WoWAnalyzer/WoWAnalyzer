import { formatPercentage } from 'common/format';
import SPELLS from 'common/SPELLS';
import SCHOOLS from 'game/MAGIC_SCHOOLS';
import { SpellLink } from 'interface';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { DamageEvent } from 'parser/core/Events';
import { ThresholdStyle, When } from 'parser/core/ParseResults';
import AbilityTracker from 'parser/shared/modules/AbilityTracker';
import StatTracker from 'parser/shared/modules/StatTracker';
import TALENTS from 'common/TALENTS/warrior';

const debug = false;

class SpellReflect extends Analyzer {
  static dependencies = {
    statTracker: StatTracker,
    abilityTracker: AbilityTracker,
  };

  protected statTracker!: StatTracker;
  protected abilityTracker!: AbilityTracker;

  magicDamage = 0;
  magicDamageReduced = 0;
  totalDamage = 0;

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(TALENTS.SPELL_REFLECTION_TALENT);
    if (!this.active) {
      return;
    }
    this.addEventListener(Events.damage.to(SELECTED_PLAYER), this.onDamage);
    debug && this.addEventListener(Events.fightend, this.fightEndDebug);
  }

  onDamage(event: DamageEvent) {
    if (event.ability.type === SCHOOLS.ids.PHYSICAL) {
      return;
    }
    this.magicDamage += event.unmitigatedAmount || 0;
    if (this.selectedCombatant.hasBuff(SPELLS.SPELL_REFLECTION.id)) {
      this.magicDamageReduced += event.unmitigatedAmount || 0;
    }
  }

  fightEndDebug() {
    console.log(`magic damage ${this.magicDamage}`);
    console.log(`magic damage with mit ${this.magicDamageReduced}`);
    console.log(`total damage ${this.totalDamage}`);
  }

  get suggestionThresholds() {
    return {
      actual: this.magicDamageReduced / this.magicDamage,
      isLessThan: {
        minor: 0.25,
        average: 0.15,
        major: 0.05,
      },
      style: ThresholdStyle.PERCENTAGE,
    };
  }

  suggestions(when: When) {
    when(this.suggestionThresholds).addSuggestion((suggest, actual, recommended) =>
      suggest(
        <>
          Try to cast <SpellLink id={SPELLS.SPELL_REFLECTION.id} /> more often when magic damage is
          going out to take less damage.
        </>,
      )
        .icon(SPELLS.SPELL_REFLECTION.icon)
        .actual(`${formatPercentage(actual)} % magic damage With Spell Reflect Up`)
        .recommended(`${formatPercentage(recommended)} % recommended`),
    );
  }
}

export default SpellReflect;
