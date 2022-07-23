import { t } from '@lingui/macro';
import { formatPercentage, formatThousands } from 'common/format';
import SPELLS from 'common/SPELLS';
import { SpellLink } from 'interface';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { DamageEvent, ResourceChangeEvent } from 'parser/core/Events';
import { ThresholdStyle, When } from 'parser/core/ParseResults';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';

/**
 * Example Report: https://www.warcraftlogs.com/reports/KGJgZPxanBX82LzV/#fight=4&source=20
 */

const IMMOLATION_AURA = [
  SPELLS.IMMOLATION_AURA_INITIAL_HIT_DAMAGE,
  SPELLS.IMMOLATION_AURA_BUFF_DAMAGE,
];

class ImmolationAura extends Analyzer {
  get furyPerMin() {
    return ((this.furyGain - this.furyWaste) / (this.owner.fightDuration / 60000)).toFixed(2);
  }

  get suggestionThresholds() {
    return {
      actual: this.furyWaste / this.furyGain,
      isGreaterThan: {
        minor: 0.03,
        average: 0.07,
        major: 0.1,
      },
      style: ThresholdStyle.PERCENTAGE,
    };
  }

  furyGain = 0;
  furyWaste = 0;
  damage = 0;

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(SPELLS.BURNING_HATRED_TALENT.id);
    if (!this.active) {
      return;
    }
    this.addEventListener(
      Events.resourcechange.by(SELECTED_PLAYER).spell(IMMOLATION_AURA),
      this.onEnergizeEvent,
    );
    this.addEventListener(
      Events.damage.by(SELECTED_PLAYER).spell(IMMOLATION_AURA),
      this.onDamageEvent,
    );
  }

  onEnergizeEvent(event: ResourceChangeEvent) {
    this.furyGain += event.resourceChange;
    this.furyWaste += event.waste;
  }

  onDamageEvent(event: DamageEvent) {
    this.damage += event.amount;
  }

  suggestions(when: When) {
    when(this.suggestionThresholds).addSuggestion((suggest, actual, recommended) =>
      suggest(
        <>
          {' '}
          Avoid casting <SpellLink id={SPELLS.IMMOLATION_AURA.id} /> when close to max Fury.
        </>,
      )
        .icon(SPELLS.IMMOLATION_AURA.icon)
        .actual(
          t({
            id: 'demonhunter.havoc.suggestions.immolationAura.furyWasted',
            message: `${formatPercentage(actual)}% Fury wasted`,
          }),
        )
        .recommended(`${formatPercentage(recommended)}% is recommended.`),
    );
  }

  statistic() {
    const effectiveFuryGain = this.furyGain - this.furyWaste;
    return (
      <Statistic
        size="flexible"
        category={STATISTIC_CATEGORY.TALENTS}
        tooltip={
          <>
            {formatThousands(this.damage)} Total damage
            <br />
            {effectiveFuryGain} Effective Fury gained
            <br />
            {this.furyGain} Total Fury gained
            <br />
            {this.furyWaste} Fury wasted
          </>
        }
      >
        <BoringSpellValueText spellId={SPELLS.IMMOLATION_AURA.id}>
          <>
            {this.furyPerMin} <small>Fury per min </small>
            <br />
            {this.owner.formatItemDamageDone(this.damage)}
          </>
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default ImmolationAura;
