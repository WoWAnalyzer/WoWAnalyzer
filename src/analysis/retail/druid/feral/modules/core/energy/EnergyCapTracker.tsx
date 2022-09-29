import { t } from '@lingui/macro';
import { formatPercentage, formatDuration } from 'common/format';
import SPELLS from 'common/SPELLS';
import RESOURCE_TYPES from 'game/RESOURCE_TYPES';
import { Icon, Tooltip } from 'interface';
import { ThresholdStyle, When } from 'parser/core/ParseResults';
import RegenResourceCapTracker from 'parser/shared/modules/resources/resourcetracker/RegenResourceCapTracker';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';
import StatisticBox from 'parser/ui/StatisticBox';

import SpellEnergyCost from 'analysis/retail/druid/feral/modules/core/energy/SpellEnergyCost';
import { TALENTS_DRUID } from 'common/TALENTS';

const BASE_ENERGY_REGEN = 11; // TODO 11 instead of 10 due to a baked in bonus from BFA ... double check still active for DF
const BASE_ENERGY_MAX = 100;
const TIRELESS_ENERGY_ADD = 30;
const RESOURCE_REFUND_ON_MISS = 0.8;

/**
 * Energy Regen / Cap tracker for Feral.
 *
 * No need to override getReducedDrain:
 * Reduced drain cost from Berserk/Incarnation on Ferocious Bite is already applied in the log.
 */
class EnergyCapTracker extends RegenResourceCapTracker {
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
  static exemptFromRefund = [
    SPELLS.THRASH_FERAL.id,
    SPELLS.SWIPE_CAT.id,
    TALENTS_DRUID.BRUTAL_SLASH_FERAL_TALENT.id,
  ];

  get percentNotCapped() {
    return (this.naturalRegen - this.missedRegen) / this.naturalRegen;
  }

  get percentCapped() {
    return this.missedRegen / this.naturalRegen;
  }

  get suggestionThresholds() {
    return {
      actual: this.percentCapped,
      isGreaterThan: {
        minor: 0.05,
        average: 0.15,
        major: 0.3,
      },
      style: ThresholdStyle.PERCENTAGE,
    };
  }

  currentMaxResource() {
    return (
      BASE_ENERGY_MAX +
      this.selectedCombatant.getTalentRank(TALENTS_DRUID.TIRELESS_ENERGY_FERAL_TALENT) *
        TIRELESS_ENERGY_ADD
    );
  }

  suggestions(when: When) {
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
            id: 'druid.feral.suggestions.energy.efficiency',
            message: `${formatPercentage(
              actual,
            )}% regenerated energy lost per minute due to being capped.`,
          }),
        )
        .recommended(`<${formatPercentage(recommended)}% is recommended.`),
    );
  }

  statistic() {
    return (
      <StatisticBox
        position={STATISTIC_ORDER.CORE(2)}
        icon={<Icon icon="spell_shadow_shadowworddominate" alt="Capped Energy" />}
        value={`${formatPercentage(this.cappedProportion)}%`}
        label="Time with capped energy"
        tooltip={
          <>
            Although it can be beneficial to wait and let your energy pool ready to be used at the
            right time, you should still avoid letting it reach the cap.
            <br />
            You spent <b>{formatPercentage(this.cappedProportion)}%</b> of the fight at capped
            energy, causing you to miss out on <b>{this.missedRegenPerMinute.toFixed(1)}</b> energy
            per minute from regeneration.
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
