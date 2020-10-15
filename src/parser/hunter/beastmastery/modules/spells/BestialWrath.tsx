import React from 'react';
import Analyzer, { SELECTED_PLAYER, Options } from 'parser/core/Analyzer';
import { When, ThresholdStyle } from 'parser/core/ParseResults';
import SpellUsable from 'parser/shared/modules/SpellUsable';
import SPELLS from 'common/SPELLS';
import RESOURCE_TYPES from 'game/RESOURCE_TYPES';
import STATISTIC_ORDER from 'interface/others/STATISTIC_ORDER';
import SpellIcon from 'common/SpellIcon';
import { formatNumber, formatPercentage } from 'common/format';
import SpellLink from 'common/SpellLink';
import ResourceIcon from 'common/ResourceIcon';
import Statistic from 'interface/statistics/Statistic';
import BoringSpellValueText from 'interface/statistics/components/BoringSpellValueText';
import UptimeIcon from 'interface/icons/Uptime';
import Events, { CastEvent } from 'parser/core/Events';
import { i18n } from '@lingui/core';
import { t } from '@lingui/macro';

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

  protected spellUsable!: SpellUsable;

  constructor(options: Options) {
    super(options);
    this.addEventListener(Events.cast.by(SELECTED_PLAYER).spell(SPELLS.BESTIAL_WRATH), this.onBestialWrathCast);
    this.addEventListener(Events.cast.by(SELECTED_PLAYER).spell(SPELLS.BARBED_SHOT), this.onBarbedShotCast);
  }

  get percentUptime() {
    return formatPercentage(this.selectedCombatant.getBuffUptime(SPELLS.BESTIAL_WRATH.id) / this.owner.fightDuration);
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
    const resource = event.classResources?.find(resource => resource.type === RESOURCE_TYPES.FOCUS.id);
    if (resource) {
      this.accumulatedFocusAtBWCast += resource.amount || 0;
    }

  }

  onBarbedShotCast() {
    const bestialWrathIsOnCooldown = this.spellUsable.isOnCooldown(SPELLS.BESTIAL_WRATH.id);
    if (bestialWrathIsOnCooldown) {
      const reductionMs = this.spellUsable.reduceCooldown(SPELLS.BESTIAL_WRATH.id, BARBED_SHOT_BESTIAL_WRATH_CDR_MS);
      this.effectiveBWReduction += reductionMs;
      this.wastedBWReduction += (BARBED_SHOT_BESTIAL_WRATH_CDR_MS - reductionMs);
    } else {
      this.wastedBWReduction += BARBED_SHOT_BESTIAL_WRATH_CDR_MS;
    }
  }

  suggestions(when: When) {
    when(this.focusOnBestialWrathCastThreshold).addSuggestion((suggest, actual, recommended) => suggest(<>You started your average <SpellLink id={SPELLS.BESTIAL_WRATH.id} /> at {formatNumber(this.averageFocusAtBestialWrathCast)} focus, try and pool a bit more before casting <SpellLink id={SPELLS.BESTIAL_WRATH.id} />. This can be achieved by not casting abilities a few moments before <SpellLink id={SPELLS.BESTIAL_WRATH.id} /> comes off cooldown.</>)
        .icon(SPELLS.BESTIAL_WRATH.icon)
        .actual(i18n._(t('hunter.beastmastery.suggestions.bestialWrath.focusPool.efficiency')`Average of ${formatNumber(this.averageFocusAtBestialWrathCast)} focus at start of Bestial Wrath`))
        .recommended(`>${recommended} focus is recommended`));
    when(this.cdrEfficiencyBestialWrathThreshold).addSuggestion((suggest, actual, recommended) => suggest(<>A crucial part of <SpellLink id={SPELLS.BARBED_SHOT.id} /> is the cooldown reduction of <SpellLink id={SPELLS.BESTIAL_WRATH.id} /> it provides. Therefore it's important to be casting <SpellLink id={SPELLS.BESTIAL_WRATH.id} /> as often as possible to ensure you'll be wasting as little potential cooldown reduction as possible.</>)
        .icon(SPELLS.BESTIAL_WRATH.icon)
        .actual(i18n._(t('hunter.beastmastery.suggestions.bestialWrath.cooldown.efficiency')`You had ${formatPercentage(actual)}% effective cooldown reduction of Bestial Wrath`))
        .recommended(`>${formatPercentage(recommended)}% is recommended`));
  }

  statistic() {
    return (
      <Statistic
        position={STATISTIC_ORDER.OPTIONAL(2)}
        size="flexible"
        dropdown={(
          <>
            <table className="table table-condensed">
              <thead>
                <tr>
                  <td className="text-left"><b>Statistic</b></td>
                  <td><b>Info</b></td>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="text-left">Average focus on cast</td>
                  <td><>{formatNumber(this.averageFocusAtBestialWrathCast)}
                    <ResourceIcon id={RESOURCE_TYPES.FOCUS.id} noLink /></>
                  </td>
                </tr>
                <tr>
                  <td className="text-left">Gained Bestial Wraths</td>
                  <td><>{this.gainedBestialWraths.toFixed(1)}
                    <SpellIcon id={SPELLS.BESTIAL_WRATH.id} /></>
                  </td>
                </tr>
                <tr>
                  <td className="text-left">CDR Efficiency</td>
                  <td><>{formatNumber(this.effectiveBWReduction /
                    1000)}s / {this.totalPossibleCDR / 1000}s
                  </>
                  </td>
                </tr>
                <tr>
                  <td className="text-left">CDR Efficiency %</td>
                  <td>{formatPercentage(this.effectiveBWReduction /
                    this.totalPossibleCDR)}%
                  </td>
                </tr>
              </tbody>
            </table>
          </>
        )}
      >
        <BoringSpellValueText spell={SPELLS.BESTIAL_WRATH}>
          <>
            <UptimeIcon /> {this.percentUptime}% <small>uptime</small>
          </>
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default BestialWrath;
