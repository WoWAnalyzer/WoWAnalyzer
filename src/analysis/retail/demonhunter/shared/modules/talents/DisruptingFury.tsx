import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import { TALENTS_DEMON_HUNTER } from 'common/TALENTS/demonhunter';
import Events, { ResourceChangeEvent } from 'parser/core/Events';
import SPELLS from 'common/SPELLS/demonhunter';
import { ThresholdStyle, When } from 'parser/core/ParseResults';
import { SpellLink } from 'interface';
import { t } from '@lingui/macro';
import { formatPercentage } from 'common/format';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';

export default class SwallowedAnger extends Analyzer {
  furyGain = 0;
  furyWaste = 0;

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(TALENTS_DEMON_HUNTER.DISRUPTING_FURY_TALENT);
    if (!this.active) {
      return;
    }
    this.addEventListener(
      Events.resourcechange.by(SELECTED_PLAYER).spell(SPELLS.DISRUPTING_FURY_FURY_GEN),
      this.onEnergizeEvent,
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

  suggestions(when: When) {
    when(this.suggestionThresholds).addSuggestion((suggest, actual, recommended) =>
      suggest(
        <>
          Avoid casting <SpellLink id={SPELLS.DISRUPT.id} /> close to Fury cap and cast abilities
          regularly to avoid accidently capping your fury.
        </>,
      )
        .icon(TALENTS_DEMON_HUNTER.DISRUPTING_FURY_TALENT.icon)
        .actual(
          t({
            id: 'demonhunter.shared.suggestions.disrupt.furyWasted',
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
            {effectiveFuryGain} Effective Fury gained
            <br />
            {this.furyGain} Total Fury gained
            <br />
            {this.furyWaste} Fury wasted
          </>
        }
      >
        <BoringSpellValueText spellId={TALENTS_DEMON_HUNTER.DISRUPTING_FURY_TALENT.id}>
          <>
            {this.furyPerMin} <small>Fury per min</small>
          </>
        </BoringSpellValueText>
      </Statistic>
    );
  }
}
