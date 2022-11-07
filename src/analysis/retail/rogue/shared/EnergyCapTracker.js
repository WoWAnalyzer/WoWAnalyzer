import { t } from '@lingui/macro';
import { formatDuration, formatPercentage } from 'common/format';
import TALENTS from 'common/TALENTS/rogue';
import RESOURCE_TYPES from 'game/RESOURCE_TYPES';
import { Icon } from 'interface';
import { Tooltip } from 'interface';
import RegenResourceCapTracker from 'parser/shared/modules/resources/resourcetracker/RegenResourceCapTracker';
import StatisticBox, { STATISTIC_ORDER } from 'parser/ui/StatisticBox';

import SpellEnergyCost from './SpellEnergyCost';

const BASE_ENERGY_REGEN = 10;
const VIGOR_REGEN_MULTIPLIER = 1.1;

const BASE_ENERGY_MAX = 100;
const VIGOR_MAX_ADDITION = 50;

const RESOURCE_REFUND_ON_MISS = 0.8;

/**
 * Sets up RegenResourceCapTracker to accurately track the regenerating energy of rogues.
 * Taking into account the effect of buffs, talents, and items on the energy cost of abilities,
 * the maximum energy amount, and the regeneration rate.
 */
class EnergyCapTracker extends RegenResourceCapTracker {
  get wastedPercent() {
    return this.missedRegen / this.naturalRegen || 0;
  }

  get suggestionThresholds() {
    return {
      actual: 1 - this.wastedPercent,
      isLessThan: {
        minor: 0.95,
        average: 0.9,
        major: 0.8,
      },
      style: 'percentage',
    };
  }

  static dependencies = {
    ...RegenResourceCapTracker.dependencies,
    // Needed for the `resourceCost` prop of events
    spellResourceCost: SpellEnergyCost,
  };
  static resourceType = RESOURCE_TYPES.ENERGY;
  static baseRegenRate = BASE_ENERGY_REGEN;
  static isRegenHasted = true;
  static cumulativeEventWindow = 400;
  static resourceRefundOnMiss = RESOURCE_REFUND_ON_MISS;
  static exemptFromRefund = [];

  naturalRegenRate() {
    let regen = super.naturalRegenRate();
    if (this.selectedCombatant.hasTalent(TALENTS.VIGOR_TALENT.id)) {
      regen *= VIGOR_REGEN_MULTIPLIER;
    }
    return regen;
  }

  currentMaxResource() {
    let max = BASE_ENERGY_MAX;
    if (this.selectedCombatant.hasTalent(TALENTS.VIGOR_TALENT.id)) {
      max += VIGOR_MAX_ADDITION;
    }
    // What should be x.5 becomes x in-game.
    return Math.floor(max);
  }

  suggestions(when) {
    when(this.suggestionThresholds).addSuggestion((suggest, actual, recommended) =>
      suggest(
        <>
          You're allowing your energy to reach its cap. While at its maximum value you miss out on
          the energy that would have regenerated. Although it can be beneficial to let energy pool
          ready to be used at the right time, try to spend some before it reaches the cap.
        </>,
      )
        .icon('spell_shadow_shadowworddominate')
        .actual(
          t({
            id: 'rogue.shared.suggestions.energy.capped',
            message: `${actual.toFixed(1)} regenerated energy lost per minute due to being capped.`,
          }),
        )
        .recommended(`<${recommended} is recommended.`),
    );
  }

  statistic() {
    return (
      <StatisticBox
        position={STATISTIC_ORDER.CORE(1)}
        icon={<Icon icon="spell_shadow_shadowworddominate" alt="Capped Energy" />}
        value={`${formatPercentage(this.wastedPercent)} %`}
        label="Wasted energy from being capped"
        tooltip={
          <>
            Although it can be beneficial to wait and let your energy pool ready to be used at the
            right time, you should still avoid letting it reach the cap.
            <br />
            You spent <strong>{formatPercentage(this.cappedProportion)}%</strong> of the fight at
            capped energy, causing you to miss out on a total of{' '}
            <strong>{this.missedRegen.toFixed(0)}</strong> energy from regeneration.
          </>
        }
        footer={
          <div className="statistic-box-bar">
            <Tooltip
              content={`Not at capped energy for ${formatDuration(
                this.owner.fightDuration - this.atCap,
              )}`}
            >
              <div
                className="stat-healing-bg"
                style={{ width: `${(1 - this.cappedProportion) * 100}%` }}
              >
                <img src="/img/sword.png" alt="Uncapped Energy" />
              </div>
            </Tooltip>

            <Tooltip content={`At capped energy for ${formatDuration(this.atCap)}`}>
              <div className="remainder DeathKnight-bg">
                <img src="/img/overhealing.png" alt="Capped Energy" />
              </div>
            </Tooltip>
          </div>
        }
      />
    );
  }
}

export default EnergyCapTracker;
