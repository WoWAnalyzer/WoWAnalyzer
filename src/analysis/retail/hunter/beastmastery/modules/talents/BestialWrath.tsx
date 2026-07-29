import { formatPercentage } from 'common/format';
import TALENTS from 'common/TALENTS/hunter';
import UptimeIcon from 'interface/icons/Uptime';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { CastEvent } from 'parser/core/Events';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';

/**
 * Sends you and your pet into a rage, increasing all damage you both deal by 25% for 15 sec.
 */
class BestialWrath extends Analyzer {
  casts = 0;

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(TALENTS.BESTIAL_WRATH_TALENT);
    this.addEventListener(
      Events.cast.by(SELECTED_PLAYER).spell(TALENTS.BESTIAL_WRATH_TALENT),
      this.onBestialWrathCast,
    );
  }

  get percentUptime() {
    return formatPercentage(
      this.selectedCombatant.getBuffUptime(TALENTS.BESTIAL_WRATH_TALENT.id) /
        this.owner.fightDuration,
    );
  }

  onBestialWrathCast(event: CastEvent) {
    this.casts += 1;
  }

  statistic() {
    return (
      <Statistic position={STATISTIC_ORDER.OPTIONAL(2)} size="flexible">
        <BoringSpellValueText spell={TALENTS.BESTIAL_WRATH_TALENT}>
          <>
            <UptimeIcon /> {this.percentUptime}% <small>uptime</small>
          </>
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default BestialWrath;
