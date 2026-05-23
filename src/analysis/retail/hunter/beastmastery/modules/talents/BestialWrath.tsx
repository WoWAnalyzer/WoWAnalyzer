import { formatPercentage } from 'common/format';
import TALENTS from 'common/TALENTS/hunter';
import UptimeIcon from 'interface/icons/Uptime';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { CastEvent } from 'parser/core/Events';
import { ThresholdStyle } from 'parser/core/ParseResults';
import SpellUsable from 'parser/shared/modules/SpellUsable';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';

import { BARBED_SHOT_BESTIAL_WRATH_CDR_MS, BESTIAL_WRATH_BASE_CD } from '../../constants';

/**
 * Sends you and your pet into a rage, increasing all damage you both deal by 25% for 15 sec. Bestial Wrath's remaining cooldown is reduced by 12 sec each time you use Barbed Shot
 *
 * Example log:
 * https://www.warcraftlogs.com/reports/bf3r17Yh86VvDLdF#fight=8&type=auras&source=1&ability=19574
 */
class BestialWrath extends Analyzer {
  static dependencies = {
    spellUsable: SpellUsable,
  };

  effectiveBWReduction = 0;
  wastedBWReduction = 0;
  casts = 0;

  protected spellUsable!: SpellUsable;

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

  get gainedBestialWraths() {
    return this.effectiveBWReduction / BESTIAL_WRATH_BASE_CD;
  }

  get totalPossibleCDR() {
    return this.wastedBWReduction + this.effectiveBWReduction;
  }

  get effectiveBestialWrathCDRPercent() {
    return this.effectiveBWReduction / this.totalPossibleCDR;
  }

  get cdrEfficiencyBestialWrathThreshold() {
    return {
      actual: this.effectiveBWReduction / this.totalPossibleCDR,
      isLessThan: {
        minor: 0.95,
        average: 0.9,
        major: 0.85,
      },
      style: ThresholdStyle.PERCENTAGE,
    };
  }

  onBestialWrathCast(event: CastEvent) {
    this.casts += 1;
  }

  onBarbedShotCast() {
    const bestialWrathIsOnCooldown = this.spellUsable.isOnCooldown(TALENTS.BESTIAL_WRATH_TALENT.id);
    if (bestialWrathIsOnCooldown) {
      const reductionMs = this.spellUsable.reduceCooldown(
        TALENTS.BESTIAL_WRATH_TALENT.id,
        BARBED_SHOT_BESTIAL_WRATH_CDR_MS,
      );
      this.effectiveBWReduction += reductionMs;
      this.wastedBWReduction += BARBED_SHOT_BESTIAL_WRATH_CDR_MS - reductionMs;
    } else {
      this.wastedBWReduction += BARBED_SHOT_BESTIAL_WRATH_CDR_MS;
    }
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
