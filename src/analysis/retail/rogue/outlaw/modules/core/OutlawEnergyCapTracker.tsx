import { EnergyCapTracker } from 'analysis/retail/rogue/shared';
import TALENTS from 'common/TALENTS/rogue';
import { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { AnyEvent } from 'parser/core/Events';

const BASE_MAX_ENERGY = 100;
const VIGOR_MAX_ENERGY_PER_RANK = 50;
const COMBAT_POTENCY_REGEN_MULTIPLIER = 1.16;
const ADRENALINE_RUSH_REGEN_MULTIPLIER = 1.75;
const ADRENALINE_RUSH_MAX_ENERGY_BONUS = 50;

class OutlawEnergyCapTracker extends EnergyCapTracker {
  private readonly baseMaxEnergy =
    BASE_MAX_ENERGY +
    this.selectedCombatant.getTalentRank(TALENTS.VIGOR_TALENT) * VIGOR_MAX_ENERGY_PER_RANK;

  private readonly combatPotencyRegen = this.selectedCombatant.hasTalent(
    TALENTS.COMBAT_POTENCY_TALENT,
  )
    ? COMBAT_POTENCY_REGEN_MULTIPLIER
    : 1;

  constructor(options: Options) {
    super(options);

    this.addEventListener(Events.any.by(SELECTED_PLAYER), this.onEvent);
  }

  combatantHasBuffActive(buffId: number, pTimestamp: number | null = null) {
    if (!buffId || isNaN(buffId)) {
      throw new Error(
        `combatantHasBuffActive called without required parameter. buffId: ${buffId}`,
      );
    }
    const timestamp = pTimestamp ?? this.owner.currentTimestamp;
    const buffHistory = this.selectedCombatant.getBuffHistory(buffId);
    return Boolean(
      buffHistory.find((buff) => buff.start <= timestamp && (!buff.end || buff.end > timestamp)),
    );
  }

  private onEvent(event: AnyEvent) {
    const adrenalineRushActive = this.combatantHasBuffActive(
      TALENTS.ADRENALINE_RUSH_TALENT.id,
      event.timestamp,
    );

    this.energyTracker.maxResource =
      this.baseMaxEnergy + (adrenalineRushActive ? ADRENALINE_RUSH_MAX_ENERGY_BONUS : 0);

    const regenRate =
      this.energyTracker.baseRegen *
      this.energyTracker.vigorRegen *
      this.combatPotencyRegen *
      (adrenalineRushActive ? ADRENALINE_RUSH_REGEN_MULTIPLIER : 1);

    // Guarded: triggerRateChange records a resource update every time it is called.
    if (this.energyTracker.baseRegenRate !== regenRate) {
      this.energyTracker.triggerRateChange(regenRate);
    }
  }
}

export default OutlawEnergyCapTracker;
