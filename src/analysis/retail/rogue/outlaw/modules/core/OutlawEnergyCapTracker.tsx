import { EnergyCapTracker } from 'analysis/retail/rogue/shared';
import TALENTS from 'common/TALENTS/rogue';
import { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { ApplyBuffEvent, RemoveBuffEvent } from 'parser/core/Events';

const ADRENALINE_RUSH_REGEN_MULTIPLIER = 1.6;

class OutlawEnergyCapTracker extends EnergyCapTracker {
  static buffsChangeMax = [TALENTS.ADRENALINE_RUSH_TALENT.id];
  static buffsChangeRegen = [TALENTS.ADRENALINE_RUSH_TALENT];

  constructor(options: Options) {
    super(options);
    this.addEventListener(
      Events.applybuff.by(SELECTED_PLAYER).spell(OutlawEnergyCapTracker.buffsChangeRegen),
      this.onRegenRateBuffsUpdate,
    );
    this.addEventListener(
      Events.removebuff.by(SELECTED_PLAYER).spell(OutlawEnergyCapTracker.buffsChangeRegen),
      this.onRegenRateBuffsUpdate,
    );
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

  private onRegenRateBuffsUpdate(event: ApplyBuffEvent | RemoveBuffEvent) {
    const adrenalineRushRegenRate = this.combatantHasBuffActive(
      TALENTS.ADRENALINE_RUSH_TALENT.id,
      event.timestamp,
    )
      ? ADRENALINE_RUSH_REGEN_MULTIPLIER
      : 1;
    this.energyTracker.triggerRateChange(
      this.energyTracker.baseRegen * this.energyTracker.vigorRegen * adrenalineRushRegenRate,
    );
  }
}

export default OutlawEnergyCapTracker;
