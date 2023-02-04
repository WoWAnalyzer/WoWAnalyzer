import { t } from '@lingui/macro';
import AbilityTracker from 'analysis/retail/priest/shadow/modules/core/AbilityTracker';
import { formatNumber } from 'common/format';
import TALENTS from 'common/TALENTS/priest';
import SPELLS from 'common/SPELLS';
import { SpellLink } from 'interface';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { DamageEvent } from 'parser/core/Events';
import { ThresholdStyle, When } from 'parser/core/ParseResults';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import ItemDamageDone from 'parser/ui/ItemDamageDone';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import Enemies from 'parser/shared/modules/Enemies';

class MindSear extends Analyzer {
  static dependencies = {
    abilityTracker: AbilityTracker,
    enemies: Enemies,
  };
  protected enemies!: Enemies;
  protected abilityTracker!: AbilityTracker;

  damage = 0;
  hits = 0;
  ticks = 0;
  time = 0;
  checkTime = 0;
  casts = 0;

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(TALENTS.MIND_SEAR_TALENT);
    this.addEventListener(
      Events.damage.by(SELECTED_PLAYER).spell(SPELLS.MIND_SEAR_TALENT_DAMAGE),
      this.onDamage,
    );
    this.addEventListener(
      Events.cast.by(SELECTED_PLAYER).spell(TALENTS.MIND_SEAR_TALENT),
      this.onCast,
    );
  }

  get averageTargetsHit() {
    return this.hits / this.ticks || 0;
  }

  onCast() {
    this.casts += 1;
    //console.log("Cast");
  }

  //Every Mind Sear cast can be one to four damage events per target.
  //By counting the number of unique timestamps, we can get the number of damage events.
  //By counting the damage events done we can calculate the average number of targets hit per tick, instead of per cast.

  onDamage(event: DamageEvent) {
    this.hits += 1;
    this.damage += event.amount + (event.absorbed || 0);

    this.checkTime = event.timestamp;
    const timeDiff = Math.abs(this.time - this.checkTime);
    // Sometimes there can be a slight difference in timestamp even for the same ticks. This gives a plenty of wiggle room while never risking catching the next set.
    if (timeDiff > 100) {
      this.ticks += 1;
    }

    this.time = this.checkTime;
  }

  get suggestionThresholds() {
    return {
      actual: this.averageTargetsHit,
      isLessThan: {
        minor: 3,
        average: 2.5,
        major: 2,
      },
      style: ThresholdStyle.NUMBER,
    };
  }

  suggestions(when: When) {
    when(this.suggestionThresholds).addSuggestion((suggest, actual, recommended) =>
      suggest(
        <>
          You hit an average of {formatNumber(actual)} targets with{' '}
          <SpellLink id={TALENTS.MIND_SEAR_TALENT.id} />. Using{' '}
          <SpellLink id={TALENTS.MIND_SEAR_TALENT.id} /> below {formatNumber(recommended)} targets
          is not worth it and you will get more damage value from your insanity with{' '}
          <SpellLink id={TALENTS.DEVOURING_PLAGUE_TALENT.id} />.
        </>,
      )
        .icon(TALENTS.MIND_SEAR_TALENT.icon)
        .actual(
          t({
            id: 'priest.shadow.suggestions.MIND_SEAR.efficiency',
            message: `Hit an average of ${formatNumber(actual)} targets with Mind Sear.`,
          }),
        )
        .recommended(`>=${recommended} is recommended.`),
    );
  }

  statistic() {
    if (this.damage !== 0) {
      return (
        <Statistic
          category={STATISTIC_CATEGORY.TALENTS}
          size="flexible"
          tooltip={`Average targets hit: ${this.averageTargetsHit.toFixed(1)}`}
        >
          <BoringSpellValueText spellId={TALENTS.MIND_SEAR_TALENT.id}>
            <>
              <ItemDamageDone amount={this.damage} />
            </>
          </BoringSpellValueText>
        </Statistic>
      );
    }
  }
}

export default MindSear;
