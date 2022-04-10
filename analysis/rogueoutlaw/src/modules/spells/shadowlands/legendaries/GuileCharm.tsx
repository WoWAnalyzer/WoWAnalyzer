import { formatPercentage } from 'common/format';
import SPELLS from 'common/SPELLS';
import { SpellIcon } from 'interface';
import Analyzer, { Options } from 'parser/core/Analyzer';
import Abilities from 'parser/core/modules/Abilities';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import Statistic from 'parser/ui/Statistic';

class GuileCharm extends Analyzer {
  static dependencies = {
    abilities: Abilities,
  };

  deepInsightUptime: number = 0;
  moderateInsightUptime: number = 0;
  shallowInsightUptime: number = 0;
  protected abilities!: Abilities;

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasLegendary(SPELLS.GUILE_CHARM);
  }

  get percentUptime() {
    this.shallowInsightUptime =
      this.selectedCombatant.getBuffUptime(SPELLS.SHALLOW_INSIGHT_BUFF.id) /
      this.owner.fightDuration;
    this.moderateInsightUptime =
      this.selectedCombatant.getBuffUptime(SPELLS.MODERATE_INSIGHT_BUFF.id) /
      this.owner.fightDuration;
    this.deepInsightUptime =
      this.selectedCombatant.getBuffUptime(SPELLS.DEEP_INSIGHT_BUFF.id) / this.owner.fightDuration;
    return {
      shallowInsight: this.shallowInsightUptime,
      moderateInsight: this.moderateInsightUptime,
      deepInsight: this.deepInsightUptime,
    };
  }

  statistic() {
    return (
      <Statistic
        size="flexible"
        tooltip="This measures how long each buff from this legendary is active."
      >
        <BoringSpellValueText spellId={SPELLS.GUILE_CHARM.id}>
          <SpellIcon id={SPELLS.SHALLOW_INSIGHT_BUFF.id} />{' '}
          {formatPercentage(this.percentUptime.shallowInsight)}%{' '}
          <small>Shallow Insight uptime</small>
          <br />
          <SpellIcon id={SPELLS.MODERATE_INSIGHT_BUFF.id} />{' '}
          {formatPercentage(this.percentUptime.moderateInsight)}%{' '}
          <small>Moderate Insight uptime</small>
          <br />
          <SpellIcon id={SPELLS.DEEP_INSIGHT_BUFF.id} />{' '}
          {formatPercentage(this.percentUptime.deepInsight)}% <small>Deep Insight uptime</small>
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default GuileCharm;
