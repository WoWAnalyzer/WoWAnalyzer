import { t } from '@lingui/macro';
import { formatPercentage } from 'common/format';
import SPELLS from 'common/SPELLS';
import TALENTS from 'common/TALENTS/priest';
import { SpellLink } from 'interface';
import Insanity from 'interface/icons/Insanity';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { DamageEvent, ResourceChangeEvent } from 'parser/core/Events';
import { ThresholdStyle, When } from 'parser/core/ParseResults';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import ItemDamageDone from 'parser/ui/ItemDamageDone';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';

class MindFlayInsanity extends Analyzer {
  damage = 0;
  insanityGained = 0;
  casts = 0;
  ticks = 0;

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(TALENTS.MIND_FLAY_INSANITY_TALENT);
    this.addEventListener(
      Events.cast.by(SELECTED_PLAYER).spell(SPELLS.MIND_FLAY_INSANITY_TALENT_DAMAGE),
      this.onCast,
    );
    this.addEventListener(
      Events.damage.by(SELECTED_PLAYER).spell(SPELLS.MIND_FLAY_INSANITY_TALENT_DAMAGE),
      this.onDamage,
    );
    this.addEventListener(
      Events.resourcechange.by(SELECTED_PLAYER).spell(SPELLS.MIND_FLAY_INSANITY_TALENT_DAMAGE),
      this.onEnergize,
    );
  }

  //regardless of haste, a full channel of this spell ticks 4 times.
  get ticksWastedPercentage() {
    return 1 - this.ticks / (this.casts * 4);
  }
  get ticksWasted() {
    return this.casts * 4 - this.ticks;
  }

  get suggestionThresholds() {
    return {
      actual: this.ticksWastedPercentage,
      isGreaterThan: {
        minor: 0.1,
        average: 0.2,
        major: 0.3,
      },
      style: ThresholdStyle.PERCENTAGE,
    };
  }

  onCast() {
    this.casts += 1;
  }

  onDamage(event: DamageEvent) {
    this.ticks += 1;
    this.damage += event.amount + (event.absorbed || 0);
  }

  onEnergize(event: ResourceChangeEvent) {
    this.insanityGained += event.resourceChange;
  }

  suggestions(when: When) {
    when(this.suggestionThresholds).addSuggestion((suggest) =>
      suggest(
        <>
          You interrupted <SpellLink id={TALENTS.MIND_FLAY_INSANITY_TALENT.id} /> early, wasting{' '}
          {formatPercentage(this.ticksWastedPercentage)}% the channel!
        </>,
      )
        .icon(TALENTS.MIND_FLAY_INSANITY_TALENT.icon)
        .actual(
          t({
            id: 'priest.shadow.suggestions.mindFlayInsanity.ticksLost',
            message: `Lost ${this.ticksWasted} ticks of Mind Flay: Insanity.`,
          }),
        )
        .recommended('No ticks lost is recommended.'),
    );
  }

  statistic() {
    return (
      <Statistic
        category={STATISTIC_CATEGORY.TALENTS}
        size="flexible"
        tooltip={
          <>
            {this.ticksWasted} ticks wasted by cancelling the channel early. <br />
          </>
        }
      >
        <BoringSpellValueText spellId={TALENTS.MIND_FLAY_INSANITY_TALENT.id}>
          <>
            <ItemDamageDone amount={this.damage} /> <br />
            <Insanity /> {this.insanityGained} <small>Insanity generated</small>
          </>
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default MindFlayInsanity;
