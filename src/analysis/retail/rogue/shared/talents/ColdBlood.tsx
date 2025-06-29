import { formatNumber } from 'common/format';
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

class ColdBlood extends Analyzer {
  static dependencies = {
    abilities: Abilities,
  };
  casts = 0;
  cooldown = 90;
  damage = 0;
  lashDamage = 0;
  maxCasts = 0;
  protected abilities!: Abilities;

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(TALENTS.COLD_BLOOD_TALENT);
    if (!this.active) {
      return;
    }

    this.addEventListener(
      Events.damage.by(SELECTED_PLAYER).spell(TALENTS.COLD_BLOOD_TALENT),
      this.onDamage,
    );

    this.addEventListener(Events.fightend, this.adjustMaxCasts);

    (options.abilities as Abilities).add({
      spell: TALENTS.COLD_BLOOD_TALENT.id,
      category: SPELL_CATEGORY.COOLDOWNS,
      cooldown: this.cooldown,
      gcd: {
        static: 1000,
      },
      castEfficiency: {
        suggestion: true,
        recommendedEfficiency: 0.9,
        averageIssueEfficiency: 0.8,
        majorIssueEfficiency: 0.7,
        extraSuggestion: 'Cast before second Secret Technique',
      },
    });
  }

  adjustMaxCasts() {
    this.maxCasts = Math.floor(calculateMaxCasts(this.cooldown, this.owner.fightDuration));
  }

  onDamage(event: DamageEvent) {
    this.damage += event.amount + (event.absorbed || 0);
    this.casts += 1;
  }

  get efficiency() {
    return this.maxCasts > 0 ? (this.casts / this.maxCasts) * 100 : 0;
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

  get totalDamage() {
    return this.damage + this.lashDamage;
  }

  get flagellationDPS() {
    return this.damage / (this.owner.fightDuration / 1000);
  }

  statistic() {
    return (
      <Statistic
        size="flexible"
        category={STATISTIC_CATEGORY.TALENTS}
        tooltip={
          <ul>
            <li>{formatNumber(this.damage)} damage done by Cold Blood</li>
          </ul>
        }
      >
        <BoringSpellValueText spell={TALENTS.COLD_BLOOD_TALENT}>
          <ItemDamageDone amount={this.damage} />
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default ColdBlood;
