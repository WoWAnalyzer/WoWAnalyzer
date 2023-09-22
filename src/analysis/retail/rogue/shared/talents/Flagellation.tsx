import { formatNumber } from 'common/format';
import SPELLS from 'common/SPELLS';
import TALENTS from 'common/TALENTS/rogue';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import { calculateMaxCasts } from 'parser/core/EventCalculateLib';
import Events, { DamageEvent } from 'parser/core/Events';
import Abilities from 'parser/core/modules/Abilities';
import { ThresholdStyle } from 'parser/core/ParseResults';
import SPELL_CATEGORY from 'parser/core/SPELL_CATEGORY';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import ItemDamageDone from 'parser/ui/ItemDamageDone';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';

class Flagellation extends Analyzer {
  static dependencies = {
    abilities: Abilities,
  };
  casts: number = 0;
  cooldown: number = 90;
  damage: number = 0;
  lashDamage: number = 0;
  maxCasts = 0;
  protected abilities!: Abilities;

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(TALENTS.FLAGELLATION_TALENT);
    if (!this.active) {
      return;
    }

    this.addEventListener(
      Events.damage.by(SELECTED_PLAYER).spell(TALENTS.FLAGELLATION_TALENT),
      this.onDamage,
    );
    this.addEventListener(
      Events.damage.by(SELECTED_PLAYER).spell(SPELLS.FLAGELLATION_LASH),
      this.onLashDamage,
    );
    this.addEventListener(Events.fightend, this.adjustMaxCasts);
    (options.abilities as Abilities).add({
      spell: TALENTS.FLAGELLATION_TALENT.id,
      category: SPELL_CATEGORY.COOLDOWNS,
      cooldown: this.cooldown,
      gcd: {
        base: 1000,
      },
      castEfficiency: {
        maxCasts: () => this.maxCasts,
        suggestion: true,
        recommendedEfficiency: 0.9,
        averageIssueEfficiency: 0.8,
        majorIssueEfficiency: 0.7,
        extraSuggestion: 'Cast before finisher moves to maximize haste buff and lashing damage',
      },
    });
  }

  adjustMaxCasts() {
    this.maxCasts = Math.floor(calculateMaxCasts(this.cooldown, this.owner.fightDuration));
  }

  onDamage(event: DamageEvent) {
    this.damage += event.amount + (event.absorbed || 0);
    this.casts = this.casts + 1;
  }

  onLashDamage(event: DamageEvent) {
    this.damage += event.amount + (event.absorbed || 0);
    this.lashDamage += event.amount + (event.absorbed || 0);
  }

  get efficiency() {
    return this.casts / this.maxCasts;
  }

  get suggestionThresholds() {
    return {
      actual: this.efficiency,
      isLessThan: {
        minor: 0.95,
        average: 0.8,
        major: 0.7,
      },
      style: ThresholdStyle.PERCENTAGE,
    };
  }

  statistic() {
    return (
      <Statistic
        size="flexible"
        category={STATISTIC_CATEGORY.TALENTS}
        tooltip={
          <ul>
            <li>{formatNumber(this.lashDamage)} damage done by flagellation lashes</li>
            <li>{formatNumber(this.damage)} damage done by flagellation</li>
          </ul>
        }
      >
        <BoringSpellValueText spell={TALENTS.FLAGELLATION_TALENT}>
          <>
            <ItemDamageDone amount={this.damage} />
          </>
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default Flagellation;
