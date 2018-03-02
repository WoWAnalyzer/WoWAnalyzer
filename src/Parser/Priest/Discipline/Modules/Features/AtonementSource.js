import SPELLS from 'common/SPELLS';
import Analyzer from 'Parser/Core/Analyzer';

class AtonementSource extends Analyzer {
  _previousDamageEvent = null;
  _previousAtonementApplicator = null;
  _previousAtonementApplicatorEvent = null;

  // Spells that will apply atonement
  atonementApplicators = new Map([
    [SPELLS.POWER_WORD_RADIANCE.id, SPELLS.POWER_WORD_RADIANCE.atonementDuration],
    [SPELLS.POWER_WORD_SHIELD.id, SPELLS.POWER_WORD_SHIELD.atonementDuration],
    [SPELLS.PLEA.id, SPELLS.PLEA.atonementDuration],
    [SPELLS.SHADOW_MEND.id, SPELLS.SHADOW_MEND.atonementDuration],
  ]);

  // Spells / Items that do not generate atonement
  blacklist = [
    SPELLS.ENTROPIC_EMBRACE_DAMAGE.id, //Void Elf Racial
    SPELLS.COLLAPSE.id, //Ring of Collapsing Futures
  ];

  get atonementDuration() {
    return this.atonementApplicators;
  }

  get atonementDamageSource() {
    return this._previousDamageEvent;
  }

  get atonementApplicationSource() {
    return this._previousAtonementApplicator;
  }

  get atonementApplicationSourceEvent() {
    return this._previousAtonementApplicatorEvent;
  }

  on_byPlayer_heal(event) {
    if (this.atonementApplicators.has(event.ability.guid)) {
      this._previousAtonementApplicator = event.ability.guid;
      this._previousAtonementApplicatorEvent = event;
    }
  }

  on_byPlayer_applybuff(event) {
    if (this.atonementApplicators.has(event.ability.guid)) {
      this._previousAtonementApplicator = event.ability.guid;
      this._previousAtonementApplicatorEvent = event;
    }
  }

  on_damage(event) {
    if (!this.owner.byPlayer(event) && !this.owner.byPlayerPet(event)) {
      return;
    }

    if(this.blacklist.includes(event.ability.guid)){
      return;
    }

    // Some Atonement events have the type 'damage', this prevents them registering as a source
    if (event.ability.guid === SPELLS.ATONEMENT_HEAL_NON_CRIT.id) {
      return;
    }
    if (event.targetIsFriendly) {
      // Friendly fire doesn't atonement transfer - I think. The only place I could find this is Aura of Sacrifice so it might also be restricted by spells not owned by the player (even though the player is the damage source), but that seems less likely.
      return;
    }
    this._previousDamageEvent = event;
  }
}

export default AtonementSource;
