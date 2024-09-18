import { formatDuration, formatPercentage } from 'common/format';
import RESOURCE_TYPES from 'game/RESOURCE_TYPES';
import { Icon, Tooltip } from 'interface';
import RegenResourceCapTracker from 'parser/shared/modules/resources/resourcetracker/RegenResourceCapTracker';
import StatisticBox, { STATISTIC_ORDER } from 'parser/ui/StatisticBox';
import { TALENTS_MONK } from 'common/TALENTS';

const BASE_ENERGY_REGEN = 10;
const ASCENSION_REGEN_MULTIPLIER = 1.1;

export const BASE_ENERGY_MAX = 100;
export const ASCENSION_ENERGY_MAX_ADDITION = 20;
export const INNER_PEACE_ENERGY_MAX_ADDITION = 30;

const RESOURCE_REFUND_ON_MISS = 0.8;

/**
 * Sets up RegenResourceCapTracker to accurately track the regenerating energy of a Windwalker monk.
 * Taking into account the effect of buffs, talents, and items on the energy cost of abilities,
 * the maximum energy amount, and the regeneration rate.
 * Note that some cost reduction effects are already accounted for in the log.
 */
class EnergyCapTracker extends RegenResourceCapTracker {
  static resourceType = RESOURCE_TYPES.ENERGY;
  static baseRegenRate = BASE_ENERGY_REGEN;
  static isRegenHasted = true;
  static cumulativeEventWindow = 400;
  static resourceRefundOnMiss = RESOURCE_REFUND_ON_MISS;
  static buffsChangeRegen = [];

  naturalRegenRate() {
    let regen = super.naturalRegenRate();
    if (this.selectedCombatant.hasTalent(TALENTS_MONK.ASCENSION_TALENT)) {
      regen *= ASCENSION_REGEN_MULTIPLIER;
    }
    return regen;
  }

  currentMaxResource() {
    let max = BASE_ENERGY_MAX;
    if (this.selectedCombatant.hasTalent(TALENTS_MONK.ASCENSION_TALENT)) {
      max += ASCENSION_ENERGY_MAX_ADDITION;
    }
    if (this.selectedCombatant.hasTalent(TALENTS_MONK.INNER_PEACE_TALENT)) {
      max += INNER_PEACE_ENERGY_MAX_ADDITION;
    }
    // What should be x.5 becomes x in-game.
    return Math.floor(max);
  }

  statistic() {
    return (
      <StatisticBox
        position={STATISTIC_ORDER.CORE(8)}
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
                (this.owner.fightDuration - this.atCap) / 1000,
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
