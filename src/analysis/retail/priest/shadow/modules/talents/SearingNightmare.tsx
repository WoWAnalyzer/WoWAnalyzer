import { t } from '@lingui/macro';
import AbilityTracker from 'analysis/retail/priest/shadow/modules/core/AbilityTracker';
import { formatNumber } from 'common/format';
import SPELLS from 'common/SPELLS';
import { SpellLink } from 'interface';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { DamageEvent } from 'parser/core/Events';
import { ThresholdStyle, When } from 'parser/core/ParseResults';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import ItemDamageDone from 'parser/ui/ItemDamageDone';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';

class SearingNightmare extends Analyzer {
  static dependencies = {
    abilityTracker: AbilityTracker,
  };
  protected abilityTracker!: AbilityTracker;

  damage = 0;
  totalTargetsHit = 0;

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(SPELLS.SEARING_NIGHTMARE_TALENT.id);
    this.addEventListener(
      Events.damage.by(SELECTED_PLAYER).spell(SPELLS.SEARING_NIGHTMARE_TALENT),
      this.onDamage,
    );
  }

  get averageTargetsHit() {
    return (
      this.totalTargetsHit /
        this.abilityTracker.getAbility(SPELLS.SEARING_NIGHTMARE_TALENT.id).casts || 0
    );
  }

  onDamage(event: DamageEvent) {
    this.totalTargetsHit += 1;
    this.damage += event.amount + (event.absorbed || 0);
  }

  get suggestionThresholds() {
    return {
      actual: this.averageTargetsHit,
      isLessThan: {
        minor: 4,
        average: 3.5,
        major: 3,
      },
      style: ThresholdStyle.NUMBER,
    };
  }

  suggestions(when: When) {
    when(this.suggestionThresholds).addSuggestion((suggest, actual, recommended) =>
      suggest(
        <>
          You hit an average of {formatNumber(actual)} targets with{' '}
          <SpellLink id={SPELLS.SEARING_NIGHTMARE_TALENT.id} />. Using{' '}
          <SpellLink id={SPELLS.SEARING_NIGHTMARE_TALENT.id} /> below {formatNumber(recommended)}{' '}
          targets is not worth it and you will get more damage value from your insanity with{' '}
          <SpellLink id={SPELLS.DEVOURING_PLAGUE.id} />. If you are not getting enough hits or casts
          from this talent, you will likely benefit more from a different one.
        </>,
      )
        .icon(SPELLS.SEARING_NIGHTMARE_TALENT.icon)
        .actual(
          t({
            id: 'priest.shadow.suggestions.searingNightmare.efficiency',
            message: `Hit an average of ${formatNumber(actual)} targets with Searing Nightmare.`,
          }),
        )
        .recommended(`>=${recommended} is recommended.`),
    );
  }

  statistic() {
    return (
      <Statistic
        category={STATISTIC_CATEGORY.TALENTS}
        size="flexible"
        tooltip={`Average targets hit: ${formatNumber(this.averageTargetsHit)}`}
      >
        <BoringSpellValueText spellId={SPELLS.SEARING_NIGHTMARE_TALENT.id}>
          <>
            <ItemDamageDone amount={this.damage} />
          </>
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default SearingNightmare;
