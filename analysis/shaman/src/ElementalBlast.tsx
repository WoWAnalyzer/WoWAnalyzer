import { formatPercentage } from 'common/format';
import SPELLS from 'common/SPELLS';
import Uptime from 'interface/icons/Uptime';
import Analyzer, { Options } from 'parser/core/Analyzer';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import { STATISTIC_ORDER } from 'parser/ui/StatisticBox';

/**
 * https://www.warcraftlogs.com/reports/Fp7tKcmzgCfRy61n/#fight=24&source=62&type=auras
 */
class ElementalBlast extends Analyzer {
  constructor(options: Options) {
    super(options);

    this.active = this.selectedCombatant.hasTalent(SPELLS.ELEMENTAL_BLAST_TALENT.id);
  }

  get critUptime() {
    return (
      this.selectedCombatant.getBuffUptime(SPELLS.ELEMENTAL_BLAST_CRIT.id) /
      this.owner.fightDuration
    );
  }

  get hasteUptime() {
    return (
      this.selectedCombatant.getBuffUptime(SPELLS.ELEMENTAL_BLAST_HASTE.id) /
      this.owner.fightDuration
    );
  }

  get masteryUptime() {
    return (
      this.selectedCombatant.getBuffUptime(SPELLS.ELEMENTAL_BLAST_MASTERY.id) /
      this.owner.fightDuration
    );
  }

  get totalUptime() {
    return this.critUptime + this.hasteUptime + this.masteryUptime;
  }

  statistic() {
    return (
      <Statistic
        position={STATISTIC_ORDER.OPTIONAL()}
        category={STATISTIC_CATEGORY.TALENTS}
        size="flexible"
        tooltip={
          <>
            <span className="stat-criticalstrike">
              <strong>{formatPercentage(this.critUptime)}% Crit</strong>
            </span>
            <br />
            <span className="stat-haste">
              <strong>{formatPercentage(this.hasteUptime)}% Haste</strong>
            </span>
            <br />
            <span className="stat-mastery">
              <strong>{formatPercentage(this.masteryUptime)}% Mastery</strong>
            </span>
          </>
        }
      >
        <BoringSpellValueText spellId={SPELLS.ELEMENTAL_BLAST_TALENT.id}>
          <Uptime /> {formatPercentage(this.totalUptime)}% <small>uptime</small>
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default ElementalBlast;
