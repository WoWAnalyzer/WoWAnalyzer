import { RAGE_SCALE_FACTOR } from 'analysis/retail/druid/guardian/modules/core/rage/RageTracker';
import SPELLS from 'common/SPELLS';
import TALENTS from 'common/TALENTS/warrior';
import HIT_TYPES from 'game/HIT_TYPES';
import RESOURCE_TYPES from 'game/RESOURCE_TYPES';
import { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { ResourceChangeEvent } from 'parser/core/Events';
import ResourceTracker from 'parser/shared/modules/resources/resourcetracker/ResourceTracker';

// https://wowpedia.fandom.com/wiki/Rage
const MH_AUTO_ATTACK_RAGE_PS = 1.75;
const OH_AUTO_ATTACK_RAGE_PS = 0.875;
const DEFAULT_SPEED_2H = 3.6;
const DEFAULT_SPEED_1H = 2.6;

class RageTracker extends ResourceTracker {
  vengeanceRageSaved: number = 0;
  lastMeleeTaken: number = 0;

  maxResource: number = 100 / RAGE_SCALE_FACTOR;

  constructor(options: Options) {
    super(options);
    this.resource = RESOURCE_TYPES.RAGE;

    // Add 15 rage for each rank of Overwhelming Rage, adjust for scale factor
    this.maxResource +=
      this.selectedCombatant.getTalentRank(TALENTS.OVERWHELMING_RAGE_TALENT) *
      (15 / RAGE_SCALE_FACTOR);

    this.setupAutoAttackRage();
  }

  private setupAutoAttackRage() {
    // While it would be nice to look at the speed or slot for weapons, I don't know if that's possible
    // so we'll just make the assumption that they have specced correctly if they are using 1h weapons
    const using1H = this.selectedCombatant.hasTalent(TALENTS.SINGLE_MINDED_FURY_TALENT);
    let MhAutoAttackRagePerSwing =
      MH_AUTO_ATTACK_RAGE_PS * (using1H ? DEFAULT_SPEED_1H : DEFAULT_SPEED_2H);
    let OhAutoATtackRagePerSwing =
      OH_AUTO_ATTACK_RAGE_PS * (using1H ? DEFAULT_SPEED_1H : DEFAULT_SPEED_2H);

    if (this.selectedCombatant.hasTalent(TALENTS.WAR_MACHINE_FURY_TALENT)) {
      MhAutoAttackRagePerSwing *= 1.2;
      OhAutoATtackRagePerSwing *= 1.2;
    }

    // As a side note, Annihilator rage triggers as energize event, so we don't need to worry about it here
    // https://www.warcraftlogs.com/reports/N9bWqMnrakAjZdJB#fight=2&type=resources&source=103&spell=101

    // WCL doesn't tell if the attack was MH or OH, so we'll just average the two
    const AutoAtackRagePerSwing = (MhAutoAttackRagePerSwing + OhAutoATtackRagePerSwing) / 2;

    this.addEventListener(Events.damage.by(SELECTED_PLAYER).spell(SPELLS.MELEE), (event) => {
      if (
        event.hitType === HIT_TYPES.MISS ||
        event.hitType === HIT_TYPES.PARRY ||
        event.hitType === HIT_TYPES.DODGE
      ) {
        return;
      }

      const reck = this.selectedCombatant.hasBuff(SPELLS.RECKLESSNESS.id, event.timestamp);

      this.processInvisibleEnergize(
        SPELLS.RAGE_AUTO_ATTACKS.id,
        (AutoAtackRagePerSwing * (reck ? 2 : 1)) / RAGE_SCALE_FACTOR,
        event.timestamp,
      );
    });
  }

  /** All rage amounts multiplied by 10 - except gain and waste for some reason */
  getAdjustedGain(event: ResourceChangeEvent): { gain: number; waste: number } {
    const baseGain = super.getAdjustedGain(event);
    return { gain: baseGain.gain / RAGE_SCALE_FACTOR, waste: baseGain.waste / RAGE_SCALE_FACTOR };
  }
}

export default RageTracker;
