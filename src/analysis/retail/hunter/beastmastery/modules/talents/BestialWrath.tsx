
import { formatNumber, formatPercentage } from 'common/format';
import TALENTS from 'common/TALENTS/hunter';
import RESOURCE_TYPES from 'game/RESOURCE_TYPES';
import { SpellIcon } from 'interface';
import { SpellLink } from 'interface';
import { ResourceIcon } from 'interface';
import UptimeIcon from 'interface/icons/Uptime';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { CastEvent } from 'parser/core/Events';
import { ThresholdStyle, When } from 'parser/core/ParseResults';
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
  accumulatedFocusAtBWCast = 0;
  hasBarbedWrath = false;

  protected spellUsable!: SpellUsable;

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(TALENTS.BESTIAL_WRATH_TALENT);
    this.hasBarbedWrath = this.selectedCombatant.hasTalent(TALENTS.BARBED_WRATH_TALENT);
    this.addEventListener(
      Events.cast.by(SELECTED_PLAYER).spell(TALENTS.BESTIAL_WRATH_TALENT),
      this.onBestialWrathCast,
    );
    this.hasBarbedWrath &&
      this.addEventListener(
        Events.cast.by(SELECTED_PLAYER).spell(TALENTS.BARBED_SHOT_TALENT),
        this.onBarbedShotCast,
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

  get averageFocusAtBestialWrathCast() {
    return this.accumulatedFocusAtBWCast / this.casts;
  }

  get totalPossibleCDR() {
    return this.wastedBWReduction + this.effectiveBWReduction;
  }

  get effectiveBestialWrathCDRPercent() {
    return this.effectiveBWReduction / this.totalPossibleCDR;
  }

  get focusOnBestialWrathCastThreshold() {
    return {
      actual: this.averageFocusAtBestialWrathCast,
      isLessThan: {
        minor: 40,
        average: 30,
        major: 20,
      },
      style: ThresholdStyle.NUMBER,
    };
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
    const resource = event.classResources?.find(
      (resource) => resource.type === RESOURCE_TYPES.FOCUS.id,
    );
    if (resource) {
      this.accumulatedFocusAtBWCast += resource.amount || 0;
    }
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

  suggestions(when: When) {
    when(this.focusOnBestialWrathCastThreshold).addSuggestion((suggest, _actual, recommended) =>
      suggest(
        <>
          You started your average <SpellLink id={TALENTS.BESTIAL_WRATH_TALENT.id} /> at{' '}
          {formatNumber(this.averageFocusAtBestialWrathCast)} focus, try and pool a bit more before
          casting <SpellLink id={TALENTS.BESTIAL_WRATH_TALENT.id} />. This can be achieved by not
          casting abilities a few moments before <SpellLink id={TALENTS.BESTIAL_WRATH_TALENT.id} />{' '}
          comes off cooldown.
        </>,
      )
        .icon(TALENTS.BESTIAL_WRATH_TALENT.icon)
        .actual(
          <>
            {' '}
            Average of {formatNumber(this.averageFocusAtBestialWrathCast)} focus at start of Bestial
            Wrath{' '}
          </>,
        )
        .recommended(
          <>
            {' '}
            {'>'}
            {recommended} focus is recommended{' '}
          </>,
        ),
    );
    when(this.cdrEfficiencyBestialWrathThreshold).addSuggestion((suggest, actual, recommended) =>
      suggest(
        <>
          A crucial part of <SpellLink id={TALENTS.BARBED_SHOT_TALENT.id} /> is the cooldown
          reduction of <SpellLink id={TALENTS.BESTIAL_WRATH_TALENT.id} /> it provides. Therefore
          it's important to be casting <SpellLink id={TALENTS.BESTIAL_WRATH_TALENT.id} /> as often
          as possible to ensure you'll be wasting as little potential cooldown reduction as
          possible.
        </>,
      )
        .icon(TALENTS.BESTIAL_WRATH_TALENT.icon)
        .actual(
          <>
            You had {formatPercentage(actual)}% effective cooldown reduction of Bestial Wrath
          </>,
        )
        .recommended(
          <>
            {' '}
            {'>'}
            {formatPercentage(recommended)}% is recommended
          </>,
        ),
    );
  }

  statistic() {
    return (
      <Statistic
        position={STATISTIC_ORDER.OPTIONAL(2)}
        size="flexible"
        dropdown={
          <>
            <table className="table table-condensed">
              <thead>
                <tr>
                  <td className="text-left">
                    <b>Statistic</b>
                  </td>
                  <td>
                    <b>Info</b>
                  </td>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="text-left">Average focus on cast</td>
                  <td>
                    <>
                      {formatNumber(this.averageFocusAtBestialWrathCast)}
                      <ResourceIcon id={RESOURCE_TYPES.FOCUS.id} noLink />
                    </>
                  </td>
                </tr>
                {this.hasBarbedWrath && (
                  <>
                    <tr>
                      <td className="text-left">Gained Bestial Wraths</td>
                      <td>
                        <>
                          {this.gainedBestialWraths.toFixed(1)}
                          <SpellIcon id={TALENTS.BESTIAL_WRATH_TALENT.id} />
                        </>
                      </td>
                    </tr>
                    <tr>
                      <td className="text-left">CDR Efficiency</td>
                      <td>
                        <>
                          {formatNumber(this.effectiveBWReduction / 1000)}s /{' '}
                          {this.totalPossibleCDR / 1000}s
                        </>
                      </td>
                    </tr>
                    <tr>
                      <td className="text-left">CDR Efficiency %</td>
                      <td>
                        {formatPercentage(this.effectiveBWReduction / this.totalPossibleCDR)}%
                      </td>
                    </tr>
                  </>
                )}
              </tbody>
            </table>
          </>
        }
      >
        <BoringSpellValueText spellId={TALENTS.BESTIAL_WRATH_TALENT.id}>
          <>
            <UptimeIcon /> {this.percentUptime}% <small>uptime</small>
          </>
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default BestialWrath;
