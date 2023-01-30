import { t } from '@lingui/macro';
import { formatNumber, formatPercentage } from 'common/format';
import SPELLS from 'common/SPELLS';
import TALENTS from 'common/TALENTS/priest';
import { SpellLink } from 'interface';
import Insanity from 'interface/icons/Insanity';
import Analyzer, { SELECTED_PLAYER, Options } from 'parser/core/Analyzer';
import Events, { ResourceChangeEvent } from 'parser/core/Events';
import { When, ThresholdStyle } from 'parser/core/ParseResults';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';

class DeathAndMadness extends Analyzer {
  casts = 0;
  resets = 0;
  insanityGained = 0;

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(TALENTS.DEATH_AND_MADNESS_TALENT);
    this.addEventListener(
      Events.cast.by(SELECTED_PLAYER).spell(TALENTS.SHADOW_WORD_DEATH_TALENT),
      this.onCast,
    );
    this.addEventListener(
      Events.applybuff.by(SELECTED_PLAYER).spell(SPELLS.DEATH_AND_MADNESS_BUFF),
      this.onBuff,
    );
    this.addEventListener(
      Events.refreshbuff.by(SELECTED_PLAYER).spell(SPELLS.DEATH_AND_MADNESS_BUFF),
      this.onBuff,
    );
    this.addEventListener(
      Events.resourcechange.by(SELECTED_PLAYER).spell(SPELLS.DEATH_AND_MADNESS_BUFF),
      this.onEnergize,
    );
  }

  // Since the actual buff only applies/refreshes as a reward for getting a kill within 7s of using SW: Death, don't have to do much to check
  onBuff() {
    this.resets += 1;
  }

  onCast() {
    this.casts += 1;
  }

  onEnergize(event: ResourceChangeEvent) {
    this.insanityGained += event.resourceChange;
  }

  get resetPercentage() {
    return this.resets / this.casts;
  }

  get suggestionThresholds() {
    return {
      actual: this.resetPercentage,
      isLessThan: {
        minor: 0.0,
        average: 0.0,
        major: 0.0,
      },
      style: ThresholdStyle.PERCENTAGE,
    };
  }

  suggestions(when: When) {
    when(this.suggestionThresholds).addSuggestion((suggest, actual, recommended) =>
      suggest(
        <>
          You reset <SpellLink id={TALENTS.SHADOW_WORD_DEATH_TALENT.id} /> with{' '}
          {formatNumber(this.resets)} of your casts. Make sure that you are resetting{' '}
          <SpellLink id={TALENTS.SHADOW_WORD_DEATH_TALENT.id} /> as often as possible while taking
          the talent to benefit from the bonus insanity gained.
        </>,
      )
        .icon(TALENTS.DEATH_AND_MADNESS_TALENT.icon)
        .actual(
          t({
            id: 'priest.shadow.suggestions.deathAndMadness.efficiency',
            message: `Reset ${formatPercentage(
              actual,
            )}% of Shadow Word: Death casts. If you're not getting enough resets from Death and Madness, you'll likely benefit more from using a different talent.`,
          }),
        )
        .recommended(`>${formatPercentage(recommended)}% is recommended.`),
    );
  }

  statistic() {
    return (
      <Statistic
        category={STATISTIC_CATEGORY.TALENTS}
        size="flexible"
        tooltip="Number of casts where the target was killed and insanity generated from it."
      >
        <BoringSpellValueText spellId={TALENTS.DEATH_AND_MADNESS_TALENT.id}>
          <>
            {formatNumber(this.resets)} CD Resets
            <br />
            <Insanity /> {formatNumber(this.insanityGained)} <small>Insanity generated</small>
          </>
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default DeathAndMadness;
