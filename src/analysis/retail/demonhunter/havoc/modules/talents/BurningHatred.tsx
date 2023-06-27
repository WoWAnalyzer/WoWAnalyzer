import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import DH_SPELLS from 'common/SPELLS/demonhunter';
import Events, { DamageEvent, ResourceChangeEvent } from 'parser/core/Events';
import { TALENTS_DEMON_HUNTER } from 'common/TALENTS';
import { ThresholdStyle, When } from 'parser/core/ParseResults';
import SpellLink from 'interface/SpellLink';
import { formatPercentage, formatThousands } from 'common/format';
import { defineMessage } from '@lingui/macro';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import TalentSpellText from 'parser/ui/TalentSpellText';

const IMMOLATION_AURA = [
  DH_SPELLS.IMMOLATION_AURA_INITIAL_HIT_DAMAGE,
  DH_SPELLS.IMMOLATION_AURA_BUFF_DAMAGE,
];
export default class BurningHatred extends Analyzer {
  furyGain = 0;
  furyWaste = 0;
  damage = 0;

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(TALENTS_DEMON_HUNTER.BURNING_HATRED_TALENT);
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
          Avoid casting <SpellLink spell={DH_SPELLS.IMMOLATION_AURA} /> when close to max Fury.
        </>,
      )
        .icon(DH_SPELLS.IMMOLATION_AURA.icon)
        .actual(
          defineMessage({
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
        <TalentSpellText talent={TALENTS_DEMON_HUNTER.BURNING_HATRED_TALENT}>
          {this.furyPerMin} <small>Fury per min</small>
        </TalentSpellText>
      </Statistic>
    );
  }
}
