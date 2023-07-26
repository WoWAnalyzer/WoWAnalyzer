import Analyzer, { Options } from 'parser/core/Analyzer';
import { TALENTS_DEMON_HUNTER } from 'common/TALENTS';
import SPELLS from 'common/SPELLS/demonhunter';
import { ThresholdStyle, When } from 'parser/core/ParseResults';
import { SpellLink } from 'interface';
import { formatDuration, formatPercentage } from 'common/format';
import Statistic from 'parser/ui/Statistic';
import UptimeIcon from 'interface/icons/Uptime';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import TalentSpellText from 'parser/ui/TalentSpellText';

export default class TacticalRetreat extends Analyzer {
  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(TALENTS_DEMON_HUNTER.TACTICAL_RETREAT_TALENT);
  }

  get buffUptime() {
    return (
      this.selectedCombatant.getBuffUptime(SPELLS.TACTICAL_RETREAT_BUFF.id) /
      this.owner.fightDuration
    );
  }

  get buffDuration() {
    return this.selectedCombatant.getBuffUptime(SPELLS.TACTICAL_RETREAT_BUFF.id);
  }

  get suggestionThresholds() {
    return {
      actual: this.buffUptime,
      isLessThan: {
        minor: 0.55,
        average: 0.45,
        major: 0.4,
      },
      style: ThresholdStyle.PERCENTAGE,
    };
  }

  suggestions(when: When) {
    when(this.suggestionThresholds).addSuggestion((suggest, actual, recommended) =>
      suggest(
        <>
          {' '}
          Maintain the <SpellLink spell={TALENTS_DEMON_HUNTER.TACTICAL_RETREAT_TALENT} /> buff to
          maximize damage.
        </>,
      )
        .icon(TALENTS_DEMON_HUNTER.TACTICAL_RETREAT_TALENT.icon)
        .actual(`${formatPercentage(actual)}% buff uptime`)
        .recommended(`${formatPercentage(recommended)}% is recommended.`),
    );
  }

  statistic() {
    return (
      <Statistic
        category={STATISTIC_CATEGORY.TALENTS}
        size="flexible"
        tooltip={`The Tactical Retreat buff total uptime was ${formatDuration(this.buffDuration)}.`}
      >
        <TalentSpellText talent={TALENTS_DEMON_HUNTER.TACTICAL_RETREAT_TALENT}>
          <UptimeIcon /> {formatPercentage(this.buffUptime)}% <small>uptime</small>
        </TalentSpellText>
      </Statistic>
    );
  }
}
